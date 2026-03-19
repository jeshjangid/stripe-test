import express from "express"
import {createCheckoutSession, verifyPayment} from "../controllers/paymentController.js"
import Order from "../models/Order.js"

const router = express.Router()

router.post("/create-checkout",createCheckoutSession)

router.get("/payments",async(req,res)=>{

 const payments = await Order.find().sort({createdAt:-1})

 res.json(payments)

})

router.post("/verify-payment", verifyPayment);

export default router