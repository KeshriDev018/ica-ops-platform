# Indian Chess Academy - Frontend

A modern, full-featured web application for managing chess academy operations with role-based dashboards, demo booking system, payment integration, and real-time chat functionality.

![React](https://img.shields.io/badge/React-18.3.1-blue)
![Vite](https://img.shields.io/badge/Vite-5.4.21-646CFF)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.13-38B2AC)
![Three.js](https://img.shields.io/badge/Three.js-Latest-black)

## 🎯 Features

### Public Features
- 🏠 **Landing Page** with 3D chess pieces (Three.js + React Three Fiber)
- 📅 **Demo Booking System** with email verification
- 💳 **Payment Integration** (Razorpay) for demo upgrades
- 🏆 **3D Victory Animation** on thank you page
- 📱 **Fully Responsive** design with mobile-first approach

### Role-Based Dashboards

#### Admin Dashboard
- 📊 **Real-time Metrics**: Total students, active coaches, batches, revenue
- 👥 **Student Management**: CRUD operations with search and filters
- 👨‍🏫 **Coach Management**: Assign batches, track availability
- 📚 **Batch Management**: Create, schedule, and monitor classes
- 💰 **Payment Tracking**: Revenue analytics and subscription management
- 📈 **Analytics**: Charts for weekly revenue and demo conversions
- 💬 **Communication**: Chat with coaches and parents

#### Coach Dashboard
- 📊 **Teaching Overview**: Student count, active batches, today's schedule
- 👨‍🎓 **Student Progress**: View ratings, attendance, performance
- 📅 **Schedule Management**: View and manage class calendar
- 💬 **Batch Chat**: Communicate with students and parents
- 📄 **Material Upload**: Share study materials and resources
- 📈 **Performance Tracking**: Monitor student improvement

#### Customer (Student/Parent) Dashboard
- 🎯 **Progress Tracking**: Current rating with trend indicators
- 📚 **Attendance Monitoring**: Classes attended with percentage
- 📅 **Schedule View**: Next class with date and time
- 💬 **Batch Communication**: Chat with coach and peers
- 💳 **Payment History**: View transactions and receipts
- 👤 **Profile Management**: Update personal information

### 3D Features
- 🎮 **Interactive 3D Elements**: Floating chess pieces, hover effects
- 🏆 **Victory Knight Animation**: Celebratory 3D animation with particles
- 🎨 **Card Hover Effects**: 6 different 3D effects (Float, Rotate, Scale, Flip, Glow, Bounce)
- ✨ **Smooth Animations**: GPU-accelerated CSS transforms

## 🛠️ Tech Stack

### Core
- **React 18.3.1** - UI library
- **Vite 5.4.21** - Build tool and dev server
- **React Router 6** - Client-side routing
- **Zustand** - State management

### Styling & UI
- **Tailwind CSS 3.4.13** - Utility-first CSS framework
- **PostCSS** - CSS processing
- **Custom Design System** - Navy, Orange, Cream, Olive color palette

### 3D Graphics
- **Three.js** - 3D graphics library
- **@react-three/fiber 8.15.0** - React renderer for Three.js
- **@react-three/drei 9.80.0** - Helper library for Three.js

### Data & Charts
- **Recharts 2.14.1** - Charting library for analytics
- **date-fns 4.1.0** - Date formatting and manipulation

### Forms & Validation
- **React Hook Form 7.54.2** - Form state management
- **Yup 1.4.0** - Schema validation

### HTTP & API
- **Axios 1.7.9** - HTTP client for API requests

### Payment
- **Razorpay Checkout** - Payment gateway integration

## 📁 Project Structure

```
ICA_Frontend/
├── public/
│   ├── LOGO.png                    # Academy logo
│   ├── coaches/                    # Coach profile images
│   │   ├── COACH1.png
│   │   ├── COACH2.png
│   │   └── COACH3.png
│   └── Testimonials/               # Testimonial images
│       ├── PARENT1.png
│       ├── PARENT2.png
│       └── STUDENT.png
│
├── src/
│   ├── components/
│   │   ├── 3d/                     # 3D Components
│   │   │   ├── Card3DHover.jsx     # 3D tilt card wrapper
│   │   │   ├── CardHoverEffects.jsx # 6 different hover effects
│   │   │   └── VictoryKnight.jsx   # Victory animation
│   │   ├── chat/                   # Chat Components
│   │   │   ├── MessageInput.jsx
│   │   │   ├── MessageItem.jsx
│   │   │   └── MessageList.jsx
│   │   ├── common/                 # Reusable UI Components
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── FloatingChessPieces.jsx
│   │   │   └── WatermarkBackground.jsx
│   │   ├── forms/                  # Form Components
│   │   │   ├── FormInput.jsx
│   │   │   ├── FormSelect.jsx
│   │   │   └── FormTextarea.jsx
│   │   └── layout/                 # Layout Components
│   │       ├── Layout.jsx
│   │       ├── ProtectedRoute.jsx
│   │       ├── Sidebar.jsx
│   │       └── Topbar.jsx
│   │
│   ├── pages/
│   │   ├── admin/                  # Admin Pages
│   │   │   ├── Analytics.jsx
│   │   │   ├── Batches.jsx
│   │   │   ├── Chat.jsx
│   │   │   ├── Coaches.jsx
│   │   │   ├── Dashboard.jsx       # ✅ Backend-driven metrics
│   │   │   ├── Demos.jsx
│   │   │   ├── Payments.jsx
│   │   │   └── Students.jsx
│   │   ├── auth/                   # Authentication Pages
│   │   │   ├── ForgotPassword.jsx
│   │   │   └── Login.jsx
│   │   ├── coach/                  # Coach Pages
│   │   │   ├── BatchChat.jsx
│   │   │   ├── Batches.jsx
│   │   │   ├── Calendar.jsx
│   │   │   ├── Dashboard.jsx       # ✅ Backend-driven metrics
│   │   │   ├── Materials.jsx
│   │   │   └── Students.jsx
│   │   ├── customer/               # Customer Pages
│   │   │   ├── BatchChat.jsx
│   │   │   ├── Dashboard.jsx       # ✅ Backend-driven metrics
│   │   │   ├── Payment.jsx
│   │   │   ├── PaymentCheck.jsx
│   │   │   ├── Payments.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Schedule.jsx
│   │   │   └── SubscriptionSelection.jsx
│   │   └── public/                 # Public Pages
│   │       ├── BookDemo.jsx        # Demo booking form
│   │       ├── LandingPage.jsx     # ✅ 3D effects applied
│   │       └── ThankYou.jsx        # ✅ 3D victory animation
│   │
│   ├── services/                   # API Services
│   │   ├── api.js                  # Axios instance with interceptors
│   │   ├── authService.js          # ✅ Ready for backend
│   │   ├── batchService.js         # ✅ Ready for backend
│   │   ├── chatService.js          # ✅ Ready for backend
│   │   ├── coachService.js         # ✅ Ready for backend
│   │   ├── demoService.js          # ✅ Ready for backend
│   │   ├── paymentService.js       # ✅ Ready for backend (Razorpay)
│   │   ├── scheduleService.js      # ✅ Ready for backend
│   │   ├── studentService.js       # ✅ Ready for backend
│   │   └── subscriptionService.js  # ✅ Ready for backend
│   │
│   ├── store/                      # State Management
│   │   └── authStore.js            # Zustand auth store with persistence
│   │
│   ├── styles/
│   │   └── index.css               # Global styles + Tailwind
│   │
│   ├── utils/
│   │   └── validationSchemas.js   # Yup validation schemas
│   │
│   ├── App.jsx                     # Main app with routing
│   ├── main.jsx                    # App entry point
│   └── router.jsx                  # Route definitions
│
├── .env                            # Environment variables (create from .env.example)
├── .gitignore
├── index.html                      # HTML template (includes Razorpay script)
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── vite.config.js
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Backend API running (ask your backend team for URL)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/ICA_Frontend.git
cd ICA_Frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Create environment file**
```bash
cp .env.example .env
```

4. **Configure environment variables**
```env
# Backend API URL
VITE_API_BASE_URL=http://localhost:8000/api

# Razorpay Keys (get from backend team)
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id

# App Configuration
VITE_APP_NAME=Indian Chess Academy
```

5. **Start development server**
```bash
npm run dev
```

Visit `http://localhost:5173` in your browser.

## 📜 Available Scripts

```bash
# Development
npm run dev              # Start dev server at localhost:5173

# Production
npm run build            # Build for production
npm run preview          # Preview production build locally

# Linting
npm run lint             # Run ESLint
```

## 🎨 Design System

### Color Palette
```css
--navy:   #003366    /* Primary - Headers, buttons, text */
--orange: #FC8A24    /* Accent - CTAs, highlights */
--cream:  #FFFEF3    /* Background - Main background */
--olive:  #6B8E23    /* Secondary - Badges, icons */
```

### Typography
- **Primary Font**: Figtree (sans-serif) - Body text, UI elements
- **Secondary Font**: Bodoni Moda (serif) - Headings, titles

### UI Style
- **Border Radius**: 12px (cards), 8px (buttons), 50% (avatars)
- **Shadows**: Soft shadows for depth
- **Grid System**: Responsive grid with Tailwind CSS
- **Animations**: Smooth transitions (300ms duration)

### Component Library
- **Cards**: White background, border, shadow, hover effects
- **Buttons**: Primary (orange), secondary (navy), ghost, icon
- **Forms**: Input, select, textarea with validation states
- **3D Effects**: Float, rotate, scale, flip, glow, bounce

## 🔐 Authentication & Authorization

### User Roles
1. **ADMIN** - Full system access
2. **COACH** - Manage assigned students and batches
3. **CUSTOMER** - View progress, attend classes, make payments

### Protected Routes
- Admin routes: `/admin/*`
- Coach routes: `/coach/*`
- Customer routes: `/customer/*`

### Auth Flow
1. Login → JWT token stored in localStorage
2. Token sent in `Authorization: Bearer {token}` header
3. Automatic logout on 401 (token expired)
4. Redirect to login on unauthorized access

## 💳 Payment Integration

### Razorpay Setup
1. Get Razorpay keys from backend team
2. Add keys to `.env` file
3. Razorpay script automatically loaded in `index.html`

### Payment Flow
1. User selects plan
2. Frontend creates order via backend
3. Razorpay checkout opens
4. Payment completed
5. Backend verifies signature
6. Success/failure handled

### Payment Types
- **Demo Payment**: ₹99 - Upgrade demo to full account
- **Subscription Payment**: Monthly/quarterly subscriptions

## 🌐 API Integration

### API Configuration
All API calls go through `src/services/api.js` with:
- Base URL from environment variable
- JWT token auto-injection
- Global error handling
- Request/response interceptors

### Service Layer Pattern
Each feature has dedicated service:
- `authService.js` - Authentication
- `studentService.js` - Student operations
- `coachService.js` - Coach operations
- `batchService.js` - Batch management
- `paymentService.js` - Payment processing
- `chatService.js` - Messaging
- etc.

### Error Handling
- 401 → Auto logout and redirect to login
- 403 → Show permission error
- 500 → Show server error message
- Network errors → Show connection error

## 📊 Dashboard Metrics (Backend-Driven)

### Admin Dashboard
```javascript
{
  totalStudents: { count, trend, trendUp },
  activeCoaches: { count, onLeave },
  activeBatches: { count, upcoming },
  totalRevenue: { amount, trend, trendUp }
}
```

### Coach Dashboard
```javascript
{
  totalStudents: count,
  activeBatches: { total, group, oneOnOne },
  classesToday: { count, nextTime }
}
```

### Customer Dashboard
```javascript
{
  currentRating: { elo, change, trendUp },
  classesAttended: { attended, total, percentage },
  nextClass: { date, time, label }
}
```

## 🎮 3D Features

### Three.js Components
- **VictoryKnight.jsx**: Celebratory chess knight with sparkle particles
- **Card3DHover.jsx**: Mouse-following 3D tilt effect
- **CardHoverEffects.jsx**: 6 different hover animations

### 3D Effects Library
1. **FloatCard3D** - Floats up on hover
2. **RotateCard3D** - 3D rotation following mouse
3. **ScaleCard3D** - Scale with gradient border
4. **FlipCard3D** - Flip to reveal back content
5. **GlowPulseCard3D** - Pulsing glow animation
6. **BounceCard3D** - Bounce with rainbow border

### Performance
- GPU-accelerated CSS transforms
- Lazy loading for 3D components
- Optimized render loops
- Maintains 60fps on modern devices

## 🧪 Testing

### Test User Accounts (Mock Data)
```javascript
// Admin
Email: admin@chessacademy.com
Password: admin123
Role: ADMIN

// Coach
Email: coach1@chessacademy.com
Password: coach123
Role: COACH

// Customer
Email: parent1@example.com
Password: parent123
Role: CUSTOMER
```

### Manual Testing Checklist
- [ ] Login/logout flow (all roles)
- [ ] Demo booking and payment
- [ ] Dashboard metrics display
- [ ] CRUD operations (admin)
- [ ] Chat functionality
- [ ] 3D animations performance
- [ ] Mobile responsiveness
- [ ] Payment gateway integration

## 📦 Deployment

### Build for Production
```bash
npm run build
```
Output: `dist/` folder

### Environment Variables (Production)
```env
VITE_API_BASE_URL=https://api.yourdomain.com/api
VITE_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
```

### Deployment Platforms
- **Vercel** (Recommended) - Zero config, automatic HTTPS
- **Netlify** - Easy setup, form handling
- **AWS S3 + CloudFront** - Scalable, custom domain
- **GitHub Pages** - Free hosting for static sites

### Vercel Deployment
```bash
npm install -g vercel
vercel login
vercel --prod
```

### Netlify Deployment
```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

## 🔧 Backend Integration

### Required Backend Endpoints
See `BACKEND_INTEGRATION.md` for complete API documentation.

### Key Integration Points
1. **Authentication**: `/auth/login`, `/auth/logout`
2. **Demo Booking**: `/demos/book`, `/demos/verify`
3. **Payments**: `/payments/demo/create-order`, `/payments/verify`
4. **Dashboard**: `/admin/dashboard/metrics`, `/coach/metrics`, `/student/metrics`
5. **CRUD**: Students, coaches, batches, schedules

### CORS Configuration
Backend must allow:
- `http://localhost:5173` (development)
- Your production domain

## 🐛 Troubleshooting

### Common Issues

**Issue: CORS Error**
```
Solution: Backend needs to add CORS headers for your frontend domain
```

**Issue: 401 Unauthorized**
```
Solution: Check token in localStorage, verify it's being sent in headers
```

**Issue: Payment not opening**
```
Solution: Verify Razorpay script is loaded in index.html and key is correct
```

**Issue: 3D animations laggy**
```
Solution: Disable animations on low-end devices or reduce particle count
```

**Issue: Images not loading**
```
Solution: Check images are in public/ folder and paths don't start with /src/
```

## 📝 Code Style & Guidelines

### File Naming
- Components: `PascalCase.jsx` (e.g., `Dashboard.jsx`)
- Services: `camelCase.js` (e.g., `authService.js`)
- Utilities: `camelCase.js` (e.g., `validationSchemas.js`)

### Component Structure
```jsx
// 1. Imports
import { useState } from 'react'
import ComponentName from './ComponentName'

// 2. Component
const MyComponent = () => {
  // 3. State and hooks
  const [state, setState] = useState()
  
  // 4. Functions
  const handleClick = () => {}
  
  // 5. Render
  return <div>...</div>
}

// 6. Export
export default MyComponent
```

### Naming Conventions
- Components: `<PascalCase />`
- Variables: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- CSS classes: `kebab-case` (Tailwind)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Commit Message Format
```
feat: Add new feature
fix: Fix bug in component
docs: Update documentation
style: Format code
refactor: Refactor component
test: Add tests
chore: Update dependencies
```

## 📄 License

This project is proprietary and confidential.
© 2026 Indian Chess Academy. All rights reserved.

## 👥 Team

- **Frontend Developer**: [Your Name]
- **Backend Developer**: [Backend Team Member]
- **UI/UX Designer**: [Designer Name]
- **Project Manager**: [PM Name]

## 📞 Support

- **Email**: support@chessacademy.com
- **Documentation**: [Link to docs]
- **Issue Tracker**: [GitHub Issues]

## 🎯 Roadmap

### Completed ✅
- [x] Landing page with 3D effects
- [x] Demo booking system
- [x] Payment integration (Razorpay)
- [x] Role-based dashboards
- [x] Backend-driven metrics
- [x] Chat functionality
- [x] Mobile responsive design

### In Progress 🚧
- [ ] Real-time notifications
- [ ] WebSocket integration for chat
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)

### Planned 📅
- [ ] Video call integration (Zoom/Meet)
- [ ] Tournament management
- [ ] Chess.com integration
- [ ] AI-powered chess analysis
- [ ] Gamification system
- [ ] Parent dashboard enhancements

## 🙏 Acknowledgments

- **Three.js** for amazing 3D capabilities
- **React Team** for the awesome framework
- **Tailwind CSS** for utility-first styling
- **Vite** for blazing fast builds
- **Razorpay** for seamless payment integration

---

**Built with ❤️ for chess enthusiasts** ♟️
