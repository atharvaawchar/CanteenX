import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  Users, 
  Utensils, 
  Zap, 
  ShieldCheck, 
  QrCode, 
  Smartphone,
  ChevronRight,
  Flame,
  Award
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingPage() {
  const [queueStats, setQueueStats] = useState(null);

  useEffect(() => {
    api.getQueueStats()
      .then(data => setQueueStats(data))
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-20 pb-16 overflow-hidden">
      
      {/* HERO SECTION */}
      <section className="relative pt-12 lg:pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text Content */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-xs font-bold"
            >
              <Zap className="w-4 h-4 text-orange-500 fill-orange-500" />
              <span>Smart Campus Canteen Pre-ordering</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]"
            >
              Your Lunch. <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 bg-clip-text text-transparent">
                Ready Before the Bell Rings.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal"
            >
              Pre-order your favourite canteen meals, skip the queue, and spend your break enjoying your food — not waiting for it.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2"
            >
              <Link
                to="/menu"
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-base shadow-xl shadow-orange-500/25 flex items-center gap-2.5 transition-all hover:scale-105"
              >
                <span>Order Now</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/menu"
                className="px-8 py-4 rounded-2xl bg-white border border-slate-200 hover:border-orange-300 text-slate-800 font-bold text-base shadow-sm hover:bg-slate-50 transition-all"
              >
                View Menu
              </Link>
            </motion.div>

            {/* Statistics Bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-100"
            >
              {[
                { label: '10+ min saved', sub: 'per student order', icon: Clock },
                { label: 'Live Tables', sub: 'real-time seating', icon: Users },
                { label: 'Zero Queue', sub: 'smart token pickup', icon: Zap },
                { label: 'Fast Pickup', sub: 'express counter', icon: Utensils },
              ].map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <div key={idx} className="bg-slate-50/80 p-3 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-1.5 text-orange-500 mb-1">
                      <Icon className="w-4 h-4" />
                      <span className="font-extrabold text-slate-900 text-sm">{stat.label}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium">{stat.sub}</p>
                  </div>
                );
              })}
            </motion.div>

          </div>

          {/* Right Visual Dashboard Mockup */}
          <div className="lg:col-span-5 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="relative rounded-3xl bg-slate-900 text-white p-6 shadow-2xl border border-slate-800 space-y-6"
            >
              {/* Header inside phone/dashboard frame */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span className="text-xs font-mono text-slate-400 ml-2">canteenx.app</span>
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  LIVE CANTEEN OPEN
                </span>
              </div>

              {/* Sample Active Token Card */}
              <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-5 text-white shadow-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider font-extrabold opacity-90">Token Number</span>
                  <span className="bg-white/20 backdrop-blur-md text-xs font-bold px-2.5 py-0.5 rounded-full">
                    Pickup: 12:35 PM
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-4xl font-extrabold tracking-tight">CX-1042</span>
                  <span className="text-xs font-bold bg-white text-orange-600 px-3 py-1 rounded-full shadow-sm">
                    Status: PREPARING
                  </span>
                </div>
                <div className="border-t border-white/20 pt-2 flex items-center justify-between text-xs">
                  <span>1 × Veg Burger + Cold Coffee</span>
                  <span className="font-extrabold">₹120</span>
                </div>
              </div>

              {/* Queue Status summary */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/60">
                  <span className="text-slate-400 block text-[11px]">Canteen Crowd</span>
                  <span className="text-amber-400 font-extrabold text-sm block mt-0.5">Moderate Crowd</span>
                </div>
                <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/60">
                  <span className="text-slate-400 block text-[11px]">Available Tables</span>
                  <span className="text-emerald-400 font-extrabold text-sm block mt-0.5">7 / 20 Tables Free</span>
                </div>
              </div>

              {/* QR Verification preview badge */}
              <div className="bg-slate-800/50 p-3 rounded-xl flex items-center gap-3 border border-slate-700/40">
                <div className="w-10 h-10 rounded-lg bg-white p-1 shrink-0">
                  <QrCode className="w-full h-full text-slate-900" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-200">Express QR Token</p>
                  <p className="text-[11px] text-slate-400">Scan at Counter 2 for instant collection</p>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </section>

      {/* LIVE CANTEEN STATUS BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Live Campus Canteen Tracker</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Smart Canteen Status</h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
              Real-time crowd monitoring and pickup estimates powered by CanteenX.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full md:w-auto">
            <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 text-center">
              <span className="text-[11px] text-slate-400 block font-semibold">Canteen Status</span>
              <span className="text-emerald-400 font-extrabold text-base">OPEN</span>
            </div>
            <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 text-center">
              <span className="text-[11px] text-slate-400 block font-semibold">Current Crowd</span>
              <span className="text-amber-400 font-extrabold text-base">Moderate</span>
            </div>
            <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 text-center">
              <span className="text-[11px] text-slate-400 block font-semibold">Est. Queue</span>
              <span className="text-white font-extrabold text-base">8 mins</span>
            </div>
            <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 text-center">
              <span className="text-[11px] text-slate-400 block font-semibold">Tables Available</span>
              <span className="text-emerald-400 font-extrabold text-base">7 / 20</span>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">How CanteenX Works</h2>
          <p className="text-sm text-slate-600">4 simple steps to eliminate lunch queues and enjoy fresh hot food.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { step: '01', title: 'Browse & Choose', desc: 'Explore live food availability, daily specials and menu prices before lunch break.', icon: Utensils },
            { step: '02', title: 'Select Pickup Slot', desc: 'Choose a 5-minute express slot (e.g., 12:35 PM) to distribute kitchen rush.', icon: Clock },
            { step: '03', title: 'Pay & Get Token', desc: 'Pay securely via UPI, Card, or Canteen Wallet and receive a unique QR token.', icon: QrCode },
            { step: '04', title: 'Collect & Sit', desc: 'Check live table seating, show QR token at Counter 2, and collect your hot meal!', icon: CheckCircle2 },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4 hover:shadow-md transition-shadow relative">
                <span className="text-3xl font-extrabold text-orange-500/20 font-mono block">{item.step}</span>
                <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-base">{item.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* DEMO ACCOUNTS HELPER BOX */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-dashed border-orange-300 rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 text-base">Quick Demo Credentials</h4>
              <p className="text-xs text-slate-600">Test the complete student ordering and admin kitchen management workflows instantly.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="bg-white p-4 rounded-2xl border border-orange-200 shadow-sm space-y-1">
              <span className="text-xs font-bold text-orange-600 uppercase tracking-wider block">🎓 Student Account</span>
              <p className="text-xs font-mono font-semibold text-slate-800">Email: student@canteenx.demo</p>
              <p className="text-xs font-mono text-slate-600">Password: student123</p>
              <Link to="/login" className="text-xs font-bold text-orange-600 hover:underline inline-flex items-center gap-1 pt-1">
                Log in as Student <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-orange-200 shadow-sm space-y-1">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">👨‍🍳 Canteen Admin / Staff</span>
              <p className="text-xs font-mono font-semibold text-slate-800">Email: admin@canteenx.demo</p>
              <p className="text-xs font-mono text-slate-600">Password: admin123</p>
              <Link to="/login" className="text-xs font-bold text-slate-900 hover:underline inline-flex items-center gap-1 pt-1">
                Log in as Admin <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
