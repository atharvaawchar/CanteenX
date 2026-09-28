import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import ReceiptModal from '../components/ReceiptModal';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Clock, 
  CheckCircle2, 
  RotateCcw, 
  FileText, 
  ArrowRight, 
  Utensils, 
  PackageCheck,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function MyOrdersPage() {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('active'); // 'active', 'completed', 'cancelled'
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = () => {
    setLoading(true);
    api.getMyOrders()
      .then(setOrders)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleReorder = (order) => {
    order.items.forEach(item => {
      addToCart({
        id: item.food_item_id,
        name: item.item_name,
        price: item.price,
        image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
        availability: 'Available'
      }, item.quantity);
    });
    navigate('/menu');
  };

  const filteredOrders = orders.filter(o => {
    if (activeTab === 'active') {
      return o.status !== 'COLLECTED' && o.status !== 'CANCELLED';
    } else if (activeTab === 'completed') {
      return o.status === 'COLLECTED';
    } else {
      return o.status === 'CANCELLED';
    }
  });

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-4">
        <div>
          <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">Order History</span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            My Canteen Orders
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            View active tracking, download digital receipts or reorder past meals with one click.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 border-t border-slate-100 pt-3">
          {[
            { id: 'active', label: `Active Orders (${orders.filter(o => o.status !== 'COLLECTED' && o.status !== 'CANCELLED').length})` },
            { id: 'completed', label: `Completed (${orders.filter(o => o.status === 'COLLECTED').length})` },
            { id: 'cancelled', label: 'Cancelled' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(n => (
            <div key={n} className="h-40 bg-slate-100 animate-pulse rounded-2xl"></div>
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center space-y-4 border border-slate-100">
          <div className="w-16 h-16 mx-auto rounded-full bg-orange-50 text-orange-500 flex items-center justify-center">
            <Utensils className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-800 text-lg">No orders in this tab</h3>
            <p className="text-xs text-slate-500 mt-1">Pre-order food before lunch break to fill your order history.</p>
          </div>
          <Link to="/menu" className="inline-block px-5 py-2.5 rounded-xl bg-orange-500 text-white font-bold text-xs shadow-md">
            Order Meals Now
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((ord) => (
            <motion.div
              key={ord.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="font-extrabold text-lg text-slate-900 tracking-tight">
                    {ord.order_number}
                  </span>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                    ord.status === 'READY'
                      ? 'bg-emerald-500 text-white animate-bounce'
                      : ord.status === 'COLLECTED'
                      ? 'bg-slate-200 text-slate-700'
                      : 'bg-amber-500 text-white'
                  }`}>
                    {ord.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="text-xs text-slate-500 space-y-1">
                  <p className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-orange-500" />
                    <span>Pickup Slot: <strong>{ord.slot_time}</strong></span>
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Placed on: {new Date(ord.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                  </p>
                </div>

                {/* Items summary */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {ord.items?.map(it => (
                    <span key={it.id} className="bg-slate-50 border border-slate-200/60 text-slate-700 text-xs font-semibold px-2.5 py-1 rounded-lg">
                      {it.quantity} × {it.item_name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Price & Actions */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center md:items-end gap-3 border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
                <div className="text-left md:text-right">
                  <span className="text-[11px] text-slate-400 block font-medium">Total Amount</span>
                  <span className="text-xl font-extrabold text-slate-900">₹{ord.total_amount}</span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setSelectedReceiptOrder(ord)}
                    className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <FileText className="w-4 h-4 text-slate-500" />
                    <span>Receipt</span>
                  </button>

                  <button
                    onClick={() => handleReorder(ord)}
                    className="p-2.5 rounded-xl bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4 text-orange-500" />
                    <span>Reorder</span>
                  </button>

                  {ord.status !== 'COLLECTED' && (
                    <Link
                      to={`/orders/track?token=${ord.order_number}`}
                      className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-colors"
                    >
                      <span>Track Order</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Digital Receipt Modal */}
      {selectedReceiptOrder && (
        <ReceiptModal
          order={selectedReceiptOrder}
          onClose={() => setSelectedReceiptOrder(null)}
        />
      )}

    </div>
  );
}
