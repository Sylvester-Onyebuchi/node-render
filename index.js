import express from "express"
import dotenv from 'dotenv'
import { ConnectDB } from "./db/DBConnect.js"
import authRoutes from './routes/auth.js'
import cookieParser from "cookie-parser"
import cors from "cors"
dotenv.config()
const app = express()
const PORT = process.env.PORT || 8000;
app.use(express.json())
app.use(cookieParser())
app.use(cors())

app.use("/api/auth/", authRoutes)


app.listen(PORT, ()=>{
    ConnectDB()
    console.log(`Server is running on port ${PORT}`)
})