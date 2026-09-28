import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  X, 
  ShoppingBag, 
  Trash2, 
  Clock, 
  CreditCard, 
  Wallet, 
  Smartphone, 
  Banknote, 
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CartSidebar({ onOpenCheckout }) {
  const { 
    cart, 
    isCartOpen, 
    setIsCartOpen, 
    updateQuantity, 
    removeFromCart, 
    subtotal, 
    taxes, 
    platformFee, 
    totalAmount,
    selectedSlot,
    setSelectedSlot
  } = useCart();

  const { walletBalance } = useAuth();
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isCartOpen) {
      setLoadingSlots(true);
      api.getSlots()
        .then(data => {
          setSlots(data || []);
          // Auto select first non-full slot if none selected
          if (!selectedSlot && data.length > 0) {
            const available = data.find(s => s.booked_count < s.capacity);
            if (available) setSelectedSlot(available);
          }
        })
        .catch(() => {})
        .finally(() => setLoadingSlots(false));
    }
  }, [isCartOpen]);

  const handleProceedToPayment = () => {
    if (!cart.length) {
      setErrorMsg('Cart is empty.');
      return;
    }
    if (!selectedSlot) {
      setErrorMsg('Please select a pickup time slot.');
      return;
    }
    if (paymentMethod === 'WALLET' && walletBalance < totalAmount) {
      setErrorMsg(`Insufficient Canteen Wallet balance (₹${walletBalance.toFixed(0)}). Add money or choose UPI/Card.`);
      return;
    }

    setErrorMsg('');
    setIsCartOpen(false);
    onOpenCheckout({
      items: cart,
      selectedSlot,
      paymentMethod,
      totalAmount
    });
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Overlay Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50"
          />

          {/* Drawer Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col justify-between"
          >
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Your Food Cart</h3>
                  <p className="text-xs text-slate-500">Review items & choose pickup time</p>
                </div>
              </div>

              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items & Slot Picker Scrollable */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              
              {cart.length === 0 ? (
                <div className="py-16 text-center space-y-4">
                  <div className="w-20 h-20 mx-auto rounded-full bg-orange-50 flex items-center justify-center text-orange-500">
                    <ShoppingBag className="w-10 h-10" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-lg">Your cart is empty</h4>
                    <p className="text-xs text-slate-500 mt-1">Explore our delicious canteen menu and add items to order.</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Items List */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Order Items</h4>
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100"
                      >
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-14 h-14 rounded-xl object-cover shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h5 className="text-xs font-bold text-slate-800 truncate">{item.name}</h5>
                          <p className="text-xs text-orange-600 font-extrabold mt-0.5">₹{item.price}</p>
                        </div>

                        {/* Qty Controls */}
                        <div className="flex items-center bg-white rounded-lg border border-slate-200 p-0.5">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-6 h-6 rounded-md font-bold text-slate-600 hover:bg-orange-100 flex items-center justify-center text-xs"
                          >
                            -
                          </button>
                          <span className="px-2 font-bold text-xs text-slate-800">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-6 h-6 rounded-md font-bold text-slate-600 hover:bg-orange-100 flex items-center justify-center text-xs"
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* SELECT PICKUP SLOT SECTION */}
                  <div className="space-y-3 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-orange-500" />
                        Select Pickup Time Slot
                      </h4>
                      <span className="text-[10px] bg-orange-100 text-orange-700 font-bold px-2 py-0.5 rounded-full">
                        Distributed Pickup
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {slots.map((slot) => {
                        const isFull = slot.booked_count >= slot.capacity;
                        const isSelected = selectedSlot?.id === slot.id;

                        return (
                          <button
                            key={slot.id}
                            disabled={isFull}
                            onClick={() => setSelectedSlot(slot)}
                            className={`p-2.5 rounded-xl border text-left transition-all relative ${
                              isFull
                                ? 'bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed'
                                : isSelected
                                ? 'bg-orange-500 border-orange-600 text-white shadow-md shadow-orange-500/20'
                                : 'bg-white border-slate-200 hover:border-orange-300 text-slate-800'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                                {slot.slot_time.split('–')[0]}
                              </span>
                              {isFull ? (
                                <span className="text-[9px] font-extrabold text-rose-600 bg-rose-100 px-1.5 py-0.5 rounded">
                                  Full
                                </span>
                              ) : (
                                <span className={`text-[9px] font-semibold ${isSelected ? 'text-orange-100' : 'text-slate-400'}`}>
                                  {slot.booked_count}/{slot.capacity}
                                </span>
                              )}
                            </div>
                            <span className={`text-[10px] block mt-0.5 ${isSelected ? 'text-orange-100' : 'text-slate-500'}`}>
                              {slot.slot_time}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* PAYMENT METHOD SELECTOR */}
                  <div className="space-y-3 pt-2 border-t border-slate-100">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Select Payment Method
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'UPI', label: 'UPI / QR', icon: Smartphone },
                        { id: 'WALLET', label: `Wallet (₹${walletBalance.toFixed(0)})`, icon: Wallet },
                        { id: 'CARD', label: 'Debit / Credit Card', icon: CreditCard },
                        { id: 'CASH', label: 'Counter Cash', icon: Banknote },
                      ].map((m) => {
                        const Icon = m.icon;
                        const isSel = paymentMethod === m.id;
                        return (
                          <button
                            key={m.id}
                            onClick={() => setPaymentMethod(m.id)}
                            className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all ${
                              isSel
                                ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                                : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                            }`}
                          >
                            <Icon className={`w-4 h-4 ${isSel ? 'text-orange-400' : 'text-slate-400'}`} />
                            <span className="text-xs font-bold">{m.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* PRICE BREAKDOWN */}
                  <div className="bg-slate-50 rounded-2xl p-4 space-y-2 border border-slate-100 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span>Item Subtotal</span>
                      <span className="font-bold text-slate-800">₹{subtotal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Taxes & Canteen GST (5%)</span>
                      <span className="font-bold text-slate-800">₹{taxes}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Platform Fee</span>
                      <span className="font-bold text-emerald-600 font-mono">FREE (₹0)</span>
                    </div>
                    <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-extrabold text-slate-900">
                      <span>Total Amount</span>
                      <span className="text-orange-600 text-base">₹{totalAmount}</span>
                    </div>
                  </div>
                </>
              )}

              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs font-semibold">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

            </div>

            {/* Footer Pay Button */}
            {cart.length > 0 && (
              <div className="p-5 border-t border-slate-100 bg-white">
                <button
                  onClick={handleProceedToPayment}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Lock className="w-4 h-4" />
                  <span>Pay ₹{totalAmount} & Place Order</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
