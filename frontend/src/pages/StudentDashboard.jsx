import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import FoodCard from '../components/FoodCard';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  Sparkles, 
  Flame, 
  Clock, 
  Users, 
  Utensils, 
  ArrowRight, 
  Zap, 
  AlertCircle,
  TrendingUp,
  Heart,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const [popularItems, setPopularItems] = useState([]);
  const [specialItems, setSpecialItems] = useState([]);
  const [queueStats, setQueueStats] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  useEffect(() => {
    Promise.all([
      api.getCategories(),
      api.getMenuItems({ sort: 'popular' }),
      api.getQueueStats(),
      api.getAnnouncements()
    ]).then(([cats, items, queue, ann]) => {
      setCategories(cats || []);
      setPopularItems(items ? items.slice(0, 8) : []);
      setSpecialItems(items ? items.filter(i => i.is_special) : []);
      setQueueStats(queue);
      setAnnouncements(ann || []);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/menu?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="space-y-10 pb-16">
      
      {/* Announcement Banner */}
      {announcements.length > 0 && (
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-md flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-hidden">
            <Zap className="w-4 h-4 shrink-0 fill-white" />
            <span className="truncate">{announcements[0].message}</span>
          </div>
          <Link to="/menu" className="underline shrink-0 hover:text-orange-100 text-[11px]">
            Order Now
          </Link>
        </div>
      )}

      {/* Header Greeting & Search Bar */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">
              Campus Canteen Portal
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              {getGreeting()}, {user ? user.name.split(' ')[0] : 'Student'} 👋
            </h1>
            <p className="text-sm text-slate-500 mt-1 font-medium">
              What's for lunch today? Pre-order ahead and skip the queue.
            </p>
          </div>

          <Link
            to="/tables"
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 font-bold text-xs transition-colors"
          >
            <Users className="w-4 h-4 text-amber-600" />
            <span>Live Table Status (7 Free)</span>
          </Link>
        </div>

        {/* Big Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative max-w-3xl">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search food, drinks, snacks (e.g., Veg Burger, Cold Coffee)..."
            className="w-full pl-12 pr-28 py-3.5 rounded-2xl border border-slate-200 focus:outline-none focus:border-orange-500 shadow-inner text-sm font-medium"
          />
          <button
            type="submit"
            className="absolute right-2 top-2 bottom-2 px-5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md transition-colors"
          >
            Search
          </button>
        </form>

        {/* Categories Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none pt-2">
          <button
            onClick={() => { setSelectedCategory('all'); navigate('/menu'); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => navigate(`/menu?category=${cat.slug}`)}
              className="px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap bg-slate-100 text-slate-700 hover:bg-orange-50 hover:text-orange-600 border border-slate-200/60 transition-all"
            >
              {cat.name}
            </button>
          ))}
        </div>
      </section>

      {/* LUNCH RUSH PROMO BANNER */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 text-white p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 max-w-xl space-y-3">
          <span className="bg-white/20 backdrop-blur-md text-white text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 fill-white" />
            Lunch Rush Starts Soon
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
            Pre-order now and avoid the 12:30 PM lunch queue.
          </h2>
          <p className="text-xs sm:text-sm text-orange-100 font-medium">
            Lock your meal and 5-minute express pickup slot before items sell out.
          </p>
          <div className="pt-2">
            <Link
              to="/menu"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-orange-600 hover:bg-orange-50 font-extrabold text-xs shadow-lg transition-all hover:scale-105"
            >
              <span>Order Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* SMART CANTEEN STATUS CARD */}
      <section className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-orange-500" />
            Smart Canteen Status Card
          </h3>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            Canteen OPEN
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
            <span className="text-[11px] text-slate-500 font-medium block">Current Crowd</span>
            <span className="text-sm font-extrabold text-amber-600 block mt-0.5">
              {queueStats?.crowdLevel || 'Moderate'}
            </span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
            <span className="text-[11px] text-slate-500 font-medium block">Estimated Queue</span>
            <span className="text-sm font-extrabold text-slate-900 block mt-0.5">
              {queueStats?.estQueue || '8 minutes'}
            </span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
            <span className="text-[11px] text-slate-500 font-medium block">Active Orders</span>
            <span className="text-sm font-extrabold text-orange-600 block mt-0.5">
              {queueStats?.activeOrders || 42} orders
            </span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
            <span className="text-[11px] text-slate-500 font-medium block">Available Tables</span>
            <span className="text-sm font-extrabold text-emerald-600 block mt-0.5">
              {queueStats?.availableTables || 7} / {queueStats?.totalTables || 20} Free
            </span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 col-span-2 sm:col-span-1">
            <span className="text-[11px] text-slate-500 font-medium block">Next Available Pickup</span>
            <span className="text-sm font-extrabold text-slate-900 block mt-0.5">
              {queueStats?.nextAvailableSlot || '12:35 PM'}
            </span>
          </div>
        </div>
      </section>

      {/* POPULAR FOOD ITEMS */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-orange-500" />
              Popular Today on Campus
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Most ordered meals & quick bites by students
            </p>
          </div>
          <Link
            to="/menu"
            className="text-xs font-bold text-orange-600 hover:underline flex items-center gap-1"
          >
            Explore Full Menu <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="h-64 bg-slate-100 animate-pulse rounded-2xl"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularItems.map((item) => (
              <FoodCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
