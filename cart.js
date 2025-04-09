const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

// Connect to MongoDB
mongoose
  .connect("mongodb://localhost:27017/ecommerce", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

// Define Cart Schema
const cartSchema = new mongoose.Schema({
  productId: String,
  productName: String,
  price: Number,
  quantity: Number,
});

const Cart = mongoose.model("Cart", cartSchema);

// Add item to cart
app.post("/add-to-cart", async (req, res) => {
  try {
    const newCartItem = new Cart(req.body);
    await newCartItem.save();
    res.status(201).json({ message: "Item added to cart", data: newCartItem });
  } catch (error) {
    res.status(500).json({ message: "Error adding to cart", error });
  }
});

// Get all cart items
app.get("/cart", async (req, res) => {
  try {
    const cartItems = await Cart.find();
    res.json(cartItems);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving cart", error });
  }
});

// Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
