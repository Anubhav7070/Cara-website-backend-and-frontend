const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Serve static files
app.use(express.static('./'));

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/authDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected successfully'))
.catch((err) => console.error('MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    address: { type: String, required: true },
    pincode: { type: Number, required: true },
    mobile: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

// Order Schema
const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [
        {
            productId: String,
            name: String,
            price: Number,
            quantity: Number,
            subtotal: Number
        }
    ],
    totalAmount: Number,
    paymentMethod: String,
    orderDate: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', orderSchema);

// Register a new user
app.post('/register', async (req, res) => {
    try {
        const { name, address, pincode, mobile, email, password } = req.body;
        
        if (!name || !address || !pincode || !mobile || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, address, pincode, mobile, email, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error during registration', error: error.message });
    }
});

// Login user
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Email is not registered' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Incorrect password' });

        const token = jwt.sign({ userId: user._id }, 'secretKey', { expiresIn: '1h' });
        res.json({ message: 'Login successful', token, userId: user._id });
    } catch (error) {
        res.status(500).json({ message: 'Server error during login', error: error.message });
    }
});

// Place an order
app.post('/order', async (req, res) => {
    try {
        const { userId, items, totalAmount, paymentMethod } = req.body;
        if (!userId || !items || !totalAmount || !paymentMethod) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const newOrder = new Order({ userId, items, totalAmount, paymentMethod });
        await newOrder.save();

        res.status(201).json({ message: 'Order placed successfully'});
    } catch (error) {
        res.status(500).json({ message: 'Error placing order', error: error.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});


