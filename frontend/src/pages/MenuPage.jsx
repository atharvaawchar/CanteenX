import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../services/api';
import FoodCard from '../components/FoodCard';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  Utensils, 
  Clock, 
  CheckCircle2, 
  Sparkles,
  Zap,
  SlidersHorizontal
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function MenuPage() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [vegOnly, setVegOnly] = useState(false);
  const [priceFilter, setPriceFilter] = useState('all'); // 'all', 'under50', '50-100', 'above100'
  const [quickPrepOnly, setQuickPrepOnly] = useState(false);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sortBy, setSortBy] = useState('popular'); // 'popular', 'price_low', 'price_high', 'prep_time', 'rating'

  useEffect(() => {
    api.getCategories().then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    fetchItems();
  }, [selectedCategory, searchQuery, vegOnly, priceFilter, quickPrepOnly, availableOnly, sortBy]);

  const fetchItems = () => {
    setLoading(true);
    let maxPrice = null;
    if (priceFilter === 'under50') maxPrice = 50;

    const params = {
      category: selectedCategory,
      search: searchQuery,
      veg: vegOnly ? 'true' : undefined,
      maxPrice: maxPrice,
      sort: sortBy
    };

    api.getMenuItems(params)
      .then(data => {
        let filtered = data || [];

        if (priceFilter === '50-100') {
          filtered = filtered.filter(i => i.price >= 50 && i.price <= 100);
        } else if (priceFilter === 'above100') {
          filtered = filtered.filter(i => i.price > 100);
        }

        if (quickPrepOnly) {
          filtered = filtered.filter(i => i.prep_time <= 8);
        }

        if (availableOnly) {
          filtered = filtered.filter(i => i.availability !== 'Sold Out' && i.availability !== 'Temporarily Unavailable');
        }

        setItems(filtered);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Page Title */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-4">
        <div>
          <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">Campus Food Menu</span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            Explore Fresh Canteen Meals
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Pre-order hot food, snacks and chilled beverages ahead of the lunch break.
          </p>
        </div>

        {/* Category Pills Slider */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none pt-2 border-t border-slate-100">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Items
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap border transition-all ${
                selectedCategory === cat.slug
                  ? 'bg-orange-500 border-orange-600 text-white shadow-md shadow-orange-500/20'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-orange-300'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* FILTER & SORT BAR */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search menu..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-orange-500"
          />
        </div>

        {/* Filter Toggle Buttons */}
        <div className="flex flex-wrap items-center gap-2 text-xs w-full md:w-auto">
          
          {/* Veg Only Toggle */}
          <button
            onClick={() => setVegOnly(!vegOnly)}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
              vegOnly
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
            Pure Veg
          </button>

          {/* Quick Prep Toggle */}
          <button
            onClick={() => setQuickPrepOnly(!quickPrepOnly)}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
              quickPrepOnly
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            Quick Prep (&lt;8m)
          </button>

          {/* Available Only */}
          <button
            onClick={() => setAvailableOnly(!availableOnly)}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              availableOnly
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Available Now
          </button>

          {/* Price Range Dropdown */}
          <select
            value={priceFilter}
            onChange={(e) => setPriceFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 font-bold text-xs text-slate-700 focus:outline-none"
          >
            <option value="all">Price Range: All</option>
            <option value="under50">Under ₹50</option>
            <option value="50-100">₹50 – ₹100</option>
            <option value="above100">Above ₹100</option>
          </select>

        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2 text-xs shrink-0">
          <ArrowUpDown className="w-4 h-4 text-slate-400" />
          <span className="font-bold text-slate-500">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 font-bold text-xs text-slate-800 focus:outline-none"
          >
            <option value="popular">Popularity</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
            <option value="prep_time">Fast Prep Time</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>

      </div>

      {/* FOOD ITEMS GRID */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="h-72 bg-slate-100 animate-pulse rounded-2xl"></div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center space-y-4 border border-slate-100">
          <div className="w-16 h-16 mx-auto rounded-full bg-orange-50 text-orange-500 flex items-center justify-center">
            <Utensils className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-800 text-lg">No food items matched your filter</h3>
            <p className="text-xs text-slate-500 mt-1">Try resetting search keywords or dietary filters.</p>
          </div>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setVegOnly(false);
              setPriceFilter('all');
              setQuickPrepOnly(false);
              setAvailableOnly(false);
            }}
            className="px-5 py-2.5 rounded-xl bg-orange-500 text-white font-bold text-xs shadow-md"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item) => (
            <FoodCard key={item.id} item={item} />
          ))}
        </div>
      )}

    </div>
  );
}
