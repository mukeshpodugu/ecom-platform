const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// 1. User Schema
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['customer', 'seller', 'admin'], default: 'customer' },
  isVerified: { type: Boolean, default: false },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  addresses: [{
    street: String,
    city: String,
    state: String,
    zip: String,
    country: String,
    isDefault: { type: Boolean, default: false }
  }]
}, { timestamps: true });

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// 2. Seller Schema
const SellerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  storeName: { type: String, required: true, unique: true },
  description: String,
  logo: String,
  banner: String,
  rating: { type: Number, default: 0 },
  reviewsCount: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false },
  bankAccount: {
    holderName: String,
    accountNumber: String,
    bankName: String,
    ifsc: String
  }
}, { timestamps: true });

// 3. Category Schema
const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: String,
  image: String,
  parentCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null }
}, { timestamps: true });

// 4. Product Schema
const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number, required: true },
  discount: { type: Number, default: 0 }, // percentage
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  brand: { type: String, required: true },
  stock: { type: Number, required: true, default: 0 },
  images: [{ type: String }],
  variants: [{
    name: String, // e.g. Size, Color
    options: [{ type: String }] // e.g. ["S", "M", "L"]
  }],
  rating: { type: Number, default: 0 },
  reviewsCount: { type: Number, default: 0 },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller', required: true },
  isFeatured: { type: Boolean, default: false },
  isTrending: { type: Boolean, default: false },
  specs: { type: Map, of: String } // Key-value pairs for specifications
}, { timestamps: true });

// 5. Review Schema
const ReviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: String,
  comment: { type: String, required: true },
  images: [{ type: String }],
  likes: { type: Number, default: 0 },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

// 6. Order Schema
const OrderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    selectedVariant: { type: Map, of: String }
  }],
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zip: String,
    country: String
  },
  paymentMethod: { type: String, enum: ['UPI', 'Card', 'COD'], required: true },
  paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed', 'Refunded'], default: 'Pending' },
  deliveryStatus: { type: String, enum: ['Pending', 'Dispatched', 'Shipped', 'Delivered', 'Cancelled'], default: 'Pending' },
  totalAmount: { type: Number, required: true },
  discountAmount: { type: Number, default: 0 },
  shippingAmount: { type: Number, default: 0 },
  taxAmount: { type: Number, default: 0 },
  grandTotal: { type: Number, required: true },
  trackingNumber: String,
  deliveryDate: Date,
  invoicePath: String
}, { timestamps: true });

// 7. Cart Schema
const CartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, default: 1 },
    selectedVariant: { type: Map, of: String }
  }],
  couponApplied: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon', default: null }
}, { timestamps: true });

// 8. Wishlist Schema
const WishlistSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]
}, { timestamps: true });

// 9. Coupon Schema
const CouponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
  discountValue: { type: Number, required: true },
  minOrderAmount: { type: Number, default: 0 },
  maxDiscountAmount: { type: Number },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// 10. Payment Schema
const PaymentSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  paymentId: String,
  signature: String,
  method: String,
  amount: Number,
  status: { type: String, enum: ['success', 'failed', 'pending'], default: 'pending' }
}, { timestamps: true });

// 11. Notification Schema
const NotificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['Order', 'Stock', 'Offer', 'System'], default: 'System' },
  isRead: { type: Boolean, default: false }
}, { timestamps: true });


module.exports = {
  User: mongoose.models.User || mongoose.model('User', UserSchema),
  Seller: mongoose.models.Seller || mongoose.model('Seller', SellerSchema),
  Category: mongoose.models.Category || mongoose.model('Category', CategorySchema),
  Product: mongoose.models.Product || mongoose.model('Product', ProductSchema),
  Review: mongoose.models.Review || mongoose.model('Review', ReviewSchema),
  Order: mongoose.models.Order || mongoose.model('Order', OrderSchema),
  Cart: mongoose.models.Cart || mongoose.model('Cart', CartSchema),
  Wishlist: mongoose.models.Wishlist || mongoose.model('Wishlist', WishlistSchema),
  Coupon: mongoose.models.Coupon || mongoose.model('Coupon', CouponSchema),
  Payment: mongoose.models.Payment || mongoose.model('Payment', PaymentSchema),
  Notification: mongoose.models.Notification || mongoose.model('Notification', NotificationSchema)
};
