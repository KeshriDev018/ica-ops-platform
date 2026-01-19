import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import ProtectedRoute from './components/layout/ProtectedRoute'

// Public pages
import LandingPage from './pages/public/LandingPage'
import BookDemo from './pages/public/BookDemo'
import ThankYou from './pages/public/ThankYou'
import AccessDemoAccount from './pages/public/AccessDemoAccount'
import DemoLogin from './pages/public/DemoLogin'
import DemoPayment from './pages/public/DemoPayment'
import DemoPaymentSuccess from './pages/public/DemoPaymentSuccess'

// Auth pages
import Login from './pages/auth/Login'
import ForgotPassword from './pages/auth/ForgotPassword'
import SetPassword from './pages/auth/SetPassword'
import AccountCreated from './pages/auth/AccountCreated'

// Customer pages
import CustomerDashboard from './pages/customer/Dashboard'
import CustomerSchedule from './pages/customer/Schedule'
import CustomerBatchChat from './pages/customer/BatchChat'
import CustomerPayments from './pages/customer/Payments'
import CustomerProfile from './pages/customer/Profile'
import PaymentCheck from './pages/customer/PaymentCheck'
import SubscriptionSelection from './pages/customer/SubscriptionSelection'
import Payment from './pages/customer/Payment'

// Coach pages
import CoachDashboard from './pages/coach/Dashboard'
import CoachBatches from './pages/coach/Batches'
import CoachStudents from './pages/coach/Students'
import CoachCalendar from './pages/coach/Calendar'
import CoachBatchChat from './pages/coach/BatchChat'
import CoachMaterials from './pages/coach/Materials'

// Admin pages
import AdminDashboard from './pages/admin/Dashboard'
import AdminStudents from './pages/admin/Students'
import AdminDemos from './pages/admin/Demos'
import AdminCoaches from './pages/admin/Coaches'
import AdminBatches from './pages/admin/Batches'
import AdminPayments from './pages/admin/Payments'
import AdminAnalytics from './pages/admin/Analytics'
import AdminChat from './pages/admin/Chat'

const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/book-demo" element={<BookDemo />} />
        <Route path="/thank-you" element={<ThankYou />} />
        <Route path="/demo-access" element={<AccessDemoAccount />} />
        <Route path="/demo-login" element={<DemoLogin />} />
        <Route path="/demo-payment" element={<DemoPayment />} />
        <Route path="/demo-payment-success" element={<DemoPaymentSuccess />} />
        <Route path="/set-password" element={<SetPassword />} />
        <Route path="/account-created" element={<AccountCreated />} />
        
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        {/* Customer Routes - Payment Check (no layout) */}
        <Route
          path="/customer/payment-check"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <PaymentCheck />
            </ProtectedRoute>
          }
        />
        
        {/* Customer Routes - Subscription Selection (no layout) */}
        <Route
          path="/customer/subscription-selection"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <SubscriptionSelection />
            </ProtectedRoute>
          }
        />
        
        {/* Customer Routes - Payment Page (no layout) */}
        <Route
          path="/customer/payment"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <Payment />
            </ProtectedRoute>
          }
        />
        
        {/* Customer Routes */}
        <Route
          path="/customer"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<CustomerDashboard />} />
          <Route path="schedule" element={<CustomerSchedule />} />
          <Route path="batch-chat" element={<CustomerBatchChat />} />
          <Route path="payments" element={<CustomerPayments />} />
          <Route path="profile" element={<CustomerProfile />} />
        </Route>
        
        {/* Coach Routes */}
        <Route
          path="/coach"
          element={
            <ProtectedRoute allowedRoles={['COACH']}>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<CoachDashboard />} />
          <Route path="batches" element={<CoachBatches />} />
          <Route path="students" element={<CoachStudents />} />
          <Route path="calendar" element={<CoachCalendar />} />
          <Route path="batch-chat" element={<CoachBatchChat />} />
          <Route path="materials" element={<CoachMaterials />} />
        </Route>
        
        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="students" element={<AdminStudents />} />
          <Route path="demos" element={<AdminDemos />} />
          <Route path="coaches" element={<AdminCoaches />} />
          <Route path="batches" element={<AdminBatches />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="chat" element={<AdminChat />} />
        </Route>
        
        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default Router
