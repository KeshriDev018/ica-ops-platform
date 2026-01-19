# 🔗 **Backend-Frontend Integration Guide**

## ✅ **Current Status**
Your friend has already set up:
- ✅ Redux store with auth slice
- ✅ Axios instance with auto-refresh (`lib/api.js`)
- ✅ Vite proxy configuration
- ✅ BookDemo component integrated with backend

## 📋 **Integration Checklist**

### **Phase 1: Backend Setup (10 mins)**

1. **Create Backend `.env` file**
   ```bash
   cd Backend
   cp .env.example .env
   ```

2. **Update `.env` with your values:**
   ```env
   MONGO_URI=mongodb://localhost:27017/ica-platform
   PORT=8000
   CORS_ORIGIN=http://localhost:5173
   FRONTEND_URL=http://localhost:5173
   ACCESS_TOKEN_SECRET=your-secret-here-change-this
   REFRESH_TOKEN_SECRET=your-refresh-secret-change-this
   RAZORPAY_KEY_ID=rzp_test_xxxxx
   RAZORPAY_KEY_SECRET=your_secret
   ```

3. **Install Backend Dependencies**
   ```bash
   cd Backend
   npm install
   ```

4. **Start MongoDB**
   ```bash
   # On macOS with Homebrew:
   brew services start mongodb-community
   
   # Or use MongoDB Atlas (cloud)
   ```

5. **Start Backend Server**
   ```bash
   cd Backend
   npm run dev
   ```
   ✅ Backend should run on `http://localhost:8000`

### **Phase 2: Frontend Setup (5 mins)**

1. **Frontend `.env` already configured:**
   ```env
   VITE_API_BASE_URL=/api
   ```

2. **Start Frontend**
   ```bash
   cd Frontend
   npm run dev
   ```
   ✅ Frontend should run on `http://localhost:5173`

### **Phase 3: Service Integration (Already Done! 🎉)**

Your friend has already integrated:
- ✅ `demoService.create()` → `/api/demos` (POST)
- ✅ `demoAccountService.verifyDemoByEmail()` → `/api/demos/verify` (POST)
- ✅ Axios auto-refresh token system
- ✅ Redux state management

---

## 🔌 **API Endpoints Reference**

### **Authentication** (`/api/auth`)
```javascript
POST   /api/auth/login                    // Login
POST   /api/auth/refresh                  // Refresh access token
POST   /api/auth/logout                   // Logout
POST   /api/auth/set-password             // Set password (first time)
POST   /api/auth/resend-set-password      // Resend password link
```

### **Demo Management** (`/api/demos`)
```javascript
POST   /api/demos                         // Book demo (PUBLIC)
POST   /api/demos/verify                  // Verify demo by email (PUBLIC)
PATCH  /api/demos/:id/schedule            // Schedule demo (ADMIN)
PATCH  /api/demos/:id/attendance          // Mark attendance (ADMIN)
PATCH  /api/demos/:id/outcome             // Submit outcome (ADMIN)
```

### **Payments** (`/api/payments`)
```javascript
POST   /api/payments/create-order         // Create Razorpay order
POST   /api/payments/verify               // Verify payment
```

### **Students** (`/api/students`)
```javascript
GET    /api/students                      // Get all students (ADMIN)
GET    /api/students/my                   // Get my student (CUSTOMER)
GET    /api/students/coach                // Get coach students (COACH)
PATCH  /api/students/:id/status           // Update status (ADMIN)
PATCH  /api/students/:id/reassign         // Reassign coach/batch (ADMIN)
```

---

## 🧪 **Testing Flow**

### **1. Test Demo Booking (PUBLIC)**
```bash
# Frontend: http://localhost:5173/book-demo
# Fill form and submit
# Should create demo in MongoDB
```

### **2. Test Demo Verification (PUBLIC)**
```bash
# Try logging in with demo email
# Should verify if demo exists
```

### **3. Test Login (After password setup)**
```bash
# Login with:
# Email: admin@chessacademy.com (create manually in MongoDB)
# Password: (set via /set-password endpoint)
```

---

## 🐛 **Common Issues & Solutions**

### **Issue 1: CORS Error**
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution:** 
- Check Backend `.env`: `CORS_ORIGIN=http://localhost:5173`
- Restart backend server

### **Issue 2: 401 Unauthorized**
```
Access token missing or invalid
```
**Solution:**
- Clear localStorage: `localStorage.clear()`
- Login again
- Check Redux store has token

### **Issue 3: Connection Refused**
```
GET http://localhost:8000/api/... net::ERR_CONNECTION_REFUSED
```
**Solution:**
- Ensure backend is running on port 8000
- Check `npm run dev` in Backend folder

### **Issue 4: MongoDB Connection Failed**
```
MONGO DB CONNECTION ERROR
```
**Solution:**
- Start MongoDB: `brew services start mongodb-community`
- Or use MongoDB Atlas connection string
- Check `MONGO_URI` in Backend `.env`

---

## 🔐 **Creating First Admin User**

### **Option 1: Using MongoDB Compass**
1. Open MongoDB Compass
2. Connect to `mongodb://localhost:27017`
3. Database: `ica-platform`
4. Collection: `accounts`
5. Insert Document:
```json
{
  "email": "admin@chessacademy.com",
  "role": "ADMIN",
  "password": "$2b$10$...", // Use bcrypt to hash password
  "createdAt": ISODate(),
  "updatedAt": ISODate()
}
```

### **Option 2: Using MongoDB Shell**
```javascript
mongosh
use ica-platform
db.accounts.insertOne({
  email: "admin@chessacademy.com",
  role: "ADMIN",
  password: null, // Will set via /set-password
  createdAt: new Date(),
  updatedAt: new Date()
})
```

Then use `/api/auth/set-password` to set password.

---

## 🎯 **What's Already Working**

✅ **Demo Booking Flow:**
1. User visits `/book-demo`
2. Fills form → `demoService.create(data)`
3. Backend creates Account + Demo
4. Redirects to `/thank-you`

✅ **Demo Verification:**
1. User enters email
2. `demoAccountService.verifyDemoByEmail(email)`
3. Backend checks if demo exists
4. Returns demo data

✅ **Authentication System:**
1. Login → Access token (15m) + Refresh token (7d)
2. Access token in Redux + localStorage
3. Refresh token in HTTP-only cookie
4. Auto-refresh when access token expires

---

## 📝 **Next Steps**

### **Immediate (Required for Testing)**
1. ✅ Start Backend: `cd Backend && npm run dev`
2. ✅ Start Frontend: `cd Frontend && npm run dev`
3. ✅ Test demo booking: http://localhost:5173/book-demo
4. ⏳ Create admin account in MongoDB
5. ⏳ Test login flow

### **Payment Integration (Phase 2)**
1. Get Razorpay test keys
2. Add keys to Backend `.env`
3. Test payment flow with test cards
4. Implement payment verification

### **Dashboard Integration (Phase 3)**
1. Complete authService (login already working)
2. Complete studentService
3. Complete coachService
4. Complete batchService
5. Complete analyticsService

### **Production Deployment (Phase 4)**
1. Set production environment variables
2. Deploy backend (Railway, Render, AWS)
3. Deploy frontend (Vercel, Netlify)
4. Update CORS settings
5. Test end-to-end

---

## 📱 **Environment Variables Summary**

### **Backend (.env)**
```env
MONGO_URI=mongodb://localhost:27017/ica-platform
PORT=8000
CORS_ORIGIN=http://localhost:5173
FRONTEND_URL=http://localhost:5173
ACCESS_TOKEN_SECRET=your-secret
REFRESH_TOKEN_SECRET=your-secret
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=your_secret
```

### **Frontend (.env)**
```env
VITE_API_BASE_URL=/api
```

---

## ✅ **Integration Complete!**

Your friend has already done 80% of the integration work:
- ✅ API instance with auto-refresh
- ✅ Redux store setup
- ✅ Demo booking integrated
- ✅ Proxy configuration
- ✅ Error handling

**Just start both servers and test!** 🚀
