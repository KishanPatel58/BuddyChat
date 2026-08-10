import express, { Request, Response } from "express"
import cors from "cors";
import {clerkMiddleware} from "@clerk/express"
import userRouter from "./routes/user.routes.js";
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

export default app;