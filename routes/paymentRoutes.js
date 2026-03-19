import express from "express"
import {createCheckoutSession} from "../controllers/paymentController.js"
import Order from "../models/Order.js"
import verifyToken from "../middleware/verifyToken.js"

const router = express.Router()

router.post("/create-checkout",createCheckoutSession)

router.get("/payments",async(req,res)=>{

 const payments = await Order.find().sort({createdAt:-1})

 res.json(payments)

})

router.get("/success", verifyToken, (req, res) => {
  res.json({ message: "Payment successful! Welcome to the premium course." })
})

router.get("/cancel", verifyToken, (req, res) => {
  res.json({ message: "Payment cancelled. You can try again anytime." })
})

export default router