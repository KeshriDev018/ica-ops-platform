import Razorpay from "razorpay";
import crypto from "crypto";

/* =====================================================
   CREATE ORDER
   ===================================================== */
export const createRazorpayOrder = async ({ amount, receiptId }) => {
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  const options = {
    amount: amount, // Already in paise from frontend
    currency: process.env.RAZORPAY_CURRENCY || "INR",
    receipt: receiptId,
  };

  const order = await razorpay.orders.create(options);
  return order;
};

/* =====================================================
   VERIFY PAYMENT (REAL)
   ===================================================== */
export const verifyRazorpayPayment = ({
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
}) => {
  const body = `${razorpay_order_id}|${razorpay_payment_id}`;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest("hex");

  return expectedSignature === razorpay_signature;
};
