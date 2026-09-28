import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';
import { useSocket } from '../context/SocketContext';
import { 
  Utensils, 
  ShoppingBag, 
  Bell, 
  Wallet, 
  User, 
  LogOut, 
  LayoutDashboard, 
  Clock, 
  ChevronDown,
  Menu as MenuIcon,
  X,
  Sparkles,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const { user, walletBalance, logout } = useAuth();
  const { totalItemCount, setIsCartOpen } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const socket = useSocket();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifPopover, setShowNotifPopover] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const fetchNotifs = () => {
    if (user) {
      api.getNotifications()
        .then(data => {
          setNotifications(data.notifications || []);
          setUnreadCount(data.unreadCount || 0);
        })
        .catch(() => {});
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, [user]);

  useEffect(() => {
    if (socket) {
      socket.on('order_status_changed', () => {
        fetchNotifs();
      });
      socket.on('menu_updated', () => {
        fetchNotifs();
      });
    }
  }, [socket]);

  const markAllRead = () => {
    api.markNotificationRead('all').then(() => {
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
    });
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Menu', path: '/menu' },
    { name: 'My Orders', path: '/my-orders' },
    { name: 'Tables', path: '/tables' },
    { name: 'About', path: '/about' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
              <Utensils className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-extrabold tracking-tight text-slate-900">
                  Canteen<span className="text-orange-500">X</span>
                </span>
                <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Campus
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">Order Ahead. Skip the Queue.</p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1.5 rounded-full border border-slate-200/60">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  isActive(link.path)
                    ? 'bg-white text-orange-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Right Action Icons & Auth */}
          <div className="flex items-center gap-3">
            
            {user ? (
              <>
                {/* Wallet Balance Pill */}
                <Link 
                  to="/wallet" 
                  className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-full bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 font-semibold text-xs transition-colors"
                >
                  <Wallet className="w-4 h-4 text-amber-600" />
                  <span>₹{walletBalance.toFixed(0)}</span>
                </Link>

                {/* Cart Icon Button */}
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="relative p-2.5 rounded-full bg-slate-100 hover:bg-orange-50 text-slate-700 hover:text-orange-600 transition-colors"
                  aria-label="View Cart"
                >
                  <ShoppingBag className="w-5 h-5" />
                  {totalItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center animate-bounce shadow-sm">
                      {totalItemCount}
                    </span>
                  )}
                </button>

                {/* Notifications Bell */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifPopover(!showNotifPopover)}
                    className="relative p-2.5 rounded-full bg-slate-100 hover:bg-orange-50 text-slate-700 hover:text-orange-600 transition-colors"
                    aria-label="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white"></span>
                    )}
                  </button>

                  {/* Notification Popover Drawer */}
                  <AnimatePresence>
                    {showNotifPopover && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 z-50"
                      >
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                          <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                            <Bell className="w-4 h-4 text-orange-500" />
                            Notifications
                          </h4>
                          {unreadCount > 0 && (
                            <button
                              onClick={markAllRead}
                              className="text-xs text-orange-600 font-semibold hover:underline"
                            >
                              Mark all as read
                            </button>
                          )}
                        </div>
                        <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 py-2">
                          {notifications.length === 0 ? (
                            <p className="text-xs text-slate-400 text-center py-6">No notifications yet.</p>
                          ) : (
                            notifications.map((n) => (
                              <div
                                key={n.id}
                                className={`p-3 rounded-xl transition-colors ${
                                  !n.is_read ? 'bg-orange-50/50' : 'hover:bg-slate-50'
                                }`}
                              >
                                <div className="flex items-start gap-2.5">
                                  {n.type === 'success' ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                  ) : (
                                    <Sparkles className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                                  )}
                                  <div>
                                    <p className="text-xs font-bold text-slate-800">{n.title}</p>
                                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{n.message}</p>
                                    <span className="text-[10px] text-slate-400 mt-1 block">
                                      {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Student Avatar & Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    className="flex items-center gap-2 p-1.5 pl-2.5 rounded-full border border-slate-200 hover:border-orange-300 bg-white transition-colors"
                  >
                    <img
                      src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-orange-500/20"
                    />
                    <span className="text-xs font-bold text-slate-800 hidden sm:inline-block max-w-[100px] truncate">
                      {user.name.split(' ')[0]}
                    </span>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </button>

                  <AnimatePresence>
                    {showUserDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50"
                      >
                        <div className="px-3 py-2 border-b border-slate-100">
                          <p className="text-xs font-bold text-slate-900">{user.name}</p>
                          <p className="text-[11px] text-slate-500">{user.email}</p>
                          <span className="mt-1 inline-block px-2 py-0.5 bg-orange-100 text-orange-700 text-[10px] font-bold rounded-full capitalize">
                            {user.role}
                          </span>
                        </div>

                        <div className="py-1">
                          {user.role === 'admin' && (
                            <Link
                              to="/admin"
                              onClick={() => setShowUserDropdown(false)}
                              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-orange-600 hover:bg-orange-50"
                            >
                              <LayoutDashboard className="w-4 h-4" />
                              Admin Dashboard
                            </Link>
                          )}
                          <Link
                            to="/my-orders"
                            onClick={() => setShowUserDropdown(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            <Clock className="w-4 h-4 text-slate-400" />
                            My Orders
                          </Link>
                          <Link
                            to="/wallet"
                            onClick={() => setShowUserDropdown(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            <Wallet className="w-4 h-4 text-slate-400" />
                            Canteen Wallet (₹{walletBalance.toFixed(0)})
                          </Link>
                        </div>

                        <div className="pt-1 border-t border-slate-100">
                          <button
                            onClick={() => {
                              setShowUserDropdown(false);
                              logout();
                              navigate('/login');
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50"
                          >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-full text-xs font-bold text-slate-700 hover:text-orange-600 hover:bg-slate-100 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-md shadow-orange-500/25 transition-all hover:scale-105"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 pt-2 pb-6 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-3 rounded-xl text-sm font-semibold ${
                isActive(link.path)
                  ? 'bg-orange-50 text-orange-600'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {link.name}
            </Link>
          ))}
          {user && user.role === 'admin' && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 rounded-xl text-sm font-bold text-orange-600 bg-orange-100/50"
            >
              Admin Dashboard
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
