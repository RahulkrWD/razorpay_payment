// // server.js
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const Razorpay = require("razorpay");
const cors = require("cors");

const app = express();
const port = 5000;

// Connect to MongoDB
mongoose.connect(
  "mongodb+srv://rahulkr:rahulkr@cluster0.uu1odbb.mongodb.net/placeorder_razorpay"
);

const db = mongoose.connection;
db.once("open", () => console.log("Connected to database"));

// Define MongoDB schema and model
const OrderSchema = new mongoose.Schema({
  orderId: String,
  amount: Number,
  status: String,
});
const Order = mongoose.model("Order", OrderSchema);

// Razorpay instance
const razorpay = new Razorpay({
  key_id: "rzp_test_drjHwcTz7rLPPq",
  key_secret: "gJrKh7SahfQdwYfg8uQIcFvV",
});

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Routes
app.post("/api/orders", async (req, res) => {
  const { amount } = req.body;

  const options = {
    amount: amount * 100, // Amount in paise
    currency: "INR",
    receipt: "order_rcptid_11",
  };

  try {
    const order = await razorpay.orders.create(options);
    const newOrder = new Order({
      orderId: order.id,
      amount: amount,
      status: "pending",
    });
    await newOrder.save();
    res.json({ orderId: order.id });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Failed to create order" });
  }
});

app.post("/api/payment/success", async (req, res) => {
  const { order_id, payment_id } = req.body;
  try {
    const order = await Order.findOneAndUpdate(
      { orderId: order_id },
      { $set: { status: "success", paymentId: payment_id } },
      { new: true }
    );
    res.json(order);
  } catch (error) {
    console.error("Error updating payment status:", error);
    res.status(500).json({ error: "Failed to update payment status" });
  }
});
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
