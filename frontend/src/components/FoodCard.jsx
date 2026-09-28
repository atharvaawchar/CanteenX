import React, { useState } from 'react';
import { Clock, Star, Plus, Check, Heart, AlertCircle, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { motion } from 'framer-motion';

export default function FoodCard({ item }) {
  const { cart, addToCart, updateQuantity } = useCart();
  const [isFavorite, setIsFavorite] = useState(false);

  const cartItem = cart.find(i => i.id === item.id);
  const isSoldOut = item.availability === 'Sold Out' || item.stock <= 0;
  const isTempUnavailable = item.availability === 'Temporarily Unavailable';
  const isUnavailable = isSoldOut || isTempUnavailable;

  const getAvailabilityBadge = () => {
    switch (item.availability) {
      case 'Available':
        return <span className="bg-emerald-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-md">Available</span>;
      case 'Selling Fast':
        return <span className="bg-amber-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-md">🔥 Selling Fast</span>;
      case 'Only 5 Left':
        return <span className="bg-orange-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-md">⚡ Only 5 Left</span>;
      case 'Temporarily Unavailable':
        return <span className="bg-slate-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-md">Temp Unavailable</span>;
      case 'Sold Out':
      default:
        return <span className="bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">Sold Out</span>;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={`bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between ${
        isUnavailable ? 'opacity-75' : ''
      }`}
    >
      <div>
        {/* Card Header Image */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
          <img
            src={item.image_url}
            alt={item.name}
            className={`w-full h-full object-cover transition-transform duration-500 hover:scale-105 ${
              isUnavailable ? 'grayscale-[40%]' : ''
            }`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent"></div>

          {/* Availability Badge */}
          <div className="absolute top-3 left-3">
            {getAvailabilityBadge()}
          </div>

          {/* Favorite Heart Button */}
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all ${
              isFavorite 
                ? 'bg-rose-500 text-white scale-110' 
                : 'bg-white/80 text-slate-600 hover:bg-white hover:text-rose-500'
            }`}
            aria-label="Add to favorites"
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-white' : ''}`} />
          </button>

          {/* Prep Time & Rating Floating Pills */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
            <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full">
              <Clock className="w-3.5 h-3.5 text-orange-400" />
              <span>{item.prep_time} mins</span>
            </div>
            <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full font-bold">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>{item.rating || 4.5}</span>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4 space-y-2">
          
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              {/* Veg / Non-Veg Indicator */}
              <div className={`w-4 h-4 rounded-sm border-2 flex items-center justify-center shrink-0 ${
                item.is_veg ? 'border-emerald-600' : 'border-rose-600'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  item.is_veg ? 'bg-emerald-600' : 'bg-rose-600'
                }`}></div>
              </div>

              <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-1">
                {item.name}
              </h3>
            </div>
          </div>

          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed min-h-[32px]">
            {item.description}
          </p>

        </div>
      </div>

      {/* Price & Cart Add Button */}
      <div className="p-4 pt-0 border-t border-slate-50 flex items-center justify-between mt-2">
        <div>
          <span className="text-xs text-slate-400 block font-medium">Price</span>
          <span className="text-lg font-extrabold text-slate-900">₹{item.price}</span>
        </div>

        {isUnavailable ? (
          <button
            disabled
            className="px-4 py-2 rounded-xl bg-slate-100 text-slate-400 text-xs font-bold cursor-not-allowed flex items-center gap-1.5"
          >
            <AlertCircle className="w-3.5 h-3.5" />
            Sold Out
          </button>
        ) : cartItem ? (
          <div className="flex items-center bg-orange-50 rounded-xl border border-orange-200 p-1">
            <button
              onClick={() => updateQuantity(item.id, cartItem.quantity - 1)}
              className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center font-bold text-slate-700 hover:bg-orange-500 hover:text-white transition-colors text-sm"
            >
              -
            </button>
            <span className="px-3 font-extrabold text-xs text-orange-600">
              {cartItem.quantity}
            </span>
            <button
              onClick={() => updateQuantity(item.id, cartItem.quantity + 1)}
              className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center font-bold text-slate-700 hover:bg-orange-500 hover:text-white transition-colors text-sm"
            >
              +
            </button>
          </div>
        ) : (
          <button
            onClick={() => addToCart(item)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold shadow-md shadow-orange-500/20 flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Add to Cart
          </button>
        )}
      </div>
    </motion.div>
  );
}
