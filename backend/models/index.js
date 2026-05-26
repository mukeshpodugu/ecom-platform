const dbService = require('../services/dbService');
const {
  User,
  Seller,
  Category,
  Product,
  Review,
  Order,
  Cart,
  Wishlist,
  Coupon,
  Payment,
  Notification
} = require('./schemas');

// Register collections with dbService
dbService.registerModel('users', User);
dbService.registerModel('sellers', Seller);
dbService.registerModel('categories', Category);
dbService.registerModel('products', Product);
dbService.registerModel('reviews', Review);
dbService.registerModel('orders', Order);
dbService.registerModel('carts', Cart);
dbService.registerModel('wishlists', Wishlist);
dbService.registerModel('coupons', Coupon);
dbService.registerModel('payments', Payment);
dbService.registerModel('notifications', Notification);

module.exports = {
  User,
  Seller,
  Category,
  Product,
  Review,
  Order,
  Cart,
  Wishlist,
  Coupon,
  Payment,
  Notification
};
