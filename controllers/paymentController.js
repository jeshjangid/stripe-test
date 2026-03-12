import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET)

export const createCheckoutSession = async(req,res)=>{

 try{

 const session = await stripe.checkout.sessions.create({

   payment_method_types:["card"],

   line_items:[{

     price_data:{
       currency:"usd",
       product_data:{
        name:"Premium Course"
       },
       unit_amount:2000
     },

     quantity:1

   }],

   mode:"payment",

   success_url:"http://localhost:5173",

   cancel_url:"http://localhost:5173"

 })

 res.json({url:session.url})

 }catch(err){

  res.status(500).json({message:err.message})

 }

}