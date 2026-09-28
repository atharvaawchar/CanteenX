import React from 'react';
import { X, Printer, Download, CheckCircle2, Utensils } from 'lucide-react';

export default function ReceiptModal({ order, onClose }) {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
        
        {/* Header toolbar */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-orange-400">Digital Tax Invoice</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 font-semibold px-2"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Receipt Body */}
        <div className="p-6 space-y-6 text-slate-800 font-sans" id="printable-receipt">
          
          <div className="text-center space-y-1">
            <div className="w-10 h-10 mx-auto rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold">
              <Utensils className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-extrabold tracking-tight">CanteenX</h3>
            <p className="text-xs text-slate-500 font-medium">Campus Central Food Counter</p>
            <span className="inline-block mt-1 px-2.5 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full">
              PAID — {order.payment_method}
            </span>
          </div>

          <div className="border-t border-b border-dashed border-slate-200 py-3 text-xs space-y-1 text-slate-600">
            <div className="flex justify-between">
              <span>Token Number:</span>
              <span className="font-mono font-bold text-slate-900">{order.order_number}</span>
            </div>
            <div className="flex justify-between">
              <span>Date & Time:</span>
              <span className="font-semibold text-slate-800">
                {new Date(order.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Pickup Slot:</span>
              <span className="font-semibold text-orange-600">{order.slot_time}</span>
            </div>
            <div className="flex justify-between">
              <span>Customer:</span>
              <span className="font-semibold text-slate-800">{order.student_name || 'Atharva Deshmukh'}</span>
            </div>
          </div>

          {/* Items breakdown */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-400 uppercase border-b pb-1">
              <span>Item Description</span>
              <span>Qty × Price</span>
            </div>
            {order.items?.map((item) => (
              <div key={item.id} className="flex justify-between text-xs text-slate-800 font-medium">
                <span>{item.item_name}</span>
                <span>{item.quantity} × ₹{item.price} = ₹{item.quantity * item.price}</span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="border-t border-slate-200 pt-3 space-y-1 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span>₹{Math.round(order.total_amount / 1.05)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>GST (5%)</span>
              <span>₹{order.total_amount - Math.round(order.total_amount / 1.05)}</span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-slate-200">
              <span>Total Paid</span>
              <span className="text-orange-600">₹{order.total_amount}</span>
            </div>
          </div>

          <div className="text-center text-[11px] text-slate-400 pt-2">
            Thank you for ordering with CanteenX! Keep campus queue-free.
          </div>

        </div>

      </div>
    </div>
  );
}
