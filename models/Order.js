import mongoose from "mongoose"

const orderSchema = new mongoose.Schema({
 sessionId:String,
 product:String,
 amount:Number,
 currency:String,
 status:String,
 customerEmail:String

},{timestamps:true})

export default mongoose.model("Order",orderSchema)