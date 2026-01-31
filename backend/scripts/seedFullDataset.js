const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const Product = require('../models/Product');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Review = require('../models/Review');

const indianCities = [
  { name: 'Mumbai', lat: 19.076, lng: 72.8777 },
  { name: 'Delhi', lat: 28.7041, lng: 77.1025 },
  { name: 'Bangalore', lat: 12.9716, lng: 77.5946 },
  { name: 'Hyderabad', lat: 17.385, lng: 78.4867 },
  { name: 'Chennai', lat: 13.0827, lng: 80.2707 },
  { name: 'Kolkata', lat: 22.5726, lng: 88.3639 },
  { name: 'Pune', lat: 18.5204, lng: 73.8567 },
  { name: 'Ahmedabad', lat: 23.0225, lng: 72.5714 },
  { name: 'Jaipur', lat: 26.9124, lng: 75.7873 },
  { name: 'Surat', lat: 21.1702, lng: 72.8311 },
  { name: 'Lucknow', lat: 26.8467, lng: 80.9462 },
  { name: 'Kanpur', lat: 26.4499, lng: 80.3319 },
  { name: 'Nagpur', lat: 21.1458, lng: 79.0882 },
  { name: 'Indore', lat: 22.7196, lng: 75.8577 },
  { name: 'Thane', lat: 19.2183, lng: 72.9781 },
  { name: 'Bhopal', lat: 23.2599, lng: 77.4126 },
  { name: 'Visakhapatnam', lat: 17.6868, lng: 83.2185 },
  { name: 'Patna', lat: 25.5941, lng: 85.1376 },
  { name: 'Vadodara', lat: 22.3072, lng: 73.1812 },
  { name: 'Ghaziabad', lat: 28.6692, lng: 77.4538 },
];

const productTemplates = [
  { name: 'MacBook Pro 16"', category: 'laptops', pricePerDay: 500, description: 'High-performance laptop for professionals', images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800'] },
  { name: 'Dell XPS 15', category: 'laptops', pricePerDay: 400, description: 'Premium Windows laptop with stunning display', images: ['https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800'] },
  { name: 'Canon EOS R5', category: 'cameras', pricePerDay: 800, description: 'Professional mirrorless camera', images: ['https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800'] },
  { name: 'Sony A7 III', category: 'cameras', pricePerDay: 700, description: 'Full-frame mirrorless camera', images: ['https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800'] },
  { name: 'GoPro Hero 11', category: 'cameras', pricePerDay: 200, description: 'Action camera for adventures', images: ['https://images.unsplash.com/photo-1519638399535-1b036603ac77?w=800'] },
  { name: 'Sony WH-1000XM5', category: 'audio', pricePerDay: 100, description: 'Premium noise-canceling headphones', images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'] },
  { name: 'PlayStation 5', category: 'gaming', pricePerDay: 300, description: 'Latest generation gaming console', images: ['https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800'] },
  { name: 'iPhone 15 Pro Max', category: 'smartphones', pricePerDay: 200, description: 'Latest flagship iPhone', images: ['https://images.unsplash.com/photo-1592286927505-b7e2e0f7b5b1?w=800'] },
  { name: 'Nintendo Switch OLED', category: 'gaming', pricePerDay: 200, description: 'Portable gaming console', images: ['https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=800'] },
  { name: 'Meta Quest 3', category: 'gaming', pricePerDay: 350, description: 'VR headset for immersive gaming', images: ['https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=800'] },
];

const sampleReviews = [
  'Excellent product, worked flawlessly.',
  'Good value for money. Highly recommend.',
  'Arrived with minor scratches but worked fine.',
  'Battery life was shorter than expected.',
  'Amazing camera quality, captured great shots.',
  'Not as described, had issues on first day.',
  'Perfect for short-term projects.',
  'Owner was responsive and helpful.',
  'Would rent again, very satisfied.',
  'Decent equipment but packaging was poor.',
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    // Drop database
    await mongoose.connection.db.dropDatabase();
    console.log('✅ Database dropped');

    // Create users
    const passwordHash = await bcrypt.hash('password123', 10);

    const admin = await User.create({ name: 'Admin User', email: 'admin@example.com', password: 'password123', role: 'admin' });

    const owners = [];
    for (let i = 1; i <= 8; i++) {
      const u = await User.create({
        name: `Owner ${i}`,
        email: `owner${i}@example.com`,
        password: 'password123',
        role: 'owner',
        phone: `+91${9000000000 + i}`,
        address: `${indianCities[i % indianCities.length].name}`,
      });
      owners.push(u);
    }

    const renters = [];
    for (let i = 1; i <= 40; i++) {
      const u = await User.create({
        name: `Renter ${i}`,
        email: `renter${i}@example.com`,
        password: 'password123',
        role: 'user',
        phone: `+91${8000000000 + i}`,
        address: `${indianCities[(i + 5) % indianCities.length].name}`,
      });
      renters.push(u);
    }

    // Create products
    const products = [];
    for (let i = 0; i < 300; i++) {
      const template = productTemplates[i % productTemplates.length];
      const city = indianCities[i % indianCities.length];

      const specs = {
        brand: ['Apple','Dell','Canon','Sony','Nikon','HP','Lenovo'][i % 7],
        model: `Model ${i + 1}`,
        year: String(2018 + (i % 6)),
      };

      const product = {
        name: `${template.name} #${Math.floor(i / productTemplates.length) + 1}`,
        description: template.description,
        category: template.category,
        pricePerDay: Math.round(template.pricePerDay + (Math.random() * 150 - 75)),
        owner: owners[i % owners.length]._id,
        images: template.images,
        location: {
          type: 'Point',
          coordinates: [city.lng + (Math.random() - 0.5) * 0.1, city.lat + (Math.random() - 0.5) * 0.1],
          address: `${city.name}, India`,
        },
        availability: Math.random() > 0.1,
        specs,
      };

      products.push(product);
    }

    const insertedProducts = await Product.insertMany(products);
    console.log(`✅ Inserted ${insertedProducts.length} products`);

    // Create bookings and reviews for some products
    const bookings = [];
    const reviews = [];

    for (let i = 0; i < insertedProducts.length; i++) {
      // 60% of products get between 0-3 completed bookings
      const chance = Math.random();
      if (chance > 0.4) {
        const reviewCount = Math.floor(Math.random() * 3); // 0-2 reviews
        for (let r = 0; r < reviewCount; r++) {
          const renter = renters[Math.floor(Math.random() * renters.length)];
          const start = new Date();
          start.setDate(start.getDate() - (10 + Math.floor(Math.random() * 30)));
          const end = new Date(start);
          end.setDate(start.getDate() + (1 + Math.floor(Math.random() * 7)));

          const totalPrice = Math.ceil(((end - start) / (1000 * 60 * 60 * 24)) * insertedProducts[i].pricePerDay);

          const booking = await Booking.create({
            product: insertedProducts[i]._id,
            user: renter._id,
            startDate: start,
            endDate: end,
            totalPrice,
            location: {
              address: insertedProducts[i].location.address,
              coordinates: insertedProducts[i].location.coordinates,
            },
            status: 'completed',
            paymentStatus: 'completed',
          });

          bookings.push(booking);

          // Create a review for this completed booking
          const rating = Math.floor(Math.random() * 5) + 1;
          const comment = sampleReviews[Math.floor(Math.random() * sampleReviews.length)];

          const review = await Review.create({
            product: insertedProducts[i]._id,
            user: renter._id,
            rating,
            comment,
          });

          reviews.push(review);
        }
      }
    }

    console.log(`✅ Created ${bookings.length} bookings and ${reviews.length} reviews`);

    // Recalculate ratings for all products
    const prods = await Product.find();
    for (const p of prods) {
      const agg = await Review.aggregate([
        { $match: { product: p._id } },
        { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
      ]);
      if (agg.length > 0) {
        p.averageRating = Number(agg[0].avg.toFixed(2));
        p.reviewsCount = agg[0].count;
        await p.save();
      }
    }

    console.log('✅ Product ratings updated');

    console.log('\n📊 Summary:');
    const counts = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Booking.countDocuments(),
      Review.countDocuments(),
    ]);

    console.log(`Users: ${counts[0]}`);
    console.log(`Products: ${counts[1]}`);
    console.log(`Bookings: ${counts[2]}`);
    console.log(`Reviews: ${counts[3]}`);

    mongoose.connection.close();
    console.log('\n✨ Seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seed();
