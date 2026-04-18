import cron from "node-cron";
import User from "../models/User.js";
import Order from "../models/Order.js";
import sendEmail from "../utils/sendEmail.js";

export const startOrderCron = () => {
  cron.schedule("*/2 * * * *", async () => {
    try {
      console.log("Running order delivery cron...");

      const timeLimit = new Date(Date.now() - 2 * 60 * 1000); // 2 mins

      const orders = await Order.find({
        status: "confirmed",
        updatedAt: { $lte: timeLimit },
      });

      for (const order of orders) {
        order.status = "delivered";
        await order.save();
        const user = await User.findById(order.userId);
        await sendEmail({
          to: user.email,
          subject: "Order delievered",
          html: `<h2>Your order has been delievered `,
        });
      }

      console.log(`Delivered ${orders.length} orders`);

    } catch (error) {
      console.error("Cron error:", error);
    }
  });
};