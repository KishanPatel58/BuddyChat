import "dotenv/config";
import express , {Request, Response} from "express"
import cors from "cors";
import connectDB from "./config/db.config.js";
const app = express();
const port = process.env.PORT;
// Connect Database.
await connectDB()
// Middleware Setup.
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors());

// Health Route.
app.get("/",(req: Request, res: Response)=>{
    res.status(200).json({
        success: true,
        message: "Server is Running."
    })
})

// Connect Database.
await connectDB()
app.listen(port,()=>console.log(`Server is Running on PORT: ${port}`))