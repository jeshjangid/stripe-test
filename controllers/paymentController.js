import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET);

export const createCheckoutSession = async (req, res) => {
  try {
    const { amount, productName } = req.body;

    // ✅ validation (important)
    if (!amount || amount < 1) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],

      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: productName || "Premium Course",
            },
            // Stripe takes amount in cents
            unit_amount: amount * 100,
          },
          quantity: 1,
        },
      ],

      mode: "payment",

      // ✅ IMPORTANT CHANGE
      success_url:
        "https://myproject-29cf7.web.app/success?session_id={CHECKOUT_SESSION_ID}",

      cancel_url:
        "https://myproject-29cf7.web.app/cancel?session_id={CHECKOUT_SESSION_ID}",
    });

    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { session_id } = req.body;

    if (!session_id) {
      return res.status(400).json({ success: false });
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status === "paid") {
      return res.json({ success: true });
    }

    res.json({ success: false });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};