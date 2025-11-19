import express from 'express';
import cors from 'cors';
import dotenv from "dotenv";
import router from './routes/receipt.routes';

//load the environment variables
dotenv.config();

// initialise the app
const app = express();
const PORT = process.env.PORT || 4000;


// middleware
// allow to read json body
app.use(express.json());

// talk to frontend , cors

app.use(cors())

app.use("/api/receipts", router)

// health check route

app.get("/health", (req, res)=>{
    res.status(200).json({status: "ok", message: "The server is running"});
})

app.listen(PORT, ()=>{
    console.log(`The app is running on the port ${PORT}`)
})