const Razorpay = require('razorpay');

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

if (!keyId || !keySecret) {
  const notConfiguredError = async () => {
    throw new Error(
      'Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in backend environment.'
    );
  };

  const razorpayFallback = {
    orders: {
      create: notConfiguredError,
    },
  };

  module.exports = razorpayFallback;
} else {
  const razorpayInstance = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });

  module.exports = razorpayInstance;
}
