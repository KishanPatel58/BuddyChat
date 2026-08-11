import "dotenv/config";
import app from './src/app.js'
import connectDB from "./src/config/db.config.js";
import http from 'http';
import { initSocketServer } from "./src/socket/socket.manager.js";
const port = process.env.PORT;

// HTTP server and attach WebSocket.
const server = http.createServer(app);
initSocketServer(server);

const runServer = async () => {
    app.listen(port, ()=>console.log(`Server is Running on PORT: ${port}`))
    connectDB()
} 

runServer()