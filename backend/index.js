import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import { default as authRouter } from "./routes/auth.js";
import { default as userRouter } from "./routes/user.js";
// const authRoute = require("./routes/auth.js");

dotenv.config();
const app = express();
mongoose.connect(process.env.MONGODB_URL, () => {
  console.log("Connected to mongooseDB!");
});

app.use(cors());
app.use(cookieParser());
app.use(express.json());

//ROUTES
app.use("/v1/auth", authRouter);
app.use("/v1/user", userRouter);

app.listen(8000, () => {
  console.log("server is running");
});

//AUTHENTICATION (log in sign up compare to database)

//AUTHORIZATION (admin vs user)
