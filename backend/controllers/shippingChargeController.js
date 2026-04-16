import Order from "../models/Order.js";

/**
 * Calculate shipping charges based on order amount
 * Rules:
 * - Below 500 INR: 50 INR shipping
 * - 500 INR and above: Free shipping
 */
export const calculateShippingCharge = (req, res) => {
  try {
    const { amount } = req.body;

    if (amount === undefined || amount === null) {
      return res.status(400).json({ 
        success: false, 
        message: "Amount is required to calculate shipping charges" 
      });
    }

    let shippingCharge = 0;
    
    if (amount < 500) {
      shippingCharge = 50;
    } else if (amount >= 500 && amount < 1000) {
      shippingCharge = 30;
    } else {
      shippingCharge = 0;
    }

    res.json({
      success: true,
      data: {
        amount,
        shippingCharge,
        isFree: shippingCharge === 0
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
