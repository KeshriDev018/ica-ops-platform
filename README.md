# Indian Chess Academy - Operations Platform

A comprehensive full-stack platform for managing chess academy operations including demo bookings, coach management, student enrollment, and payment processing.

## 🎯 Features

### Public Features
- **Demo Booking System**: Book free demo chess lessons with automated scheduling
- **Email Verification**: Access demo accounts using email verification
- **Payment Integration**: Razorpay integration for subscription payments
- **Meeting Links**: Automated meeting link distribution for demos

### Admin Dashboard
- **Demo Management**: View all demo bookings with status tracking (BOOKED, ATTENDED, PAYMENT_PENDING, CONVERTED)
- **Coach Management**: Add coaches with automated email invitations and password setup
- **Demo Outcomes**: Assign coaches and meeting links to scheduled demos
- **Student Management**: Track converted students and subscriptions
- **Analytics**: Comprehensive dashboard for business metrics

### Coach Dashboard
- **Batch Management**: View and manage assigned batches
- **Student Tracking**: Monitor student progress
- **Schedule Management**: Calendar view of upcoming sessions
- **Materials**: Upload and share learning resources

### Customer Features
- **Subscription Management**: Select and manage subscription plans
- **Payment Processing**: Secure payment handling with Razorpay
- **Demo Access**: Join scheduled demo sessions
- **Account Management**: Password setup after payment

## 🛠️ Tech Stack

### Frontend
- **React 18.3.1** - UI framework
- **Vite 5.4.21** - Build tool and dev server
- **Redux Toolkit** - State management
- **Zustand** - Lightweight state management
- **TanStack Table v8** - Advanced data tables
- **React Router v6** - Client-side routing
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Zod** - Schema validation
- **Axios** - HTTP client

### Backend
- **Node.js** with **Express 5.2.1**
- **MongoDB** with **Mongoose**
- **JWT** - Authentication (access + refresh tokens)
- **Bcrypt** - Password hashing
- **Nodemailer** - Email service
- **Razorpay** - Payment gateway
- **Google AI (Gemini)** - AI integration for intelligent features

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB Atlas account (or local MongoDB)
- Gmail account (for SMTP email service)
- Razorpay account (for payment processing)

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/KeshriDev018/ica-ops-platform.git
cd ica-ops-platform
```

### 2. Backend Setup

```bash
cd Backend
npm install
```

Create `.env` file in the Backend directory:

```env
# Server
PORT=8000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# MongoDB
MONGO_URI=your_mongodb_connection_string

# JWT Secrets
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret

# Email (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_specific_password

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Google AI
GEMINI_API_KEY=your_gemini_api_key
```

### 3. Frontend Setup

```bash
cd Frontend
npm install
```

Update the API base URL in `Frontend/src/lib/api.js` if needed (defaults to `http://localhost:8000/api`).

### 4. Create Admin Account

```bash
cd Backend
node create-admin.js
```

This creates an admin account:
- Email: `admin@chessacademy.com`
- Password: `admin123`

## 🎮 Running the Application

### Option 1: Run Both Servers (Recommended)

From the root directory:

```bash
./start-dev.sh
```

This will start both backend (port 8000) and frontend (port 5173) concurrently.

### Option 2: Run Separately

**Backend:**
```bash
cd Backend
npm run dev
```

**Frontend:**
```bash
cd Frontend
npm run dev
```

### Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **Admin Login**: http://localhost:5173/login

## 📁 Project Structure

```
ica-ops-platform/
├── Backend/
│   ├── src/
│   │   ├── config/          # Database and environment config
│   │   ├── controllers/     # Route controllers
│   │   ├── middlewares/     # Auth, role, and validation middlewares
│   │   ├── models/          # MongoDB schemas
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic services
│   │   └── utils/           # Helper utilities
│   ├── create-admin.js      # Admin account creation script
│   ├── create-coach.js      # Coach account creation script
│   └── test-*.sh            # Testing scripts
│
├── Frontend/
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   ├── pages/           # Page components (admin, coach, customer, auth)
│   │   ├── services/        # API service layer
│   │   ├── redux/           # Redux store and slices
│   │   ├── store/           # Zustand stores
│   │   ├── lib/             # Axios instance and utilities
│   │   └── utils/           # Helper utilities
│   └── public/              # Static assets
│
└── Documentation/
    ├── INTEGRATION_GUIDE.md     # API endpoints documentation
    ├── LOGIN_INTEGRATION.md     # Authentication flow guide
    └── INTEGRATION_COMPLETE.md  # System overview
```

## 🔐 Authentication Flow

1. **Admin/Coach**: Login with credentials → JWT tokens → Role-based dashboard
2. **New Coach**: Email invitation → Set password → Login
3. **New Customer**: Demo booking → Payment → Email with password setup → Login
4. **Demo Access**: Email verification (no password required)

## 🎨 Key Features Implemented

### Admin Features
✅ View all demo bookings with filtering and search  
✅ Assign coaches to demos  
✅ Add meeting links for scheduled demos  
✅ Create coach accounts with email invitations  
✅ Track demo conversion pipeline  

### Demo Management
✅ Public demo booking form  
✅ Email verification for demo access  
✅ Status tracking (BOOKED → ATTENDED → INTERESTED → PAYMENT_PENDING → CONVERTED)  
✅ Meeting link distribution to parents/students  

### Coach Management
✅ Coach creation with automated email invitations  
✅ Password setup via secure token link  
✅ Coach dashboard (in progress)  

### Payment Integration
✅ Razorpay payment gateway integration  
✅ Subscription plans management  
✅ Payment verification and order tracking  
✅ Automated account creation after successful payment  

## 📚 API Documentation

For detailed API documentation, see:
- [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) - Complete API reference
- [LOGIN_INTEGRATION.md](./LOGIN_INTEGRATION.md) - Authentication endpoints

## 🧪 Testing

### Test Admin Login
```bash
cd Backend
./test-admin-login.sh
```

### Test Demo Flow
```bash
cd Backend
./test-demo-flow.sh
```

### Test API Endpoints
```bash
# Get all demos (requires admin token)
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8000/api/demos

# Get all coaches (requires admin token)
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8000/api/coach
```

## 🔧 Helper Scripts

- `hash.js` - Generate bcrypt password hashes
- `create-admin.js` - Create admin accounts
- `create-coach.js` - Create coach accounts
- `list-all-data.js` - View all database records
- `check-db.js` - Check database connection

## 🌐 Environment Variables

See `.env.example` files in Backend and Frontend directories for required environment variables.

## 🚧 Roadmap

- [ ] Batch management system
- [ ] Student progress tracking
- [ ] Analytics dashboard
- [ ] Payment history and invoicing
- [ ] Chat/messaging system
- [ ] Video lesson integration
- [ ] Mobile app development

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is private and proprietary.

## 👨‍💻 Author

**Yogesh Gupta**  
GitHub: [@KeshriDev018](https://github.com/KeshriDev018)

## 📧 Support

For support, email yogeshg1409@gmail.com or create an issue in the repository.

---

**Last Updated**: January 2026  
**Version**: 1.0.0
