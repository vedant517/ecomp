import Razorpay from 'razorpay';
import crypto from 'crypto';
import Transaction from '../models/Transaction.js';
import Order from '../models/Order.js';

// Initialize Razorpay instance
const getRazorpayInstance = () => {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

// @desc    Create a Razorpay order
// @route   POST /api/payments/create-order
// @access  Private
export const createRazorpayOrder = async (req, res) => {
  try {
    const { amount, currency = 'INR', orderId, notes = {} } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Valid amount is required' });
    }

    const razorpay = getRazorpayInstance();

    const options = {
      amount: Math.round(amount * 100), // Razorpay expects amount in paise
      currency,
      receipt: 'receipt_' + Date.now(),
      notes: {
        orderId: orderId || '',
        userId: req.user?._id?.toString() || '',
        ...notes,
      },
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // Save transaction record
    const transaction = await Transaction.create({
      user: req.user?._id,
      order: orderId || undefined,
      razorpayOrderId: razorpayOrder.id,
      amount,
      currency,
      status: 'created',
      receipt: options.receipt,
      notes: options.notes,
    });

    res.status(201).json({
      success: true,
      data: {
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        transactionId: transaction.transactionId,
        key: process.env.RAZORPAY_KEY_ID, // Frontend needs this to open checkout
      },
    });
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify Razorpay payment signature
// @route   POST /api/payments/verify
// @access  Private
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: 'All payment fields are required' });
    }

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      // Update transaction as failed
      await Transaction.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        { status: 'failed' }
      );
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    // Update transaction as captured
    const transaction = await Transaction.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: 'captured',
      },
      { new: true }
    );

    // Update linked order as paid if it exists
    if (transaction?.order) {
      await Order.findByIdAndUpdate(transaction.order, {
        isPaid: true,
        paidAt: Date.now(),
        paymentMethod: 'Razorpay',
        paymentResult: {
          id: razorpay_payment_id,
          status: 'captured',
          update_time: new Date().toISOString(),
        },
      });
    }

    res.json({
      success: true,
      message: 'Payment verified successfully',
      data: transaction,
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Razorpay key (for frontend)
// @route   GET /api/payments/key
// @access  Public
export const getRazorpayKey = (req, res) => {
  res.json({
    success: true,
    key: process.env.RAZORPAY_KEY_ID,
  });
};

// @desc    Get all transactions (Admin)
// @route   GET /api/transactions
// @access  Private/Admin
export const getTransactions = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    let query = {};
    if (status) query.status = status;

    const total = await Transaction.countDocuments(query);
    const transactions = await Transaction.find(query)
      .populate('user', 'name email')
      .populate('order', 'orderId totalPrice status')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: transactions,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single transaction
// @route   GET /api/transactions/:id
// @access  Private
export const getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('user', 'name email')
      .populate('order', 'orderId totalPrice status orderItems');

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    res.json({ success: true, data: transaction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get transaction stats (Admin)
// @route   GET /api/transactions/stats
// @access  Private/Admin
export const getTransactionStats = async (req, res) => {
  try {
    const total = await Transaction.countDocuments();
    const captured = await Transaction.countDocuments({ status: 'captured' });
    const failed = await Transaction.countDocuments({ status: 'failed' });
    const pending = await Transaction.countDocuments({ status: 'created' });
    const refunded = await Transaction.countDocuments({ status: 'refunded' });

    const totalRevenue = await Transaction.aggregate([
      { $match: { status: 'captured' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayRevenue = await Transaction.aggregate([
      { $match: { status: 'captured', createdAt: { $gte: todayStart } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    res.json({
      success: true,
      total,
      captured,
      failed,
      pending,
      refunded,
      totalRevenue: totalRevenue[0]?.total || 0,
      todayRevenue: todayRevenue[0]?.total || 0,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Initiate refund
// @route   POST /api/transactions/:id/refund
// @access  Private/Admin
export const refundTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    if (transaction.status !== 'captured') {
      return res.status(400).json({ success: false, message: 'Only captured payments can be refunded' });
    }

    const razorpay = getRazorpayInstance();
    const refundAmount = req.body.amount || transaction.amount;

    const refund = await razorpay.payments.refund(transaction.razorpayPaymentId, {
      amount: Math.round(refundAmount * 100),
      notes: { reason: req.body.reason || 'Admin initiated refund' },
    });

    transaction.status = 'refunded';
    transaction.refundId = refund.id;
    transaction.refundAmount = refundAmount;
    await transaction.save();

    // Update linked order
    if (transaction.order) {
      await Order.findByIdAndUpdate(transaction.order, {
        status: 'Cancelled',
        isPaid: false,
      });
    }

    res.json({
      success: true,
      message: 'Refund initiated successfully',
      data: transaction,
    });
  } catch (error) {
    console.error('Refund error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
