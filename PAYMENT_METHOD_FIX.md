# Payment Method Fix - COD vs Razorpay Issue

## Problem
When users pay with Razorpay, the order still shows "COD" as the payment method instead of "Razorpay".

## Root Causes
1. **Order creation** sets `paymentMethod` to "COD" by default if not provided
2. **Frontend** not sending `paymentMethod: "Razorpay"` when initiating Razorpay payment
3. **After Razorpay payment**, the verify endpoint must update the order's `paymentMethod` to "Razorpay"

## Solution

### Backend Changes ✅ (Already Applied)

**1. In `userOrderController.js`:**
```javascript
// Extract payment method from request, default to COD
const paymentMethod = req.body.paymentMethod?.trim() || 'COD';

// Set isPaid based on method
const isPaidInitially = paymentMethod === 'Razorpay' ? false : false;

// Create transaction based on payment method
if (paymentMethod === 'COD' || paymentMethod === 'Cash on Delivery') {
   // COD transaction marked as captured
} else if (paymentMethod === 'Razorpay') {
   // Razorpay transaction marked as initiated
}
```

**2. In `paymentController.js` - verifyPayment function:**
```javascript
// IMPORTANT: Always update payment method to Razorpay after verification
await Order.findByIdAndUpdate(transaction.order, {
  isPaid: true,
  paidAt: Date.now(),
  paymentMethod: 'Razorpay',  // ✅ CRITICAL
  paymentResult: { ... }
});
```

### Frontend Required Changes 🔴 (NEEDED)

**When creating an order for Razorpay payment:**
```javascript
// Send paymentMethod in order creation
const createOrderPayload = {
  items: cartItems,
  address: shippingAddress,
  paymentMethod: "Razorpay",  // ✅ IMPORTANT
  couponCode: appliedCoupon
};

// Create order
POST /api/user/orders
Body: { ...createOrderPayload }
```

**After Razorpay payment completes:**
```javascript
// Get payment details from Razorpay
const razorpayData = {
  razorpay_order_id: response.razorpay_order_id,
  razorpay_payment_id: response.razorpay_payment_id,
  razorpay_signature: response.razorpay_signature
};

// Verify with backend
POST /api/payments/verify
Body: { ...razorpayData }

// Response will include updated order with paymentMethod: "Razorpay"
```

**Refresh order details:**
```javascript
// After verification succeeds, refresh order from database
GET /api/user/orders/:orderId
// or refetch orders list to see updated payment method
```

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/user/orders` | Create order (send `paymentMethod` here) |
| POST | `/api/payments/key` | Get Razorpay key |
| POST | `/api/payments/create-order` | Create Razorpay order |
| POST | `/api/payments/verify` | Verify Razorpay payment & update order |

## Testing Checklist

- [ ] Create order with `paymentMethod: "COD"` → Should show "COD"
- [ ] Create order with `paymentMethod: "Razorpay"` → Should initiate Razorpay payment
- [ ] After Razorpay payment success → Call `/api/payments/verify`
- [ ] Verify order now shows `paymentMethod: "Razorpay"`
- [ ] Refresh order details → Still shows "Razorpay" (not "COD")

## Example Request Flows

### COD Flow
```
1. POST /api/user/orders { paymentMethod: "COD" }
   → Order created with paymentMethod: "COD", isPaid: false
   → Transaction created with status: "captured"
2. No further action needed
3. Admin can update status to Delivered when shipped
```

### Razorpay Flow
```
1. POST /api/user/orders { paymentMethod: "Razorpay" }
   → Order created with paymentMethod: "Razorpay", isPaid: false
   → Transaction created with status: "initiated"

2. Frontend calls: POST /api/payments/create-order { orderId, amount }
   → Returns Razorpay order ID

3. Frontend opens Razorpay checkout

4. User completes payment

5. Frontend calls: POST /api/payments/verify { razorpay_* }
   → Order updated: paymentMethod: "Razorpay", isPaid: true

6. Admin can see order is paid and ready to ship
```

## Key Files Modified

- `backend/admin/controllers/paymentController.js` - Updated verification logic
- `backend/admin/controllers/userOrderController.js` - Added Razorpay transaction handling
- `backend/User/routes/orderRoutes.js` - Proper payment method handling

