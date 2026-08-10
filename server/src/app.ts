import express, { NextFunction, Request, Response } from "express"
import cors from "cors";
import {clerkMiddleware} from "@clerk/express"
import userRouter from "./routes/user.routes.js";
import messageRouter from "./routes/message.routes.js";
const app = express();

// Middleware Setup.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(clerkMiddleware())

// Health Route.
app.get("/", (req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        message: "Server is Running."
    })
})

// All Routers.

// User Routers.
app.use("/api/users", userRouter)

// Message Router.
app.use("/api/messages", messageRouter)

// Global Error Handler.
app.use((err: any, _req: Request, res: Response, _next: NextFunction)=>{
    console.error(err)
    res.status(500).json({
        success: false,
        message: err?.message || "Something Went Wrong."
    })
})

export default app;