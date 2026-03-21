import mongoose from "mongoose"

const orderSchema = new mongoose.Schema({
 sessionId: String,
 product: String,
 amount: Number,
 currency: String,
 status: String,
 customerEmail: String,
 transitions: [
   {
     status: String,
     at: { type: Date, default: Date.now },
     details: String,
   },
 ],
}, { timestamps: true })

export default mongoose.model("Order", orderSchema)