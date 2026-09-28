import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { SocketProvider } from './context/SocketContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartSidebar from './components/CartSidebar';
import CheckoutModal from './components/CheckoutModal';

import LandingPage from './pages/LandingPage';
import StudentDashboard from './pages/StudentDashboard';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import MenuPage from './pages/MenuPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import MyOrdersPage from './pages/MyOrdersPage';
import TableMapPage from './pages/TableMapPage';
import WalletPage from './pages/WalletPage';
import AboutPage from './pages/AboutPage';
import AdminDashboard from './pages/Admin/AdminDashboard';

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="py-20 text-center text-slate-500 font-bold">Loading CanteenX...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function MainLayout() {
  const [activeCheckoutConfig, setActiveCheckoutConfig] = useState(null);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 text-slate-800">
      <div>
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/orders/track" element={<ProtectedRoute><OrderTrackingPage /></ProtectedRoute>} />
            <Route path="/my-orders" element={<ProtectedRoute><MyOrdersPage /></ProtectedRoute>} />
            <Route path="/tables" element={<TableMapPage />} />
            <Route path="/wallet" element={<ProtectedRoute><WalletPage /></ProtectedRoute>} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/admin" element={<ProtectedRoute adminOnly={true}><AdminDashboard /></ProtectedRoute>} />
          </Routes>
        </main>
      </div>

      <Footer />

      {/* Slide-in Cart Sidebar */}
      <CartSidebar onOpenCheckout={(config) => setActiveCheckoutConfig(config)} />

      {/* Simulated Payment & Order Confirmation Modal */}
      {activeCheckoutConfig && (
        <CheckoutModal
          orderConfig={activeCheckoutConfig}
          onClose={() => setActiveCheckoutConfig(null)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <SocketProvider>
            <MainLayout />
          </SocketProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
