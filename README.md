🚀 ElectroRent - Electronic Rental Marketplace
A Full-Stack MERN Application for Renting Electronics
________________________________________
________________________________________
🎯 About The Project
ElectroRent is a comprehensive full-stack web application that revolutionizes the way people rent electronics. Built with the MERN stack, it provides a seamless platform for users to browse, search, and rent electronic devices while enabling owners to list and manage their inventory efficiently.
🎪 Problem Statement
In today's economy, purchasing expensive electronics like cameras, laptops, or gaming consoles for short-term needs is impractical. ElectroRent addresses this by:
•	Providing access to high-end electronics without ownership costs
•	Enabling owners to monetize idle electronics
•	Creating a trusted marketplace with secure payments
•	Offering location-based discovery for convenient pickups
🌟 Why ElectroRent?
•	For Users: Access premium electronics for events, projects, or trials
•	For Owners: Generate passive income from underutilized electronics
•	For Everyone: Sustainable consumption through sharing economy
________________________________________
✨ Features
🔐 Authentication & Authorization
•	JWT-based secure authentication
•	Role-based access control (User, Owner)
•	Password encryption with bcrypt
•	Protected routes and API endpoints
•	Session management with token expiration
📦 Product Management
•	List electronics with detailed specifications
•	Upload multiple product images
•	Category-based organization (Laptops, Cameras, Gaming, etc.)
•	Dynamic pricing per day
•	Availability status management
•	Product search and filtering
🗺️ Location-Based Features
•	Google Maps Integration 
o	Interactive map for location selection
o	Address autocomplete
o	Drag-and-drop marker placement
o	GPS-based current location detection
•	Geospatial Search 
o	Find products within specified radius (5-100 km)
o	MongoDB 2dsphere indexing for efficient queries
o	Distance-based sorting
o	Popular city quick selection
📅 Booking System
•	Real-time availability checking
•	Date range selection with validation
•	Dynamic price calculation
•	Booking status tracking (Pending → Confirmed → Active → Completed)
•	Edit/cancel booking functionality
•	Booking history and analytics
💳 Payment Integration (Razorpay)
•	Secure payment gateway integration
•	Test and Live mode support
•	Multiple payment methods (Cards, UPI, Net Banking, Wallets)
•	Real-time payment verification
•	Webhook handling for payment confirmation
•	Automatic booking status updates
•	Payment failure handling
📊 User Dashboard
•	For Users: 
o	View all bookings with status
o	Edit upcoming bookings
o	Cancel bookings
o	Booking history and statistics
•	For Owners: 
o	Manage product listings
o	View received booking requests
o	Track earnings
o	Update product availability
o	Analytics dashboard
🔔 Notifications
•	Email notifications via Nodemailer 
o	Booking confirmations
o	Status updates
•	Real-time booking alerts
🔍 Search & Filter
•	Full-text product search
•	Filter by category
•	Price range filtering
•	Location-based filtering
•	Availability status filter
•	Sort by relevance, price, distance
📱 Responsive Design
•	Mobile-first approach
•	Tablet and desktop optimized
•	Touch-friendly interfaces
•	Progressive Web App (PWA) ready
________________________________________
🛠️ Tech Stack
Frontend
Technology	Purpose	Version
React.js	UI Library	18.2.0
React Router	Client-side routing	6.16.0
Context API	State management	Built-in
Axios	HTTP client	1.5.0
@react-google-maps/api	Maps integration	Latest
CSS3	Styling	-
Backend
Technology	Purpose	Version
Node.js	Runtime environment	14+
Express.js	Web framework	4.18.2
MongoDB	Database	7.5.0
Mongoose	ODM	7.5.0
JWT	Authentication	9.0.2
Bcrypt	Password hashing	2.4.3
Third-Party Services
Service	Purpose
Razorpay	Payment processing
Nodemailer	Email notifications
MongoDB Atlas	Cloud database
DevOps & Deployment
Platform	Purpose
Vercel	Frontend hosting
Render	Backend hosting
GitHub	Version control
MongoDB Atlas	Database hosting
________________________________________
🏗️ System Architecture



 


















Sequence diagram
 
Request Flow Example (Booking a Product)

1. User clicks "Book Now"
   ↓
2. Frontend validates dates & address
   ↓
3. POST /api/bookings with JWT token
   ↓
4. Backend: JWT middleware verifies token
   ↓
5. Backend: Controller validates product availability
   ↓
6. Backend: Creates booking in MongoDB (status: pending)
   ↓
7. Backend: Creates Razorpay order
   ↓
8. Backend: Returns order details
   ↓
9. Frontend: Opens Razorpay payment modal
   ↓
10. User completes payment
   ↓
11. Razorpay: Sends webhook to backend
   ↓
12. Backend: Verifies payment signature
   ↓
13. Backend: Updates booking (status: confirmed)
   ↓
14. Backend: Sends email notification
   ↓
15. Frontend: Shows success message
   ↓
16. User sees confirmed booking in dashboard
________________________________________
🚀 Getting Started
Prerequisites
Before you begin, ensure you have the following installed:
•	Node.js (v14 or higher)
•	node --version
•	npm (v6 or higher)
•	npm --version
•	MongoDB (local or Atlas account)
•	mongod --version
•	Git
•	git --version
Required API Keys
You'll need accounts and API keys for:
1.	MongoDB Atlas - Sign up
2.	Razorpay - Sign up
3.	Gmail (for email notifications)

________________________________________
📦 Installation
1. Clone the Repository
git clone https://github.com/yourusername/electrorent.git
cd electrorent
2. Backend Setup
cd backend
npm install
3. Frontend Setup
cd ../frontend
npm install
________________________________________
Getting API Keys
MongoDB Atlas
1.	Create account at https://www.mongodb.com/cloud/atlas
2.	Create free cluster
3.	Create database user
4.	Whitelist IP: 0.0.0.0/0 (for development)
5.	Get connection string
Razorpay
1.	Sign up at https://razorpay.com
2.	Dashboard → Settings → API Keys
3.	Generate Test Key
4.	Copy Key ID and Secret
Google Maps
1.	Go to https://console.cloud.google.com
2.	Create new project
3.	Enable APIs: Maps JavaScript API, Places API, Geocoding API
4.	Create credentials → API Key
5.	Enable billing (free $200/month credit)
Gmail App Password
1.	Enable 2-Factor Authentication
2.	Google Account → Security → App Passwords
3.	Generate password for "Mail"
4.	Use 16-digit password
________________________________________
Running the Application
Development Mode
Option 1: Run Separately
Terminal 1 - MongoDB (if local):
mongod
Terminal 2 - Backend:
cd backend
npm run dev
Backend runs on: http://localhost:5000
Terminal 3 - Frontend:
cd frontend
npm start
Frontend opens: http://localhost:3000
Option 2: Using Concurrently (Root Package.json)
Create package.json in root:
{
  "scripts": {
    "dev": "concurrently \"cd backend && npm run dev\" \"cd frontend && npm start\"",
    "install-all": "cd backend && npm install && cd ../frontend && npm install"
  },
  "devDependencies": {
    "concurrently": "^8.0.0"
  }
}
Run:
npm install
npm run dev
Production Mode
# Backend
cd backend
npm start

# Frontend
cd frontend
npm run build
serve -s build
________________________________________
📚 API Documentation
Base URL
http://localhost:5000/api
Authentication Endpoints
Register User
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user"
}
Response:
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
Login User
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
Get Current User
GET /api/auth/me
Authorization: Bearer YOUR_JWT_TOKEN
Product Endpoints
Get All Products
GET /api/products?category=laptops&minPrice=100&maxPrice=5000
Search Products with Location
GET /api/products/search?q=laptop&lat=28.6139&lng=77.2090&radius=50
Get Product by ID
GET /api/products/:id
Create Product (Owner/Admin)
POST /api/products
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "name": "MacBook Pro 16-inch",
  "description": "High-performance laptop",
  "pricePerDay": 500,
  "category": "laptops",
  "specs": {
    "processor": "M2 Pro",
    "ram": "16GB",
    "storage": "512GB"
  },
  "location": {
    "type": "Point",
    "coordinates": [77.2090, 28.6139],
    "address": "Connaught Place, New Delhi"
  }
}
Update Product
PUT /api/products/:id
Authorization: Bearer YOUR_JWT_TOKEN
Delete Product
DELETE /api/products/:id
Authorization: Bearer YOUR_JWT_TOKEN
Booking Endpoints
Create Booking
POST /api/bookings
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "productId": "64a1b2c3d4e5f6789012345",
  "startDate": "2024-12-01",
  "endDate": "2024-12-05",
  "location": {
    "address": "123 Main St, Mumbai"
  }
}
Get My Bookings
GET /api/bookings/my-bookings
Authorization: Bearer YOUR_JWT_TOKEN
Update Booking
PUT /api/bookings/:id
Authorization: Bearer YOUR_JWT_TOKEN
Cancel Booking
DELETE /api/bookings/:id
Authorization: Bearer YOUR_JWT_TOKEN
Dashboard Endpoint
Get Dashboard Data
GET /api/dashboard
Authorization: Bearer YOUR_JWT_TOKEN
Response:
{
  "success": true,
  "data": {
    "myBookings": [...],
    "myListings": [...],
    "bookingsOnMyListings": [...],
    "stats": {
      "totalBookings": 5,
      "totalListings": 3,
      "activeBookings": 2,
      "totalEarnings": 15000
    }
  }
}
________________________________________
🗄️ Database Schema
Users Collection
{
  _id: ObjectId,
  name: String,
  email: String (unique, indexed),
  password: String (hashed),
  role: String (enum: 'user', 'owner', 'admin'),
  phone: String,
  address: String,
  createdAt: Date,
  updatedAt: Date
}
Products Collection
{
  _id: ObjectId,
  name: String,
  description: String,
  images: [String],
  pricePerDay: Number,
  category: String (enum),
  specs: Map,
  availability: Boolean,
  location: {
    type: 'Point',
    coordinates: [Number], // [longitude, latitude]
    address: String
  },
  owner: ObjectId (ref: 'User'),
  createdAt: Date,
  updatedAt: Date
}
Indexes:
•	location: 2dsphere (for geospatial queries)
•	owner: 1
•	category: 1
Bookings Collection
{
  _id: ObjectId,
  product: ObjectId (ref: 'Product'),
  user: ObjectId (ref: 'User'),
  startDate: Date,
  endDate: Date,
  totalPrice: Number,
  location: {
    address: String,
    coordinates: [Number]
  },
  status: String (enum: 'pending', 'confirmed', 'active', 'completed', 'cancelled'),
  paymentId: String,
  paymentStatus: String (enum: 'pending', 'completed', 'failed', 'refunded'),
  createdAt: Date,
  updatedAt: Date
}
Indexes:
•	user: 1
•	product: 1
•	status: 1
________________________________________
________________________________________
🚀 Deployment
Deploy on Vercel (Frontend)
1.	Push code to GitHub
2.	Go to https://vercel.com
3.	Import repository
4.	Set environment variables: 
5.	REACT_APP_API_URL=https://your-backend.onrender.com/apiREACT_APP_RAZORPAY_KEY_ID=rzp_live_xxxxxxREACT_APP_GOOGLE_MAPS_API_KEY=AIzaSyXXXXX
6.	Deploy
Deploy on Render (Backend)
1.	Push code to GitHub
2.	Go to https://render.com
3.	Create Web Service
4.	Connect repository
5.	Set environment variables (all from .env)
6.	Deploy
MongoDB Atlas Setup
1.	Create cluster
2.	Whitelist IPs
3.	Get connection string
4.	Update MONGO_URI in Render
________________________________________
🧪 Testing
Manual Testing Checklist
•	[ ] User registration
•	[ ] User login
•	[ ] Browse products
•	[ ] Search products
•	[ ] Location-based search
•	[ ] Add product (owner)
•	[ ] Edit product
•	[ ] Book product
•	[ ] Complete payment
•	[ ] View dashboard
•	[ ] Cancel booking
Test Cards (Razorpay)
Success:
Card: 4111 1111 1111 1111
CVV: 123
Expiry: 12/25
Failure:
Card: 4111 1111 1111 1112
CVV: 123
Expiry: 12/25
________________________________________
📝 License
Distributed under the MIT License. See LICENSE for more information.
________________________________________
________________________________________
🙏 Acknowledgments
•	React Documentation
•	MongoDB Documentation
•	Razorpay Documentation
•	Google Maps Platform
•	Express.js
•	Mongoose
•	JWT
•	Vercel
•	Render
________________________________________


