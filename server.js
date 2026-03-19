import express from "express"
import dotenv from "dotenv"
import Stripe from "stripe"
import cors from "cors"
import connectDB from "./config.js/db.js"
import Order from "./models/Order.js"
import paymentRoutes from "./routes/paymentRoutes.js"
import path from "path"
import { fileURLToPath } from 'url'

dotenv.config()

connectDB()

const app = express()

const stripe = new Stripe(process.env.STRIPE_SECRET)

app.use(cors())
app.use(express.json())

app.use("/api", paymentRoutes)

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'))
})

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET

app.post("/webhook",express.raw({type:"application/json"}),async(req,res)=>{

 const sig = req.headers["stripe-signature"]

 let event

 try{

  event = stripe.webhooks.constructEvent(
   req.body,
   sig,
   endpointSecret
  )

 }catch(err){

  return res.status(400).send(`Webhook Error: ${err.message}`)

 }

 if(event.type === "checkout.session.completed"){

   const session = event.data.object

   await Order.create({

    sessionId:session.id,
    product:"Premium Course",
    amount:session.amount_total,
    currency:session.currency,
    status:"paid",
    customerEmail:session.customer_email

   })

 }

 res.json({received:true})

})

app.listen(process.env.PORT,()=>{

 console.log("Server running")

})