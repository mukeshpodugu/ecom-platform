const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/error');

// Load environment variables
dotenv.config();

// Initialize DB
connectDB();

const app = express();

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Security Headers
app.use(helmet({
  contentSecurityPolicy: false // Disable CSP for easy development and dev server testing
}));

// CORS Configuration
app.use(cors({
  origin: true, // Allow all origins in dev
  credentials: true
}));

// Simple Custom Cookie Parser Middleware
app.use((req, res, next) => {
  req.cookies = {};
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    cookieHeader.split(';').forEach(cookie => {
      const parts = cookie.split('=');
      req.cookies[parts[0].trim()] = (parts[1] || '').trim();
    });
  }
  next();
});

// Import route files
const auth = require('./routes/auth');
const products = require('./routes/products');
const cart = require('./routes/cart');
const orders = require('./routes/orders');
const admin = require('./routes/admin');
const sellers = require('./routes/sellers');
const reviews = require('./routes/reviews');
const coupons = require('./routes/coupons');
const wishlist = require('./routes/wishlist');

// Mount routes
app.use('/api/auth', auth);
app.use('/api/products', products);
app.use('/api/cart', cart);
app.use('/api/orders', orders);
app.use('/api/admin', admin);
app.use('/api/sellers', sellers);
app.use('/api/reviews', reviews);
app.use('/api/coupons', coupons);
app.use('/api/wishlist', wishlist);

// Simulated Support Chatbot endpoint (Full-stack real-time mock)
app.post('/api/chat', (req, res) => {
  const { message } = req.body;
  let reply = "Hello! I am your Apex virtual assistant. How can I help you today?";
  
  const msgLower = (message || '').toLowerCase();
  
  if (msgLower.includes('order') || msgLower.includes('track')) {
    reply = "You can track your order status in the 'Orders' section. If you need details, tell me your order ID!";
  } else if (msgLower.includes('refund') || msgLower.includes('cancel')) {
    reply = "Orders can be cancelled before they are shipped from the 'Orders' dashboard. Refunds are processed within 3-5 business days.";
  } else if (msgLower.includes('coupon') || msgLower.includes('discount')) {
    reply = "You can view available coupons in the checkout page. Try using code 'SAVE20' for a 20% discount on order values above $50!";
  } else if (msgLower.includes('shipping') || msgLower.includes('delivery')) {
    reply = "We offer free delivery for orders above $100. Standard shipping takes 3-5 business days.";
  } else if (msgLower.includes('payment') || msgLower.includes('upi') || msgLower.includes('card')) {
    reply = "We support UPI, Cards, and Cash on Delivery (COD) payments at checkout.";
  }

  // Add delay for realism
  setTimeout(() => {
    res.status(200).json({
      success: true,
      reply,
      timestamp: new Date().toISOString()
    });
  }, 600);
});

// Interactive API Documentation Dashboard
app.get('/api/docs', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>APEX E-Commerce API Documentation</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #e2e8f0; margin: 0; padding: 40px; }
        .container { max-width: 900px; margin: 0 auto; }
        h1 { color: #3b82f6; border-bottom: 2px solid #1e293b; padding-bottom: 15px; }
        .route-group { background: #1e293b; border-radius: 8px; padding: 20px; margin-bottom: 25px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
        h2 { color: #f8fafc; margin-top: 0; border-bottom: 1px dashed #334155; padding-bottom: 10px; text-transform: capitalize; }
        .endpoint { font-family: monospace; display: flex; align-items: center; padding: 10px; margin: 10px 0; border-radius: 4px; background: #0f172a; }
        .method { padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 12px; margin-right: 15px; min-width: 60px; text-align: center; }
        .get { background: #10b981; color: white; }
        .post { background: #3b82f6; color: white; }
        .put { background: #f59e0b; color: white; }
        .delete { background: #ef4444; color: white; }
        .path { color: #a7f3d0; font-weight: bold; flex-grow: 1; }
        .desc { color: #94a3b8; font-size: 14px; text-align: right; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🚀 APEX E-Commerce API Endpoints</h1>
        
        <div class="route-group">
          <h2>Authentication</h2>
          <div class="endpoint"><span class="method post">POST</span><span class="path">/api/auth/register</span><span class="desc">Register new customer</span></div>
          <div class="endpoint"><span class="method post">POST</span><span class="path">/api/auth/login</span><span class="desc">Authenticate user & get token</span></div>
          <div class="endpoint"><span class="method post">POST</span><span class="path">/api/auth/google</span><span class="desc">Mock Google OAuth Login</span></div>
          <div class="endpoint"><span class="method get">GET</span><span class="path">/api/auth/me</span><span class="desc">Get current user profile (Auth)</span></div>
          <div class="endpoint"><span class="method get">GET</span><span class="path">/api/auth/logout</span><span class="desc">Clear auth token cookie</span></div>
          <div class="endpoint"><span class="method post">POST</span><span class="path">/api/auth/address</span><span class="desc">Save customer address (Auth)</span></div>
        </div>

        <div class="route-group">
          <h2>Products Catalog</h2>
          <div class="endpoint"><span class="method get">GET</span><span class="path">/api/products</span><span class="desc">Search & Filter products (Pagination)</span></div>
          <div class="endpoint"><span class="method get">GET</span><span class="path">/api/products/search/suggestions</span><span class="desc">Debounced search autocompletes</span></div>
          <div class="endpoint"><span class="method get">GET</span><span class="path">/api/products/user/recommendations</span><span class="desc">AI personalized recommendations</span></div>
          <div class="endpoint"><span class="method get">GET</span><span class="path">/api/products/:id</span><span class="desc">Get product specs and details</span></div>
          <div class="endpoint"><span class="method get">GET</span><span class="path">/api/products/:id/recommendations</span><span class="desc">Similar category/brand suggestions</span></div>
        </div>

        <div class="route-group">
          <h2>Shopping Cart</h2>
          <div class="endpoint"><span class="method get">GET</span><span class="path">/api/cart</span><span class="desc">Fetch cart products & calculate totals (Auth)</span></div>
          <div class="endpoint"><span class="method post">POST</span><span class="path">/api/cart</span><span class="desc">Add product/variant item to cart (Auth)</span></div>
          <div class="endpoint"><span class="method put">PUT</span><span class="path">/api/cart/:itemId</span><span class="desc">Update cart quantity (Auth)</span></div>
          <div class="endpoint"><span class="method delete">DELETE</span><span class="path">/api/cart/:itemId</span><span class="desc">Remove item from cart (Auth)</span></div>
          <div class="endpoint"><span class="method post">POST</span><span class="path">/api/cart/coupon</span><span class="desc">Apply discount coupon (Auth)</span></div>
        </div>

        <div class="route-group">
          <h2>Orders & Invoices</h2>
          <div class="endpoint"><span class="method post">POST</span><span class="path">/api/orders</span><span class="desc">Place order & update inventory stock (Auth)</span></div>
          <div class="endpoint"><span class="method get">GET</span><span class="path">/api/orders/myorders</span><span class="desc">Fetch user order history (Auth)</span></div>
          <div class="endpoint"><span class="method get">GET</span><span class="path">/api/orders/:id</span><span class="desc">Track order status details (Auth)</span></div>
          <div class="endpoint"><span class="method put">PUT</span><span class="path">/api/orders/:id/cancel</span><span class="desc">Cancel pending order & restore stock (Auth)</span></div>
          <div class="endpoint"><span class="method get">GET</span><span class="path">/api/orders/:id/invoice</span><span class="desc">Stream PDF invoice attachment (Auth)</span></div>
        </div>

        <div class="route-group">
          <h2>Seller & Admin Panels</h2>
          <div class="endpoint"><span class="method get">GET</span><span class="path">/api/sellers/dashboard</span><span class="desc">Seller sales analytics & products (Seller)</span></div>
          <div class="endpoint"><span class="method post">POST</span><span class="path">/api/sellers/products</span><span class="desc">Add vendor product (Seller)</span></div>
          <div class="endpoint"><span class="method get">GET</span><span class="path">/api/admin/analytics</span><span class="desc">Revenue metrics & sales histories (Admin)</span></div>
          <div class="endpoint"><span class="method get">GET</span><span class="path">/api/admin/users</span><span class="desc">List user registrations (Admin)</span></div>
          <div class="endpoint"><span class="method put">PUT</span><span class="path">/api/admin/users/:id/status</span><span class="desc">Block/unblock account (Admin)</span></div>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 [Server] Express Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`📚 [Server] Interactive API Docs available at http://localhost:${PORT}/api/docs`);
});
