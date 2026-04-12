import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from './models/Order.js';
import Transaction from './models/Transaction.js';
import Admin from './models/Admin.js';

dotenv.config();

const products = [
  { name: 'Wireless Bluetooth Headphones', price: 2499, image: 'https://cdn-icons-png.flaticon.com/512/3050/3050361.png' },
  { name: 'Men\'s T-Shirt Premium', price: 799, image: 'https://cdn-icons-png.flaticon.com/512/892/892458.png' },
  { name: 'Men\'s Leather Wallet', price: 1299, image: 'https://cdn-icons-png.flaticon.com/512/3081/3081559.png' },
  { name: 'Memory Foam Pillow', price: 1999, image: 'https://cdn-icons-png.flaticon.com/512/3081/3081648.png' },
  { name: 'Adjustable Dumbbells Set', price: 3499, image: 'https://cdn-icons-png.flaticon.com/512/2964/2964514.png' },
  { name: 'Coffee Maker Machine', price: 4999, image: 'https://cdn-icons-png.flaticon.com/512/3081/3081886.png' },
  { name: 'Casual Baseball Cap', price: 599, image: 'https://cdn-icons-png.flaticon.com/512/4715/4715329.png' },
  { name: 'Full HD Webcam', price: 2999, image: 'https://cdn-icons-png.flaticon.com/512/2936/2936690.png' },
  { name: 'Smart LED Color Bulb', price: 899, image: 'https://cdn-icons-png.flaticon.com/512/1829/1829070.png' },
  { name: 'Portable Power Bank 20000mAh', price: 1499, image: 'https://cdn-icons-png.flaticon.com/512/3659/3659832.png' },
  { name: 'Yoga Mat Premium', price: 1199, image: 'https://cdn-icons-png.flaticon.com/512/2264/2264742.png' },
  { name: 'Stainless Steel Water Bottle', price: 699, image: 'https://cdn-icons-png.flaticon.com/512/2553/2553695.png' },
];

const statuses = ['Pending', 'Delivered', 'Shipped', 'Cancelled'];
const txnStatuses = ['captured', 'created', 'failed', 'refunded'];
const paymentStates = [true, false];

function randomDate(daysBack) {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * daysBack));
  d.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
  return d;
}

async function seedData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
    console.log('MongoDB Connected');

    // Find admin user to link orders
    const admin = await Admin.findOne({ role: 'admin' });
    if (!admin) {
      console.error('No admin found. Run "npm run seed" first.');
      process.exit(1);
    }

    // Clear existing test data
    await Order.deleteMany({});
    await Transaction.deleteMany({});
    console.log('Cleared old orders & transactions');

    const orders = [];
    const transactions = [];

    // Create 25 test orders
    for (let i = 0; i < 25; i++) {
      const product = products[Math.floor(Math.random() * products.length)];
      const qty = Math.floor(Math.random() * 3) + 1;
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const isPaid = status === 'Delivered' || status === 'Shipped' ? true : paymentStates[Math.floor(Math.random() * 2)];
      const createdAt = randomDate(30);

      const order = {
        orderId: `#ORD${String(1000 + i).padStart(4, '0')}`,
        user: admin._id,
        orderItems: [{
          name: product.name,
          qty,
          image: product.image,
          price: product.price,
          product: new mongoose.Types.ObjectId(), // placeholder product ID
        }],
        shippingAddress: {
          address: `${100 + i} MG Road`,
          city: ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Pune'][Math.floor(Math.random() * 5)],
          postalCode: String(400000 + Math.floor(Math.random() * 10000)),
          country: 'India',
        },
        paymentMethod: 'Razorpay',
        itemsPrice: product.price * qty,
        taxPrice: Math.round(product.price * qty * 0.18),
        shippingPrice: product.price * qty > 2000 ? 0 : 99,
        totalPrice: Math.round(product.price * qty * 1.18) + (product.price * qty > 2000 ? 0 : 99),
        isPaid,
        paidAt: isPaid ? createdAt : undefined,
        isDelivered: status === 'Delivered',
        deliveredAt: status === 'Delivered' ? new Date(createdAt.getTime() + 3 * 24 * 60 * 60 * 1000) : undefined,
        status,
        createdAt,
        updatedAt: createdAt,
      };

      orders.push(order);
    }

    const createdOrders = await Order.insertMany(orders);
    console.log(`✅ Created ${createdOrders.length} test orders`);

    // Create transactions for paid orders
    for (const order of createdOrders) {
      if (order.isPaid) {
        const txnStatus = order.status === 'Cancelled' ? 'refunded' : 'captured';

        transactions.push({
          transactionId: 'TXN' + Date.now() + Math.random().toString(36).substr(2, 4).toUpperCase(),
          order: order._id,
          user: admin._id,
          razorpayOrderId: 'order_' + Math.random().toString(36).substr(2, 14),
          razorpayPaymentId: txnStatus === 'captured' ? 'pay_' + Math.random().toString(36).substr(2, 14) : undefined,
          razorpaySignature: txnStatus === 'captured' ? Math.random().toString(36).substr(2, 32) : undefined,
          amount: order.totalPrice,
          currency: 'INR',
          status: txnStatus,
          paymentMethod: 'razorpay',
          receipt: 'receipt_' + Date.now(),
          refundId: txnStatus === 'refunded' ? 'rfnd_' + Math.random().toString(36).substr(2, 14) : undefined,
          refundAmount: txnStatus === 'refunded' ? order.totalPrice : undefined,
          createdAt: order.createdAt,
          updatedAt: order.createdAt,
        });
      }
    }

    // Add a few failed/pending transactions too
    for (let i = 0; i < 5; i++) {
      const amount = Math.floor(Math.random() * 5000) + 500;
      const failedStatus = i < 3 ? 'failed' : 'created';
      transactions.push({
        transactionId: 'TXN' + Date.now() + Math.random().toString(36).substr(2, 4).toUpperCase(),
        user: admin._id,
        razorpayOrderId: 'order_' + Math.random().toString(36).substr(2, 14),
        amount,
        currency: 'INR',
        status: failedStatus,
        paymentMethod: 'razorpay',
        receipt: 'receipt_' + Date.now(),
        createdAt: randomDate(14),
      });
    }

    const createdTxns = await Transaction.insertMany(transactions);
    console.log(`✅ Created ${createdTxns.length} test transactions`);

    // Print summary
    const orderStats = {
      total: createdOrders.length,
      pending: createdOrders.filter(o => o.status === 'Pending').length,
      delivered: createdOrders.filter(o => o.status === 'Delivered').length,
      shipped: createdOrders.filter(o => o.status === 'Shipped').length,
      cancelled: createdOrders.filter(o => o.status === 'Cancelled').length,
    };

    const txnStats = {
      total: createdTxns.length,
      captured: createdTxns.filter(t => t.status === 'captured').length,
      failed: createdTxns.filter(t => t.status === 'failed').length,
      pending: createdTxns.filter(t => t.status === 'created').length,
      refunded: createdTxns.filter(t => t.status === 'refunded').length,
    };

    console.log('\n📊 Order Summary:', orderStats);
    console.log('💳 Transaction Summary:', txnStats);
    console.log('\n🎉 Test data seeded successfully! Refresh your dashboard to see the data.');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seedData();
