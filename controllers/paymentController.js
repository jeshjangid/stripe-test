import Stripe from "stripe";
import Order from "../models/Order.js";

const stripe = new Stripe(process.env.STRIPE_SECRET);

export const createCheckoutSession = async (req, res) => {
  try {
    const { amount, productName, customerEmail } = req.body;

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

    const order = await Order.create({
      sessionId: session.id,
      product: productName || "Premium Course",
      amount,
      currency: "usd",
      status: "pending",
      customerEmail: customerEmail || null,
      transitions: [
        {
          status: "pending",
          details: "Checkout session created",
        },
      ],
    });

    res.json({ url: session.url, orderId: order._id });
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

    const order = await Order.findOne({ sessionId: session_id });
    const nextStatus = session.payment_status === "paid" ? "paid" : session.payment_status;

    if (order) {
      if (order.status !== nextStatus) {
        order.status = nextStatus;
        order.transitions.push({
          status: nextStatus,
          details: `Stripe payment_status: ${session.payment_status}`,
        });
      }
      await order.save();
    }

    const success = session.payment_status === "paid";
    return res.json({ success, order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};