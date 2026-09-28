import React, { useState, useEffect } from 'react';
import { useLocation, useSearchParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useSocket } from '../context/SocketContext';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  Clock, 
  ChefHat, 
  PackageCheck, 
  QrCode, 
  ArrowLeft, 
  Sparkles,
  MapPin,
  Utensils
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function OrderTrackingPage() {
  const [searchParams] = useSearchParams();
  const tokenParam = searchParams.get('token');
  const socket = useSocket();

  const [order, setOrder] = useState(null);
  const [qrUrl, setQrUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState('');

  const fetchOrder = () => {
    if (!tokenParam) {
      // Fallback: fetch latest active order for user
      api.getMyOrders().then(orders => {
        if (orders && orders.length > 0) {
          const active = orders.find(o => o.status !== 'COLLECTED' && o.status !== 'CANCELLED') || orders[0];
          setOrder(active);
          generateQR(active.qr_code || active.order_number);
        } else {
          setErrorText('No orders found to track.');
        }
      }).catch(err => setErrorText(err.message))
        .finally(() => setLoading(false));
    } else {
      api.getOrderDetails(tokenParam)
        .then(data => {
          setOrder(data);
          generateQR(data.qr_code || data.order_number);
        })
        .catch(err => setErrorText(err.message))
        .finally(() => setLoading(false));
    }
  };

  const generateQR = async (text) => {
    try {
      const url = await QRCode.toDataURL(text, { width: 180, margin: 2 });
      setQrUrl(url);
    } catch (e) {}
  };

  useEffect(() => {
    fetchOrder();
  }, [tokenParam]);

  useEffect(() => {
    if (socket) {
      socket.on('order_status_changed', (updatedOrder) => {
        if (order && updatedOrder.id === order.id) {
          setOrder(updatedOrder);
          if (updatedOrder.status === 'READY') {
            confetti({ particleCount: 100, spread: 70 });
          }
        }
      });
    }
  }, [socket, order]);

  const steps = [
    { key: 'ORDER_PLACED', label: 'Order Placed', desc: 'Order sent to canteen system' },
    { key: 'ACCEPTED', label: 'Accepted by Kitchen', desc: 'Canteen chef confirmed order' },
    { key: 'PREPARING', label: 'Freshly Preparing', desc: 'Kitchen is cooking your items' },
    { key: 'READY', label: 'Ready for Pickup! 🎉', desc: 'Proceed to Counter 2' },
    { key: 'COLLECTED', label: 'Collected', desc: 'Enjoy your meal!' },
  ];

  const getStepIndex = (status) => {
    switch (status) {
      case 'ORDER_PLACED': return 0;
      case 'ACCEPTED': return 1;
      case 'PREPARING': return 2;
      case 'READY': return 3;
      case 'COLLECTED': return 4;
      default: return 0;
    }
  };

  const currentStepIdx = order ? getStepIndex(order.status) : 0;

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-500 font-bold">
        Loading live order tracker...
      </div>
    );
  }

  if (errorText || !order) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-orange-50 text-orange-500 flex items-center justify-center">
          <Utensils className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-extrabold text-slate-900">No Active Order Found</h3>
        <p className="text-xs text-slate-500">{errorText || 'You currently do not have an active order being prepared.'}</p>
        <Link to="/menu" className="inline-block px-6 py-3 rounded-2xl bg-orange-500 text-white font-bold text-xs shadow-md">
          Browse Menu & Order
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      
      {/* Header Back Button */}
      <div className="flex items-center justify-between">
        <Link to="/my-orders" className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-orange-600">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Orders</span>
        </Link>
        <span className="text-xs font-bold bg-orange-100 text-orange-700 px-3 py-1 rounded-full">
          Live Real-time Status
        </span>
      </div>

      {/* Main Status Hero Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xl space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Order Token Number</span>
            <h1 className="text-4xl font-extrabold text-orange-500 tracking-tight mt-0.5">
              {order.order_number}
            </h1>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Scheduled Pickup Slot: <strong className="text-slate-900">{order.slot_time}</strong>
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Order Status</span>
            <span className={`inline-block mt-1 px-4 py-1.5 rounded-full text-xs font-extrabold shadow-sm ${
              order.status === 'READY'
                ? 'bg-emerald-500 text-white animate-bounce'
                : order.status === 'PREPARING'
                ? 'bg-amber-500 text-white'
                : 'bg-slate-900 text-white'
            }`}>
              {order.status.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* READY CALLOUT BANNER */}
        {order.status === 'READY' && (
          <div className="bg-emerald-500 text-white p-5 rounded-2xl shadow-lg flex items-center gap-4 animate-pulse">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="font-extrabold text-lg">Your food is ready! 🎉</h4>
              <p className="text-xs text-emerald-100">Proceed to Pickup Counter 2 and present your token or QR code.</p>
            </div>
          </div>
        )}

        {/* PREPARING ESTIMATE */}
        {order.status === 'PREPARING' && (
          <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-2xl flex items-center gap-3 text-xs font-bold">
            <Clock className="w-5 h-5 text-amber-600 shrink-0" />
            <span>Your order is being freshly prepared! Approx ready in 6 minutes.</span>
          </div>
        )}

        {/* STEPPER PROGRESS */}
        <div className="py-4 space-y-6">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Live Preparation Progress</h4>
          
          <div className="relative pl-6 border-l-2 border-slate-200 space-y-8">
            {steps.map((st, idx) => {
              const isPassed = idx <= currentStepIdx;
              const isCurrent = idx === currentStepIdx;

              return (
                <div key={st.key} className="relative">
                  {/* Dot */}
                  <div className={`absolute -left-[31px] top-0 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                    isCurrent
                      ? 'bg-orange-500 text-white ring-4 ring-orange-100 scale-110'
                      : isPassed
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-200 text-slate-400'
                  }`}>
                    {isPassed ? <CheckCircle2 className="w-4 h-4" /> : <span className="text-[10px] font-bold">{idx + 1}</span>}
                  </div>

                  <div>
                    <h5 className={`text-sm font-extrabold ${isCurrent ? 'text-orange-600' : isPassed ? 'text-slate-800' : 'text-slate-400'}`}>
                      {st.label}
                    </h5>
                    <p className="text-xs text-slate-500 mt-0.5">{st.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* QR CODE & DETAILS */}
        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
          
          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-slate-900 text-sm">Order Items ({order.items?.length})</h4>
            <div className="space-y-1.5 divide-y divide-slate-200/60">
              {order.items?.map(it => (
                <div key={it.id} className="pt-1.5 flex justify-between text-slate-700 font-medium">
                  <span>{it.quantity} × {it.item_name}</span>
                  <span className="font-bold">₹{it.price * it.quantity}</span>
                </div>
              ))}
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between font-extrabold text-sm text-slate-900">
              <span>Total Paid ({order.payment_method})</span>
              <span className="text-orange-600">₹{order.total_amount}</span>
            </div>
          </div>

          <div className="text-center space-y-2">
            {qrUrl && (
              <img src={qrUrl} alt="Order QR" className="w-36 h-36 mx-auto rounded-xl bg-white p-2 border border-slate-200 shadow-sm" />
            )}
            <p className="text-[11px] text-slate-500 font-semibold">
              Show QR code at Counter 2 upon arrival
            </p>
          </div>

        </div>

      </motion.div>
    </div>
  );
}
