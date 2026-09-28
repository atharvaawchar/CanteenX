import React from 'react';
import { Utensils, Heart, Shield, Clock, Phone, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          
          {/* Brand info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white">
                <Utensils className="w-5 h-5" />
              </div>
              <span className="text-2xl font-extrabold text-white tracking-tight">
                Canteen<span className="text-orange-500">X</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Smart college canteen management and pre-ordering platform. Skip long lunch queues, track live food preparation, and reserve campus seats seamlessly.
            </p>
            <div className="flex items-center gap-2 text-xs text-orange-400 font-semibold bg-orange-500/10 px-3 py-1.5 rounded-full w-fit">
              <Clock className="w-3.5 h-3.5" />
              <span>Lunch Hours: 11:30 AM – 3:00 PM</span>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-white font-bold text-base mb-4">Quick Navigation</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/menu" className="hover:text-orange-400 transition-colors">Browse Food Menu</Link></li>
              <li><Link to="/my-orders" className="hover:text-orange-400 transition-colors">Track Active Orders</Link></li>
              <li><Link to="/tables" className="hover:text-orange-400 transition-colors">Live Table Map</Link></li>
              <li><Link to="/wallet" className="hover:text-orange-400 transition-colors">CanteenX Digital Wallet</Link></li>
              <li><Link to="/admin" className="hover:text-orange-400 text-orange-400/90 font-medium transition-colors">Canteen Staff Portal</Link></li>
            </ul>
          </div>

          {/* Top Categories */}
          <div>
            <h4 className="text-white font-bold text-base mb-4">Top Food Categories</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/menu?category=breakfast" className="hover:text-orange-400 transition-colors">Hot Breakfast & Dosa</Link></li>
              <li><Link to="/menu?category=meals" className="hover:text-orange-400 transition-colors">Veg Thali & Rice Bowls</Link></li>
              <li><Link to="/menu?category=snacks" className="hover:text-orange-400 transition-colors">Burgers & Sandwiches</Link></li>
              <li><Link to="/menu?category=beverages" className="hover:text-orange-400 transition-colors">Cold Coffee & Lime Soda</Link></li>
              <li><Link to="/menu?category=desserts" className="hover:text-orange-400 transition-colors">Desserts & Brownies</Link></li>
            </ul>
          </div>

          {/* Campus Support */}
          <div>
            <h4 className="text-white font-bold text-base mb-4">Campus Support</h4>
            <div className="space-y-3 text-sm text-slate-400">
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-orange-400" />
                <span>Ext. 4021 (Canteen Counter)</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-orange-400" />
                <span>canteen@campus.edu</span>
              </p>
              <div className="pt-2">
                <p className="text-xs font-semibold text-slate-400">Demo Login Accounts:</p>
                <p className="text-xs text-orange-300 font-mono mt-1">Student: student@canteenx.demo</p>
                <p className="text-xs text-amber-300 font-mono">Admin: admin@canteenx.demo</p>
              </div>
            </div>
          </div>

        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} CanteenX. Smart Campus Food Platform. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Engineered with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for College Campuses
          </p>
        </div>
      </div>
    </footer>
  );
}
