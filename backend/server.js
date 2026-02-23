import express from "express"
import "dotenv/config.js"
import cors from "cors" 
import patient_feedback from "./routes/feedback.Routes.js"
const app=express()
app.use(cors())
app.use(express.json())
const PORT=process.env.PORT || 3000

import con from "./db.js"

app.use("/feedback",patient_feedback)

app.use("/",(req,res)=>{
    res.send("welcome to feedback api")
})

app.listen(PORT,()=>{
    console.log(`server is running on port ${PORT}`)
})