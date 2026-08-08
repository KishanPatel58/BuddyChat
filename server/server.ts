import "dotenv/config";
import server from './src/app.js'
import connectDB from "./src/config/db.config.js";
const port = process.env.PORT;

const runServer = async () => {
    server.listen(port, ()=>console.log(`Server is Running on PORT: ${port}`))
    connectDB()
} 

runServer()