//1. load environment
import dotenv from "dotenv";
dotenv.config();
//2. import app
import app from './app.js';

//3. import database connection
import { connectDB } from "./config/db.js";


import { startOrderCron } from "./cron/orderCron.js";
//4. connect database
connectDB();
startOrderCron();
//5. start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});