import express, { Request, Response } from "express"
import cors from "cors";
const app = express();

// Middleware Setup.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Health Route.
app.get("/", (req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        message: "Server is Running."
    })
})

export default app;