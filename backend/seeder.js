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
      },
      {
        _id: '6652ed9a2d480d195cbb294e',
        name: 'Acoustics Airbud Pro',
        description: 'True wireless active noise cancelling earbuds with deep bass response, IPX7 sweat resistance, and a smart touchscreen charging case. Enjoy 8 hours of playback time with an extra 24 hours provided by the case.',
        price: 99,
        originalPrice: 149,
        discount: 33,
        category: '6652ed9a2d480d195cbb292a', // Electronics
        brand: 'Acoustics',
        stock: 45,
        images: [
          'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600',
          'https://images.unsplash.com/photo-1608156639585-b3a032ef9689?w=600'
        ],
        variants: [
          { name: 'Color', options: ['Glossy White', 'Carbon Black'] }
        ],
        rating: 4.6,
        reviewsCount: 2,
        seller: '6652ed9a2d480d195cbb291d',
        isFeatured: true,
        isTrending: true,
        specs: {
          'Drivers': '11mm Dynamic',
          'Water Resistance': 'IPX7',
          'Battery Playback': '32 Hours Total',
          'Wireless Charging': 'Qi Supported'
        }
      },
      {
        _id: '6652ed9a2d480d195cbb294f',
        name: 'Apex Mechanical Gaming Keyboard',
        description: 'Premium mechanical keyboard featuring hot-swappable tactile blue switches, customizable per-key RGB backlighting, a brushed aluminum frame, and dedicated multimedia controls with a volume dial.',
        price: 129,
        originalPrice: 159,
        discount: 18,
        category: '6652ed9a2d480d195cbb292a', // Electronics
        brand: 'Quantum Tech',
        stock: 5, // Low stock
        images: [
          'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600',
          'https://images.unsplash.com/photo-1595225476474-87563907a212?w=600'
        ],
        variants: [
          { name: 'Switch Type', options: ['Blue Tactile', 'Red Linear', 'Brown Silent'] }
        ],
        rating: 4.7,
        reviewsCount: 1,
        seller: '6652ed9a2d480d195cbb291d',
        isFeatured: false,
        isTrending: true,
        specs: {
          'Layout': 'Tenkeyless (80%)',
          'Connection': 'USB-C Detachable',
          'Switch Lifespan': '50 Million Keystrokes',
          'Keycaps': 'Double-shot PBT'
        }
      },
      {
        _id: '6652ed9a2d480d195cbb2950',
        name: 'Quantum HD Portable Projector',
        description: 'Bring the cinema anywhere with this ultra-portable 1080p smart projector. Features 800 ANSI lumens of brightness, built-in dual 5W Harman Kardon speakers, Android TV interface, and automatic keystone correction.',
        price: 349,
        originalPrice: 399,
        discount: 12,
        category: '6652ed9a2d480d195cbb292a', // Electronics
        brand: 'Quantum Tech',
        stock: 12,
        images: [
          'https://images.unsplash.com/photo-1535016120720-40c646be5580?w=600'
        ],
        variants: [],
        rating: 4.4,
        reviewsCount: 1,
        seller: '6652ed9a2d480d195cbb291d',
        isFeatured: true,
        isTrending: false,
        specs: {
          'Native Resolution': '1920x1080 (HD)',
          'Brightness': '800 ANSI Lumens',
          'Projection Size': '30 - 150 Inches',
          'Connectivity': 'HDMI, USB, Wi-Fi, Bluetooth'
        }
      },
      {
        _id: '6652ed9a2d480d195cbb2951',
        name: 'Apex Classic Leather Jacket',
        description: 'Crafted from 100% genuine top-grain cowhide leather, this timeless biker jacket features heavy-duty asymmetrical zippers, a soft quilted lining, and multiple zipper pockets. Designed to fit comfortably and wear in beautifully over time.',
        price: 180,
        originalPrice: 240,
        discount: 25,
        category: '6652ed9a2d480d195cbb292b', // Fashion
        brand: 'Outback Gear',
        stock: 8, // Low stock
        images: [
          'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600',
          'https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?w=600'
        ],
        variants: [
          { name: 'Size', options: ['S', 'M', 'L', 'XL'] }
        ],
        rating: 4.8,
        reviewsCount: 1,
        seller: '6652ed9a2d480d195cbb291d',
        isFeatured: true,
        isTrending: true,
        specs: {
          'Material': '100% Top-Grain Leather',
          'Lining': 'Satin Polyester',
          'Style': 'Asymmetrical Moto Biker',
          'Closure': 'YKK Zippers'
        }
      },
      {
        _id: '6652ed9a2d480d195cbb2952',
        name: 'RunFree Carbon Athletic Shoes',
        description: 'Engineered for competitive running and daily training. Features a carbon fiber propulsion plate, responsive dual-density foam midsole, breathable engineered mesh upper, and highly durable rubber traction outsole.',
        price: 110,
        originalPrice: 150,
        discount: 26,
        category: '6652ed9a2d480d195cbb292b', // Fashion
        brand: 'Outback Gear',
        stock: 22,
        images: [
          'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600',
          'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600'
        ],
        variants: [
          { name: 'Size', options: ['8', '9', '10', '11'] }
        ],
        rating: 4.5,
        reviewsCount: 1,
        seller: '6652ed9a2d480d195cbb291d',
        isFeatured: true,
        isTrending: true,
        specs: {
          'Midsole Drop': '8mm',
          'Weight': '210g (Size 9)',
          'Outsole': 'Carbon Rubber Traction',
          'Propulsion': 'Carbon Fiber Plate'
        }
      },
      {
        _id: '6652ed9a2d480d195cbb2953',
        name: 'Apex Smart Wool Overcoat',
        description: 'Stay warm and sharp in this premium wool blend overcoat. Features a single-breasted classic silhouette, notch lapels, structured shoulders, and deep inside pockets. Ideal for formal meetings and winter commuting.',
        price: 150,
        originalPrice: 200,
        discount: 25,
        category: '6652ed9a2d480d195cbb292b', // Fashion
        brand: 'Outback Gear',
        stock: 14,
        images: [
          'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600'
        ],
        variants: [
          { name: 'Size', options: ['M', 'L', 'XL'] }
        ],
        rating: 4.3,
        reviewsCount: 1,
        seller: '6652ed9a2d480d195cbb291d',
        isFeatured: false,
        isTrending: false,
        specs: {
          'Material': '60% Wool, 40% Polyester Blend',
          'Pockets': '2 Side Welts, 2 Interior chest pockets',
          'Lining': 'Full Satin Viscose lining',
          'Closure': 'Classic Button-up'
        }
      },
      {
        _id: '6652ed9a2d480d195cbb2954',
        name: 'Waterproof Tech Windbreaker',
        description: 'Ultralight performance windbreaker built with a fully seam-sealed ripstop fabric. Features adjustable hood toggles, zippered underarm ventilation ports, waterproof chest pockets, and elastic windproof cuffs.',
        price: 69,
        originalPrice: 99,
        discount: 30,
        category: '6652ed9a2d480d195cbb292b', // Fashion
        brand: 'Outback Gear',
        stock: 30,
        images: [
          'https://images.unsplash.com/photo-1548883354-7622d03aca27?w=600'
        ],
        variants: [
          { name: 'Color', options: ['Neon Yellow', 'Stealth Black'] }
        ],
        rating: 4.2,
        reviewsCount: 1,
        seller: '6652ed9a2d480d195cbb291d',
        isFeatured: false,
        isTrending: true,
        specs: {
          'Waterproof Rating': '10,000mm Hydrostatic Head',
          'Fabric': 'Recycled Poly Ripstop',
          'Ventilation': 'Underarm zippered vents',
          'Weight': '180g'
        }
      },
      {
        _id: '6652ed9a2d480d195cbb2955',
        name: 'Apex Precision Espresso Station',
        description: 'Brew professional café-quality espresso, lattes, and cappuccinos in the comfort of your kitchen. Built with a 15-bar Italian pressure pump, integrated conical burr grinder with 30 grind settings, and a commercial-grade steam wand.',
        price: 499,
        originalPrice: 599,
        discount: 16,
        category: '6652ed9a2d480d195cbb292c', // Home
        brand: 'ChefTools',
        stock: 6, // Low stock
        images: [
          'https://images.unsplash.com/photo-1517256064527-09c53b2d0ec6?w=600',
          'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600'
        ],
        variants: [],
        rating: 4.9,
        reviewsCount: 1,
        seller: '6652ed9a2d480d195cbb291d',
        isFeatured: true,
        isTrending: true,
        specs: {
          'Pump Pressure': '15 Bar Italian Pump',
          'Grinder Type': 'Conical Burr (30 settings)',
          'Heating System': 'Thermoblock Dual PID Controller',
          'Water Tank Capacity': '2.0 Liters'
        }
      },
      {
        _id: '6652ed9a2d480d195cbb2956',
        name: 'RoboVac Smart Navigation Vacuum',
        description: 'Keep your floors spotless with zero effort. Features LiDAR smart mapping navigation, 3000Pa strong suction, automated self-emptying base station, and smart home app integration with voice commands.',
        price: 249,
        originalPrice: 329,
        discount: 24,
        category: '6652ed9a2d480d195cbb292c', // Home
        brand: 'ChefTools',
        stock: 15,
        images: [
          'https://images.unsplash.com/photo-1589656966895-2f33e7653819?w=600'
        ],
        variants: [],
        rating: 4.6,
        reviewsCount: 1,
        seller: '6652ed9a2d480d195cbb291d',
        isFeatured: true,
        isTrending: false,
        specs: {
          'Suction Power': '3000 Pa',
          'Battery Capacity': '5200 mAh (150 mins)',
          'Navigation': 'LiDAR Mapping & Obstacle Avoidance',
          'Dustbin Volume': '400ml + 3L Station'
        }
      },
      {
        _id: '6652ed9a2d480d195cbb2957',
        name: 'Minimalist Floor Arc Lamp',
        description: 'Illuminate your living room with a sleek, minimalist floor lamp. Features a curved brushed brass steel stand, a heavy white marble base to prevent tipping, and a smart dimmable LED bulb compatible with Alexa.',
        price: 79,
        originalPrice: 99,
        discount: 20,
        category: '6652ed9a2d480d195cbb292c', // Home
        brand: 'ChefTools',
        stock: 25,
        images: [
          'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600'
        ],
        variants: [],
        rating: 4.4,
        reviewsCount: 1,
        seller: '6652ed9a2d480d195cbb291d',
        isFeatured: false,
        isTrending: true,
        specs: {
          'Material': 'Brushed Brass, White Marble',
          'Height': '190 cm',
          'Bulb Base': 'E26 Dimmable LED Included',
          'Base Weight': '8.5 kg'
        }
      },
      {
        _id: '6652ed9a2d480d195cbb2958',
        name: 'Apex HEPA H13 Air Purifier',
        description: 'Breathe cleaner air in minutes. Features a medical-grade H13 True HEPA filter that captures 99.97% of airborne dust, smoke, pollen, and pet dander. Cleans rooms up to 500 sq ft in less than 15 minutes.',
        price: 119,
        originalPrice: 149,
        discount: 20,
        category: '6652ed9a2d480d195cbb292c', // Home
        brand: 'ChefTools',
        stock: 18,
        images: [
          'https://images.unsplash.com/photo-1626379616459-b2ce1d9decbc?w=600'
        ],
        variants: [],
        rating: 4.7,
        reviewsCount: 1,
        seller: '6652ed9a2d480d195cbb291d',
        isFeatured: false,
        isTrending: false,
        specs: {
          'HEPA Grade': 'Medical H13 True HEPA',
          'CADR Rating': '250 m³/h',
          'Noise Level': '22dB - 50dB',
          'Timer Settings': '2h, 4h, 8h'
        }
      },
      {
        _id: '6652ed9a2d480d195cbb2959',
        name: 'Ergonomic Non-Slip Yoga Mat',
        description: 'Premium eco-friendly TPE yoga mat with alignment guidelines. Offers excellent cushioning thickness, textured double-sided non-slip traction, and lightweight carry strap. Free from PVC and harsh chemicals.',
        price: 29,
        originalPrice: 39,
        discount: 25,
        category: '6652ed9a2d480d195cbb292d', // Fitness
        brand: 'Outback Gear',
        stock: 50,
        images: [
          'https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=600',
          'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600'
        ],
        variants: [
          { name: 'Color', options: ['Sage Green', 'Violet Purple', 'Ocean Blue'] }
        ],
        rating: 4.5,
        reviewsCount: 1,
        seller: '6652ed9a2d480d195cbb291d',
        isFeatured: false,
        isTrending: true,
        specs: {
          'Material': 'Eco-Friendly TPE',
          'Thickness': '6 mm',
          'Dimensions': '183cm x 61cm',
          'Weight': '850g'
        }
      },
      {
        _id: '6652ed9a2d480d195cbb2960',
        name: 'Adjustable Dumbbell Set (Pair)',
        description: 'Compact strength training solution. Adjust your working weights instantly from 5 lbs up to 52.5 lbs each with a simple turn of a dial. Replaces 15 individual dumbbell pairs in a single heavy-duty tray.',
        price: 279,
        originalPrice: 349,
        discount: 20,
        category: '6652ed9a2d480d195cbb292d', // Fitness
        brand: 'Quantum Tech',
        stock: 4, // Very low stock
        images: [
          'https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?w=600',
          'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600'
        ],
        variants: [],
        rating: 4.8,
        reviewsCount: 1,
        seller: '6652ed9a2d480d195cbb291d',
        isFeatured: true,
        isTrending: true,
        specs: {
          'Weight Range': '5 to 52.5 lbs each (2.3 to 24 kg)',
          'Setting Configurations': '15 Weight Adjustments',
          'Handle Material': 'Non-slip Ergonomic steel grip',
          'Trays Included': 'Yes'
        }
      },
      {
        _id: '6652ed9a2d480d195cbb2961',
        name: 'Pro Hydration Trail Backpack',
        description: 'Engineered for long-distance trail running, hiking, and mountain cycling. Includes a premium 2L leak-proof water bladder, thermal insulated compartment, chest strap safety whistle, and high-visibility reflective strips.',
        price: 39,
        originalPrice: 59,
        discount: 33,
        category: '6652ed9a2d480d195cbb292d', // Fitness
        brand: 'Outback Gear',
        stock: 35,
        images: [
          'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600'
        ],
        variants: [],
        rating: 4.3,
        reviewsCount: 1,
        seller: '6652ed9a2d480d195cbb291d',
        isFeatured: false,
        isTrending: false,
        specs: {
          'Bladder Volume': '2.0 Liters Included',
          'Material': 'Waterproof Honeycomb Ripstop Nylon',
          'Reflectors': '360° Safety reflective strips',
          'Storage Volume': '8 Liters total'
        }
      },
      {
        _id: '6652ed9a2d480d195cbb2962',
        name: 'Apex TrailBlazer Mountain Bike',
        description: 'Conquer any rugged off-road trail. Features a durable lightweight aluminum suspension frame, professional 21-speed Shimano drivetrain, responsive mechanical dual disc brakes, and wide 27.5-inch knobby all-terrain tires.',
        price: 399,
        originalPrice: 499,
        discount: 20,
        category: '6652ed9a2d480d195cbb292d', // Fitness
        brand: 'Outback Gear',
        stock: 7, // Low stock
        images: [
          'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600',
          'https://images.unsplash.com/photo-1579308051842-48b4f66f7ee1?w=600'
        ],
        variants: [
          { name: 'Frame Size', options: ['17 Inches (Medium)', '19 Inches (Large)'] }
        ],
        rating: 4.6,
        reviewsCount: 1,
        seller: '6652ed9a2d480d195cbb291d',
        isFeatured: true,
        isTrending: false,
        specs: {
          'Frame Type': 'Lightweight 6061 Aluminum Frame',
          'Speeds Drivetrain': '21-Speed Shimano Gearset',
          'Braking System': 'Dual Mechanical Disc Brakes',
          'Tire Dimension': '27.5 x 2.1 Inches Knobby Tires'
        }
      }
    ];

    const reviews = [
      {
        _id: '6652ed9a2d480d195cbb295a',
        user: '6652ed9a2d480d195cbb291c', // Jane Customer
        product: '6652ed9a2d480d195cbb294a', // Headphones
        rating: 5,
        title: 'Absolutely incredible sound quality!',
        comment: 'I have tried headphones that cost double the price and these sound noticeably crisper. Noise cancelling is fantastic, completely silences my office environment.',
        likes: 12,
        likedBy: [],
        createdAt: '2026-05-20T08:30:00.000Z'
      },
      {
        _id: '6652ed9a2d480d195cbb295b',
        user: '6652ed9a2d480d195cbb291a', // Admin
        product: '6652ed9a2d480d195cbb294a',
        rating: 4,
        title: 'Very comfortable, but a bit heavy',
        comment: 'Ear cushion foams are premium quality. Battery easily lasts all week. The headband gets slightly heavy on long gaming/work sessions, but otherwise excellent.',
        likes: 4,
        likedBy: [],
        createdAt: '2026-05-21T10:15:00.000Z'
      },
      {
        _id: '6652ed9a2d480d195cbb295c',
        user: '6652ed9a2d480d195cbb291b', // Seller
        product: '6652ed9a2d480d195cbb294a',
        rating: 5,
        title: 'ANC works wonders!',
        comment: 'Great connectivity and outstanding bass depth. Highly recommended for daily travel.',
        likes: 0,
        likedBy: [],
        createdAt: '2026-05-22T14:00:00.000Z'
      },
      {
        _id: '6652ed9a2d480d195cbb295d',
        user: '6652ed9a2d480d195cbb291c', // Jane Customer
        product: '6652ed9a2d480d195cbb294b', // Smart watch
        rating: 4.5,
        title: 'Highly functional fitness trackers',
        comment: 'Accurate tracking. Screen is beautiful and easily readable under direct sunlight.',
        likes: 2,
        likedBy: [],
        createdAt: '2026-05-22T09:30:00.000Z'
      },
      {
        _id: '6652ed9a2d480d195cbb295e',
        user: '6652ed9a2d480d195cbb291c', // Jane Customer
        product: '6652ed9a2d480d195cbb294c', // Backpack
        rating: 4,
        title: 'Solid materials, lots of pockets',
        comment: 'It fits my 16 inch laptop easily. The material is very heavy duty and waterproof. Wish it came in more colors.',
        likes: 1,
        likedBy: [],
        createdAt: '2026-05-23T11:45:00.000Z'
      },
      {
        _id: '6652ed9a2d480d195cbb295f',
        user: '6652ed9a2d480d195cbb291c', // Jane Customer
        product: '6652ed9a2d480d195cbb294d', // Blender
        rating: 5,
        title: 'Powerful motor blenders!',
        comment: 'Blends frozen fruits with absolutely zero issues. Clean-up is very simple. High value kitchen accessory.',
        likes: 6,
        likedBy: [],
        createdAt: '2026-05-24T16:20:00.000Z'
      },
      {
        _id: '6652ed9a2d480d195cbb296a',
        user: '6652ed9a2d480d195cbb291c',
        product: '6652ed9a2d480d195cbb294e', // Earbuds
        rating: 5,
        title: 'Compact and punchy',
        comment: 'ANC is surprisingly good for earbuds of this size. The charging case touchscreen is incredibly useful and futuristic.',
        likes: 3,
        likedBy: [],
        createdAt: '2026-05-24T18:00:00.000Z'
      },
      {
        _id: '6652ed9a2d480d195cbb296b',
        user: '6652ed9a2d480d195cbb291c',
        product: '6652ed9a2d480d195cbb294f', // Keyboard
        rating: 5,
        title: 'Tactile clicks are perfect',
        comment: 'Love the switches, hot-swappable design is excellent. Perfect for typing and gaming.',
        likes: 2,
        likedBy: [],
        createdAt: '2026-05-25T10:30:00.000Z'
      },
      {
        _id: '6652ed9a2d480d195cbb296c',
        user: '6652ed9a2d480d195cbb291c',
        product: '6652ed9a2d480d195cbb2950', // Projector
        rating: 4,
        title: 'Super clear projection',
        comment: 'Very easy keystone setup. Image is vibrant even in a slightly lit room.',
        likes: 1,
        likedBy: [],
        createdAt: '2026-05-25T14:45:00.000Z'
      },
      {
        _id: '6652ed9a2d480d195cbb296d',
        user: '6652ed9a2d480d195cbb291c',
        product: '6652ed9a2d480d195cbb2951', // Leather jacket
        rating: 5,
        title: 'Amazing leather quality',
        comment: 'Smells like high-end leather, fit is snug and perfect. Heavy duty zippers are premium quality.',
        likes: 8,
        likedBy: [],
        createdAt: '2026-05-26T09:15:00.000Z'
      },
      {
        _id: '6652ed9a2d480d195cbb296e',
        user: '6652ed9a2d480d195cbb291c',
        product: '6652ed9a2d480d195cbb2952', // Shoes
        rating: 4.5,
        title: 'Feels like walking on clouds',
        comment: 'The carbon plate gives a nice spring to every stride. Great for short sprints or full marathons.',
        likes: 5,
        likedBy: [],
        createdAt: '2026-05-26T12:00:00.000Z'
      },
      {
        _id: '6652ed9a2d480d195cbb296f',
        user: '6652ed9a2d480d195cbb291c',
        product: '6652ed9a2d480d195cbb2955', // Espresso machine
        rating: 5,
        title: 'Espresso is top tier!',
        comment: 'The grinder is exceptionally consistent. PID control lets you dial in the temperature perfectly.',
        likes: 15,
        likedBy: [],
        createdAt: '2026-05-26T15:30:00.000Z'
      },
      {
        _id: '6652ed9a2d480d195cbb2970',
        user: '6652ed9a2d480d195cbb291c',
        product: '6652ed9a2d480d195cbb2960', // Dumbbells
        rating: 5,
        title: 'Space saver',
        comment: 'Dial clicks securely, changing weights is smooth. Solid build quality, replaces a full rack.',
        likes: 9,
        likedBy: [],
        createdAt: '2026-05-27T08:00:00.000Z'
      },
      {
        _id: '6652ed9a2d480d195cbb2971',
        user: '6652ed9a2d480d195cbb291c',
        product: '6652ed9a2d480d195cbb2962', // Mountain bike
        rating: 5,
        title: 'Handles trails like a champ',
        comment: 'Durable frame, shifters are snappy, brakes are incredibly powerful. Terrific ride.',
        likes: 4,
        likedBy: [],
        createdAt: '2026-05-27T09:10:00.000Z'
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
