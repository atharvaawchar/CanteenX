import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, 
  Loader2, 
  QrCode, 
  Clock, 
  Calendar, 
  ShieldCheck, 
  ArrowRight, 
  Utensils, 
  AlertCircle 
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function CheckoutModal({ orderConfig, onClose }) {
  const { clearCart } = useCart();
  const { updateBalance, walletBalance } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState('PROCESSING'); // PROCESSING -> SUCCESS -> ERROR
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [errorText, setErrorText] = useState('');

  useEffect(() => {
    if (orderConfig) {
      processOrder();
    }
  }, [orderConfig]);

  const processOrder = async () => {
    try {
      setStep('PROCESSING');

      // Simulate payment processing delay (1.5 seconds for realism!)
      await new Promise(resolve => setTimeout(resolve, 1500));

      const orderPayload = {
        items: orderConfig.items,
        slot_id: orderConfig.selectedSlot?.id,
        slot_time: orderConfig.selectedSlot?.slot_time,
        payment_method: orderConfig.paymentMethod,
      };

      const result = await api.checkout(orderPayload);
      setConfirmedOrder(result);

      // Generate visual QR code image
      const qrUrl = await QRCode.toDataURL(result.qr_code || result.order_number, {
        width: 200,
        margin: 2,
        color: { dark: '#0f172a', light: '#ffffff' }
      });
      setQrDataUrl(qrUrl);

      // Deduct local wallet state if paid via wallet
      if (orderConfig.paymentMethod === 'WALLET') {
        updateBalance(walletBalance - orderConfig.totalAmount);
      }

      clearCart();
      setStep('SUCCESS');

      // Trigger celebratory confetti burst!
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

    } catch (err) {
      console.error('Checkout failed:', err);
      setErrorText(err.message || 'Payment processing failed. Please try again.');
      setStep('ERROR');
    }
  };

  if (!orderConfig) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden text-center"
      >
        {step === 'PROCESSING' && (
          <div className="p-10 space-y-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-orange-50 border-4 border-orange-100 flex items-center justify-center text-orange-500 animate-pulse">
              <Loader2 className="w-10 h-10 animate-spin" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-slate-900">Processing Payment...</h3>
              <p className="text-xs text-slate-500">
                Securing your {orderConfig.paymentMethod} transaction of ₹{orderConfig.totalAmount}
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>CanteenX Smart Token Gateway</span>
            </div>
          </div>
        )}

        {step === 'ERROR' && (
          <div className="p-8 space-y-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-rose-50 border-4 border-rose-100 flex items-center justify-center text-rose-500">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-slate-900">Payment Failed</h3>
              <p className="text-xs text-rose-600 bg-rose-50 p-3 rounded-xl border border-rose-100">{errorText}</p>
            </div>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-slate-900 text-white font-bold text-sm"
            >
              Back to Cart
            </button>
          </div>
        )}

        {step === 'SUCCESS' && confirmedOrder && (
          <div className="p-6 space-y-5">
            
            {/* Header Success Badge */}
            <div className="space-y-2">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-md">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900">Order Confirmed!</h3>
              <p className="text-xs text-slate-500">Your canteen order has been placed successfully.</p>
            </div>

            {/* Token & Pickup Time Highlight Box */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-2xl shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-24 h-24 bg-orange-500/10 rounded-full blur-xl"></div>
              
              <div className="relative z-10 flex items-center justify-between border-b border-slate-700/60 pb-3 mb-3">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Order Token</span>
                  <p className="text-3xl font-extrabold text-orange-400 tracking-tight">{confirmedOrder.order_number}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Pickup Slot</span>
                  <p className="text-xs font-bold text-emerald-400">{confirmedOrder.slot_time}</p>
                </div>
              </div>

              {/* QR Code Container */}
              {qrDataUrl && (
                <div className="bg-white p-3 rounded-xl w-fit mx-auto shadow-inner">
                  <img src={qrDataUrl} alt="Order QR Token" className="w-36 h-36" />
                </div>
              )}

              <p className="text-[11px] text-slate-300 mt-3 font-medium">
                Show this QR Code or Token Number at Counter 2 for collection.
              </p>
            </div>

            {/* Items Summary list */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-left space-y-2 text-xs">
              <div className="flex justify-between font-bold text-slate-700 pb-2 border-b border-slate-200">
                <span>Items ({confirmedOrder.items?.length})</span>
                <span>Amount: ₹{confirmedOrder.total_amount}</span>
              </div>
              {confirmedOrder.items?.map(it => (
                <div key={it.id} className="flex justify-between text-slate-600">
                  <span>{it.quantity} × {it.item_name}</span>
                  <span>₹{it.price * it.quantity}</span>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => {
                  onClose();
                  navigate('/my-orders');
                }}
                className="py-3 px-4 rounded-xl border border-slate-200 text-slate-800 hover:bg-slate-50 font-bold text-xs"
              >
                My Orders
              </button>
              <button
                onClick={() => {
                  onClose();
                  navigate(`/orders/track?token=${confirmedOrder.order_number}`);
                }}
                className="py-3 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 flex items-center justify-center gap-1.5"
              >
                Track Live Order
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        )}
      </motion.div>
    </div>
  );
}
