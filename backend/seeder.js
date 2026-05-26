const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

// Temporary mock DB mode detection
global.dbMode = (process.env.USE_MOCK_DB === 'true' || !process.env.MONGO_URI) ? 'mock' : 'mongodb';

const dbService = require('./services/dbService');
const models = require('./models'); // Registers models automatically

const seedData = async () => {
  console.log('🔄 Seeding database...');

  try {
    // 1. Prepare hashed passwords
    const salt = await bcrypt.genSalt(10);
    const hashedAdminPwd = await bcrypt.hash('admin123', salt);
    const hashedSellerPwd = await bcrypt.hash('seller123', salt);
    const hashedUserPwd = await bcrypt.hash('user123', salt);

    // Users
    const users = [
      {
        _id: '6652ed9a2d480d195cbb291a',
        name: 'Apex Admin User',
        email: 'admin@apex.com',
        password: hashedAdminPwd,
        role: 'admin',
        isVerified: true,
        addresses: [
          {
            street: '100 Admin HQ Blvd',
            city: 'Silicon Valley',
            state: 'CA',
            zip: '94025',
            country: 'USA',
            isDefault: true
          }
        ]
      },
      {
        _id: '6652ed9a2d480d195cbb291b',
        name: 'Super Seller Store',
        email: 'seller@apex.com',
        password: hashedSellerPwd,
        role: 'seller',
        isVerified: true,
        addresses: [
          {
            street: '456 Warehouse Lane',
            city: 'Austin',
            state: 'TX',
            zip: '78701',
            country: 'USA',
            isDefault: true
          }
        ]
      },
      {
        _id: '6652ed9a2d480d195cbb291c',
        name: 'Jane Customer Doe',
        email: 'user@apex.com',
        password: hashedUserPwd,
        role: 'customer',
        isVerified: true,
        addresses: [
          {
            street: '789 Cozy Apartment Rd',
            city: 'New York',
            state: 'NY',
            zip: '10001',
            country: 'USA',
            isDefault: true
          }
        ]
      }
    ];

    // Sellers profile
    const sellers = [
      {
        _id: '6652ed9a2d480d195cbb291d',
        user: '6652ed9a2d480d195cbb291b',
        storeName: 'Apex Prime Store',
        description: 'Authorized retailer of elite electronics and accessories.',
        logo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=150',
        banner: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000',
        rating: 4.8,
        reviewsCount: 154,
        isVerified: true
      }
    ];

    // Categories
    const categories = [
      {
        _id: '6652ed9a2d480d195cbb292a',
        name: 'Electronics',
        slug: 'electronics',
        description: 'Gadgets, smartphones, laptops, and wearable tech.',
        image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400'
      },
      {
        _id: '6652ed9a2d480d195cbb292b',
        name: 'Fashion & Apparel',
        slug: 'fashion',
        description: 'Trendy clothing, shoes, and lifestyle wearables.',
        image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400'
      },
      {
        _id: '6652ed9a2d480d195cbb292c',
        name: 'Home & Living',
        slug: 'home-living',
        description: 'Furniture, kitchen appliances, and home decor items.',
        image: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=400'
      },
      {
        _id: '6652ed9a2d480d195cbb292d',
        name: 'Fitness & Outdoors',
        slug: 'fitness-outdoors',
        description: 'Sports gears, accessories, and gym equipment.',
        image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400'
      }
    ];

    // Coupons
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);

    const coupons = [
      {
        _id: '6652ed9a2d480d195cbb293a',
        code: 'SAVE10',
        discountType: 'percentage',
        discountValue: 10,
        minOrderAmount: 30,
        startDate: new Date().toISOString(),
        endDate: nextYear.toISOString(),
        isActive: true
      },
      {
        _id: '6652ed9a2d480d195cbb293b',
        code: 'SAVE20',
        discountType: 'percentage',
        discountValue: 20,
        minOrderAmount: 50,
        maxDiscountAmount: 30,
        startDate: new Date().toISOString(),
        endDate: nextYear.toISOString(),
        isActive: true
      },
      {
        _id: '6652ed9a2d480d195cbb293c',
        code: 'FLAT50',
        discountType: 'fixed',
        discountValue: 50,
        minOrderAmount: 200,
        startDate: new Date().toISOString(),
        endDate: nextYear.toISOString(),
        isActive: true
      }
    ];

    // Products
    const products = [
      {
        _id: '6652ed9a2d480d195cbb294a',
        name: 'Titan Over-Ear Wireless ANC Headphones',
        description: 'Experience studio-quality audio with advanced Active Noise Cancelling technology. Features 40 hours of battery life, fast charging USB-C, plush memory foam earcups, and dual beamforming microphones for crystal clear voice calls.',
        price: 199,
        originalPrice: 249,
        discount: 20,
        category: '6652ed9a2d480d195cbb292a', // Electronics
        brand: 'Acoustics',
        stock: 35,
        images: [
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600',
          'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600',
          'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600'
        ],
        variants: [
          { name: 'Color', options: ['Matte Black', 'Polar White', 'Deep Navy'] }
        ],
        rating: 4.8,
        reviewsCount: 3,
        seller: '6652ed9a2d480d195cbb291d',
        isFeatured: true,
        isTrending: true,
        specs: {
          'Battery Life': '40 Hours',
          'Noise Cancelling': 'Yes (Active)',
          'Bluetooth Version': '5.2',
          'Weight': '250g'
        }
      },
      {
        _id: '6652ed9a2d480d195cbb294b',
        name: 'Quantum V2 Ultra Smart Watch',
        description: 'Track your health, receive alerts, and control smart home accessories with the Quantum Smart Watch. Comes with a vibrant 1.9-inch AMOLED screen, integrated GPS compass, ECG cardiac scanner, and water resistance up to 50 meters.',
        price: 299,
        originalPrice: 349,
        discount: 14,
        category: '6652ed9a2d480d195cbb292a', // Electronics
        brand: 'Quantum Tech',
        stock: 18,
        images: [
          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600',
          'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=600'
        ],
        variants: [
          { name: 'Strap Material', options: ['Sport Silicon', 'Classic Leather', 'Milanese Mesh'] }
        ],
        rating: 4.5,
        reviewsCount: 1,
        seller: '6652ed9a2d480d195cbb291d',
        isFeatured: true,
        isTrending: false,
        specs: {
          'Display Size': '1.9 Inches AMOLED',
          'Waterproof Grade': 'IP68 / 50m',
          'Sensors': 'Heart rate, SpO2, GPS',
          'OS Support': 'iOS & Android'
        }
      },
      {
        _id: '6652ed9a2d480d195cbb294c',
        name: 'Urban Explorer Waterproof Backpack',
        description: 'Engineered for commuting, traveling, and day hikes. Includes a TSA-friendly padded laptop slot for screens up to 16 inches, anti-theft pockets, a USB pass-through charging socket, and breathable airflow back support.',
        price: 49,
        originalPrice: 79,
        discount: 37,
        category: '6652ed9a2d480d195cbb292b', // Fashion
        brand: 'Outback Gear',
        stock: 50,
        images: [
          'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600',
          'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=600'
        ],
        variants: [
          { name: 'Capacity', options: ['25 Litres', '35 Litres'] }
        ],
        rating: 4.2,
        reviewsCount: 1,
        seller: '6652ed9a2d480d195cbb291d',
        isFeatured: false,
        isTrending: true,
        specs: {
          'Material': '1680D Ballistic Nylon',
          'Laptop Pocket': 'Up to 16 Inches',
          'Capacity': '25L / 35L',
          'Features': 'Waterproof, USB Charger'
        }
      },
      {
        _id: '6652ed9a2d480d195cbb294d',
        name: 'Apex Multi-Speed Pro Kitchen Blender',
        description: 'Create creamy smoothies, crushed ice mocktails, and thick vegetable soups in seconds. Backed by a high-torque 1200W motor, professional grade stainless steel blades, and a large BPA-free 2.0L impact-resistant jar.',
        price: 89,
        originalPrice: 120,
        discount: 25,
        category: '6652ed9a2d480d195cbb292c', // Home
        brand: 'ChefTools',
        stock: 25,
        images: [
          'https://images.unsplash.com/photo-1578643463396-0997cb5328c1?w=600'
        ],
        variants: [],
        rating: 4.7,
        reviewsCount: 1,
        seller: '6652ed9a2d480d195cbb291d',
        isFeatured: false,
        isTrending: false,
        specs: {
          'Motor Capacity': '1200 Watts',
          'Pitcher Volume': '2.0 Liters',
          'Speed Levels': '5 + Pulse',
          'Blade Material': 'Stainless Steel'
        }
      }
    ];

    // Reviews
    const reviews = [
      {
        _id: '6652ed9a2d480d195cbb295a',
        user: '6652ed9a2d480d195cbb291c', // Jane Customer
        product: '6652ed9a2d480d195cbb294a', // Headphones
        rating: 5,
        title: 'Absolutely incredible sound quality!',
        comment: 'I have tried headphones that cost double the price and these sound noticeably crisper. Noise cancelling is fantastic, completely silences my office environment.',
        likes: 12,
        likedBy: []
      },
      {
        _id: '6652ed9a2d480d195cbb295b',
        user: '6652ed9a2d480d195cbb291a', // Admin
        product: '6652ed9a2d480d195cbb294a',
        rating: 4,
        title: 'Very comfortable, but a bit heavy',
        comment: 'Ear cushion foams are premium quality. Battery easily lasts all week. The headband gets slightly heavy on long gaming/work sessions, but otherwise excellent.',
        likes: 4,
        likedBy: []
      },
      {
        _id: '6652ed9a2d480d195cbb295c',
        user: '6652ed9a2d480d195cbb291b', // Seller
        product: '6652ed9a2d480d195cbb294a',
        rating: 5,
        title: 'ANC works wonders!',
        comment: 'Great connectivity and outstanding bass depth. Highly recommended for daily travel.',
        likes: 0,
        likedBy: []
      },
      {
        _id: '6652ed9a2d480d195cbb295d',
        user: '6652ed9a2d480d195cbb291c', // Jane Customer
        product: '6652ed9a2d480d195cbb294b', // Smart watch
        rating: 4.5,
        title: 'Highly functional fitness trackers',
        comment: 'Accurate tracking. Screen is beautiful and easily readable under direct sunlight.',
        likes: 2,
        likedBy: []
      },
      {
        _id: '6652ed9a2d480d195cbb295e',
        user: '6652ed9a2d480d195cbb291c', // Jane Customer
        product: '6652ed9a2d480d195cbb294c', // Backpack
        rating: 4,
        title: 'Solid materials, lots of pockets',
        comment: 'It fits my 16 inch laptop easily. The material is very heavy duty and waterproof. Wish it came in more colors.',
        likes: 1,
        likedBy: []
      },
      {
        _id: '6652ed9a2d480d195cbb295f',
        user: '6652ed9a2d480d195cbb291c', // Jane Customer
        product: '6652ed9a2d480d195cbb294d', // Blender
        rating: 5,
        title: 'Powerful motor blenders!',
        comment: 'Blends frozen fruits with absolutely zero issues. Clean-up is very simple. High value kitchen accessory.',
        likes: 6,
        likedBy: []
      }
    ];

    if (global.dbMode === 'mongodb') {
      // Connect and seed Mongo
      if (mongoose.connection.readyState === 0) {
        await mongoose.connect(process.env.MONGO_URI);
      }
      
      // Wipe collections
      await models.User.deleteMany({});
      await models.Seller.deleteMany({});
      await models.Category.deleteMany({});
      await models.Product.deleteMany({});
      await models.Review.deleteMany({});
      await models.Coupon.deleteMany({});
      await models.Order.deleteMany({});
      await models.Cart.deleteMany({});
      await models.Notification.deleteMany({});

      // Insert data
      await models.User.insertMany(users);
      await models.Seller.insertMany(sellers);
      await models.Category.insertMany(categories);
      await models.Product.insertMany(products);
      await models.Review.insertMany(reviews);
      await models.Coupon.insertMany(coupons);
      
      console.log('🔌 [Seeder] MongoDB seeded successfully!');
      process.exit(0);
    } else {
      // Seed local JSON files
      const dataDir = path.join(__dirname, 'data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      
      fs.writeFileSync(path.join(dataDir, 'users.json'), JSON.stringify(users, null, 2));
      fs.writeFileSync(path.join(dataDir, 'sellers.json'), JSON.stringify(sellers, null, 2));
      fs.writeFileSync(path.join(dataDir, 'categories.json'), JSON.stringify(categories, null, 2));
      fs.writeFileSync(path.join(dataDir, 'products.json'), JSON.stringify(products, null, 2));
      fs.writeFileSync(path.join(dataDir, 'reviews.json'), JSON.stringify(reviews, null, 2));
      fs.writeFileSync(path.join(dataDir, 'coupons.json'), JSON.stringify(coupons, null, 2));
      fs.writeFileSync(path.join(dataDir, 'orders.json'), JSON.stringify([], null, 2));
      fs.writeFileSync(path.join(dataDir, 'carts.json'), JSON.stringify([], null, 2));
      fs.writeFileSync(path.join(dataDir, 'wishlists.json'), JSON.stringify([], null, 2));
      fs.writeFileSync(path.join(dataDir, 'payments.json'), JSON.stringify([], null, 2));
      fs.writeFileSync(path.join(dataDir, 'notifications.json'), JSON.stringify([], null, 2));

      console.log('📁 [Seeder] Local JSON database files seeded successfully!');
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Seeder Error:', error);
    process.exit(1);
  }
};

seedData();
