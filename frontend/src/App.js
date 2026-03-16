import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from './context/AuthContext';

// Layout
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Public Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Services from './pages/Services';
import VendorList from './pages/VendorList';
import VendorDetail from './pages/VendorDetail';

// Common Components
import ScrollToTop from './components/common/ScrollToTop';

// Customer Pages
import CustomerDashboard from './pages/customer/CustomerDashboard';
import BookService from './pages/customer/BookService';
import MyBookings from './pages/customer/MyBookings';
import BookingDetail from './pages/customer/BookingDetail';
import CustomerMessages from './pages/customer/CustomerMessages';
import CustomerProfile from './pages/customer/CustomerProfile';

// Worker Pages
import WorkerDashboard from './pages/worker/WorkerDashboard';
import WorkerBookings from './pages/worker/WorkerBookings';
import WorkerMessages from './pages/worker/WorkerMessages';
import WorkerProfile from './pages/worker/WorkerProfile';
import WorkerReviews from './pages/worker/WorkerReviews';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageCategories from './pages/admin/ManageCategories';
import ManageVendors from './pages/admin/ManageVendors';
import ManageBookings from './pages/admin/ManageBookings';
import ManageUsers from './pages/admin/ManageUsers';
import ManageReviews from './pages/admin/ManageReviews';
import ManageMessages from './pages/admin/ManageMessages';
import ManageParking from './pages/admin/ManageParking';

// Parking Pages
import ParkingSlots from './pages/ParkingSlots';
import MyParkingBookings from './pages/customer/MyParkingBookings';

// Complaint Pages
import RaiseComplaint from './pages/customer/RaiseComplaint';
import MyComplaints from './pages/customer/MyComplaints';
import ManageComplaints from './pages/admin/ManageComplaints';
import WorkerComplaints from './pages/worker/WorkerComplaints';

// SOS & Lift Booking Pages
import SosEmergency from './pages/customer/SosEmergency';
import LiftBooking from './pages/customer/LiftBooking';
import ManageSOS from './pages/admin/ManageSOS';
import ManageLiftBookings from './pages/admin/ManageLiftBookings';

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;
  if (!user) return <Navigate to="/login" />;
  if (role) {
    const roles = Array.isArray(role) ? role : [role];
    if (!roles.includes(user.role)) return <Navigate to="/" />;
  }
  
  return children;
};

function App() {
  return (
    <div className="app">
      <Navbar />
      <ScrollToTop />
      <main className="main-content">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/services" element={<Services />} />
          <Route path="/vendors/category/:categoryId" element={<VendorList />} />
          <Route path="/vendors/:id" element={<VendorDetail />} />
          <Route path="/parking" element={<ParkingSlots />} />

          {/* Customer Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute role="CUSTOMER"><CustomerDashboard /></ProtectedRoute>
          } />
          <Route path="/book/:vendorId" element={
            <ProtectedRoute role={["CUSTOMER","WORKER"]}><BookService /></ProtectedRoute>
          } />
          <Route path="/my-bookings" element={
            <ProtectedRoute role={["CUSTOMER","WORKER"]}><MyBookings /></ProtectedRoute>
          } />
          <Route path="/booking/:id" element={
            <ProtectedRoute role={["CUSTOMER","WORKER"]}><BookingDetail /></ProtectedRoute>
          } />
          <Route path="/my-messages" element={
            <ProtectedRoute role={["CUSTOMER","WORKER"]}><CustomerMessages /></ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute role={["CUSTOMER","WORKER"]}><CustomerProfile /></ProtectedRoute>
          } />
          <Route path="/my-parking" element={
            <ProtectedRoute role={["CUSTOMER","WORKER"]}><MyParkingBookings /></ProtectedRoute>
          } />
          <Route path="/raise-complaint" element={
            <ProtectedRoute role={["CUSTOMER","WORKER"]}><RaiseComplaint /></ProtectedRoute>
          } />
          <Route path="/my-complaints" element={
            <ProtectedRoute role={["CUSTOMER","WORKER"]}><MyComplaints /></ProtectedRoute>
          } />
          <Route path="/sos" element={
            <ProtectedRoute role={["CUSTOMER","WORKER"]}><SosEmergency /></ProtectedRoute>
          } />
          <Route path="/lift-booking" element={
            <ProtectedRoute role={["CUSTOMER","WORKER"]}><LiftBooking /></ProtectedRoute>
          } />
          {/* Worker Routes */}
          <Route path="/worker" element={
            <ProtectedRoute role="WORKER"><WorkerDashboard /></ProtectedRoute>
          } />
          <Route path="/worker/dashboard" element={
            <ProtectedRoute role="WORKER"><WorkerDashboard /></ProtectedRoute>
          } />
          <Route path="/worker/bookings" element={
            <ProtectedRoute role="WORKER"><WorkerBookings /></ProtectedRoute>
          } />
          <Route path="/worker/messages" element={
            <ProtectedRoute role="WORKER"><WorkerMessages /></ProtectedRoute>
          } />
          <Route path="/worker/profile" element={
            <ProtectedRoute role="WORKER"><WorkerProfile /></ProtectedRoute>
          } />
          <Route path="/worker/reviews" element={
            <ProtectedRoute role="WORKER"><WorkerReviews /></ProtectedRoute>
          } />
          <Route path="/worker/complaints" element={
            <ProtectedRoute role="WORKER"><WorkerComplaints /></ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute role="ADMIN"><AdminDashboard /></ProtectedRoute>
          } />
          <Route path="/admin/categories" element={
            <ProtectedRoute role="ADMIN"><ManageCategories /></ProtectedRoute>
          } />
          <Route path="/admin/vendors" element={
            <ProtectedRoute role="ADMIN"><ManageVendors /></ProtectedRoute>
          } />
          <Route path="/admin/bookings" element={
            <ProtectedRoute role="ADMIN"><ManageBookings /></ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute role="ADMIN"><ManageUsers /></ProtectedRoute>
          } />
          <Route path="/admin/reviews" element={
            <ProtectedRoute role="ADMIN"><ManageReviews /></ProtectedRoute>
          } />
          <Route path="/admin/messages" element={
            <ProtectedRoute role="ADMIN"><ManageMessages /></ProtectedRoute>
          } />
          <Route path="/admin/parking" element={
            <ProtectedRoute role="ADMIN"><ManageParking /></ProtectedRoute>
          } />
          <Route path="/admin/complaints" element={
            <ProtectedRoute role="ADMIN"><ManageComplaints /></ProtectedRoute>
          } />
          <Route path="/admin/sos" element={
            <ProtectedRoute role="ADMIN"><ManageSOS /></ProtectedRoute>
          } />
          <Route path="/admin/lift-bookings" element={
            <ProtectedRoute role="ADMIN"><ManageLiftBookings /></ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <Footer />
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
    </div>
  );
}

export default App;
