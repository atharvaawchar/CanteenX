import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import TableCard from '../../components/TableCard';
import { 
  LayoutDashboard, 
  ChefHat, 
  Utensils, 
  Boxes, 
  Clock, 
  Users, 
  BarChart3, 
  QrCode, 
  Megaphone, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle,
  Plus,
  Trash2,
  Edit,
  Flame,
  Zap,
  Search
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
  const socket = useSocket();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'orders', 'menu', 'inventory', 'slots', 'tables', 'analytics', 'scan', 'announcement'
  
  // Data States
  const [analytics, setAnalytics] = useState(null);
  const [allOrders, setAllOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [slots, setSlots] = useState([]);
  const [tables, setTables] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Scan Token State
  const [scanInput, setScanInput] = useState('');
  const [scannedResult, setScannedResult] = useState(null);
  const [scanMsg, setScanMsg] = useState('');

  // Announcement State
  const [newAnnounceMsg, setNewAnnounceMsg] = useState('');

  // Menu Form Modal State
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemForm, setItemForm] = useState({
    name: '',
    category_id: 1,
    description: '',
    price: 60,
    stock: 20,
    prep_time: 10,
    is_veg: true,
    image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
    availability: 'Available',
    is_special: false
  });

  const fetchAllData = () => {
    setLoading(true);
    Promise.all([
      api.getAnalytics(),
      api.getAllOrdersAdmin(),
      api.getMenuItems({ sort: 'popular' }),
      api.getCategories(),
      api.getSlots(),
      api.getTables(),
      api.getAnnouncements()
    ]).then(([ana, ords, items, cats, slts, tbls, anns]) => {
      setAnalytics(ana);
      setAllOrders(ords || []);
      setMenuItems(items || []);
      setCategories(cats || []);
      setSlots(slts || []);
      setTables(tbls.tables || []);
      setAnnouncements(anns || []);
    }).catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('new_order', (newOrd) => {
        setAllOrders(prev => [newOrd, ...prev]);
        fetchAllData();
      });
      socket.on('order_status_changed', () => fetchAllData());
      socket.on('tables_updated', (t) => setTables(t));
    }
  }, [socket]);

  // Order Status transition helper
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      fetchAllData();
    } catch (err) {
      alert(err.message);
    }
  };

  // QR / Token verification scan submit
  const handleScanSubmit = async (e) => {
    e.preventDefault();
    setScanMsg('');
    setScannedResult(null);
    try {
      const res = await api.scanTokenQR(scanInput);
      if (res.found) {
        setScannedResult(res.order);
      }
    } catch (err) {
      setScanMsg(err.message || 'Token not found');
    }
  };

  const handleConfirmCollection = async () => {
    if (scannedResult) {
      await handleUpdateOrderStatus(scannedResult.id, 'COLLECTED');
      setScannedResult(null);
      setScanInput('');
      setScanMsg(`Order ${scannedResult.order_number} successfully marked COLLECTED!`);
    }
  };

  // Save Item (Add / Edit)
  const handleSaveItem = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.updateMenuItem(editingItem.id, itemForm);
      } else {
        await api.addMenuItem(itemForm);
      }
      setShowItemModal(false);
      setEditingItem(null);
      fetchAllData();
    } catch (err) {
      alert(err.message);
    }
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setItemForm({
      name: item.name,
      category_id: item.category_id || 1,
      description: item.description || '',
      price: item.price,
      stock: item.stock,
      prep_time: item.prep_time,
      is_veg: item.is_veg === 1,
      image_url: item.image_url,
      availability: item.availability,
      is_special: item.is_special === 1
    });
    setShowItemModal(true);
  };

  const handleDeleteItem = async (id) => {
    if (confirm('Are you sure you want to delete this menu item?')) {
      await api.deleteMenuItem(id);
      fetchAllData();
    }
  };

  // Post Announcement
  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    if (newAnnounceMsg.trim()) {
      await api.postAnnouncement(newAnnounceMsg);
      setNewAnnounceMsg('');
      const updated = await api.getAnnouncements();
      setAnnouncements(updated);
    }
  };

  // Update Slot Capacity
  const handleSlotCapacityChange = async (slotId, newCapacity) => {
    await api.updateSlot(slotId, { capacity: Number(newCapacity) });
    fetchAllData();
  };

  const sidebarItems = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', label: 'Live Kitchen Orders', icon: ChefHat, badge: allOrders.filter(o => o.status !== 'COLLECTED' && o.status !== 'CANCELLED').length },
    { id: 'scan', label: 'QR Token Verification', icon: QrCode },
    { id: 'menu', label: 'Menu Management', icon: Utensils },
    { id: 'inventory', label: 'Inventory & Stock', icon: Boxes },
    { id: 'slots', label: 'Pickup Slots Config', icon: Clock },
    { id: 'tables', label: 'Table Seating Layout', icon: Users },
    { id: 'analytics', label: 'Analytics & Rush', icon: BarChart3 },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
  ];

  return (
    <div className="min-h-[85vh] grid grid-cols-1 lg:grid-cols-12 gap-6 pb-16">
      
      {/* Sidebar Navigation */}
      <div className="lg:col-span-3 bg-slate-900 text-slate-300 rounded-3xl p-4 shadow-xl border border-slate-800 space-y-4">
        <div className="p-3 border-b border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-orange-500 text-white flex items-center justify-center font-bold">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-white text-base">Canteen Staff</h3>
            <p className="text-[11px] text-orange-400 font-semibold">Admin Operation Center</p>
          </div>
        </div>

        <nav className="space-y-1">
          {sidebarItems.map(item => {
            const Icon = item.icon;
            const isSel = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all ${
                  isSel
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                    isSel ? 'bg-white text-orange-600' : 'bg-orange-500/20 text-orange-400'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Content View Pane */}
      <div className="lg:col-span-9 bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Today's Canteen Overview</h2>
                <p className="text-xs text-slate-500">Live operational metrics & rush statistics</p>
              </div>
              <button
                onClick={() => setActiveTab('scan')}
                className="px-4 py-2.5 rounded-xl bg-orange-500 text-white font-bold text-xs shadow-md flex items-center gap-1.5"
              >
                <QrCode className="w-4 h-4" />
                <span>Scan Token QR</span>
              </button>
            </div>

            {/* KPI STAT CARDS */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <span className="text-xs text-slate-500 font-medium block">Total Orders</span>
                <span className="text-2xl font-extrabold text-slate-900 block mt-1">
                  {analytics?.kpis?.totalOrders || 186}
                </span>
              </div>
              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                <span className="text-xs text-emerald-700 font-medium block">Today's Revenue</span>
                <span className="text-2xl font-extrabold text-emerald-700 block mt-1">
                  ₹{analytics?.kpis?.totalRevenue || 14850}
                </span>
              </div>
              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100">
                <span className="text-xs text-amber-700 font-medium block">Preparing Now</span>
                <span className="text-2xl font-extrabold text-amber-700 block mt-1">
                  {analytics?.kpis?.preparing || 12}
                </span>
              </div>
              <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100">
                <span className="text-xs text-orange-700 font-medium block">Ready for Collection</span>
                <span className="text-2xl font-extrabold text-orange-600 block mt-1">
                  {analytics?.kpis?.ready || 7}
                </span>
              </div>
            </div>

            {/* Rush Prediction Banner */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 rounded-3xl shadow-md space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                <Flame className="w-4 h-4" />
                <span>Smart Rush Prediction System</span>
              </div>
              <h4 className="text-xl font-extrabold">Expected Peak Rush: HIGH ({analytics?.rushPrediction?.peakWindow})</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Suggested Action: {analytics?.rushPrediction?.recommendation}
              </p>
            </div>
          </div>
        )}

        {/* KANBAN LIVE KITCHEN ORDERS TAB */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Live Kitchen Kanban Board</h2>
                <p className="text-xs text-slate-500">Advance student order preparation statuses in real-time</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { title: 'NEW ORDERS', status: 'ORDER_PLACED', bg: 'bg-slate-100 border-slate-200' },
                { title: 'PREPARING', status: 'PREPARING', bg: 'bg-amber-50 border-amber-200' },
                { title: 'READY FOR PICKUP', status: 'READY', bg: 'bg-emerald-50 border-emerald-200' },
                { title: 'COMPLETED', status: 'COLLECTED', bg: 'bg-slate-50 border-slate-200' },
              ].map(col => {
                const colOrders = allOrders.filter(o => 
                  col.status === 'ORDER_PLACED' ? (o.status === 'ORDER_PLACED' || o.status === 'ACCEPTED') : o.status === col.status
                );

                return (
                  <div key={col.status} className={`p-4 rounded-3xl border space-y-3 min-h-[450px] ${col.bg}`}>
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <span className="font-extrabold text-xs text-slate-800">{col.title}</span>
                      <span className="bg-white px-2 py-0.5 rounded-full text-xs font-bold text-slate-700 shadow-sm">
                        {colOrders.length}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {colOrders.map(ord => (
                        <div key={ord.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2 text-xs">
                          <div className="flex items-center justify-between font-bold">
                            <span className="text-orange-600 font-extrabold text-sm">{ord.order_number}</span>
                            <span className="text-slate-400 text-[10px]">{ord.slot_time.split('–')[0]}</span>
                          </div>
                          
                          <p className="font-bold text-slate-800">{ord.student_name}</p>
                          
                          <div className="space-y-1 text-[11px] text-slate-600">
                            {ord.items?.map(it => (
                              <div key={it.id} className="flex justify-between">
                                <span>{it.quantity} × {it.item_name}</span>
                                <span>₹{it.price * it.quantity}</span>
                              </div>
                            ))}
                          </div>

                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                            <span className="font-extrabold text-slate-900">₹{ord.total_amount}</span>
                            
                            {/* Action Buttons */}
                            {ord.status === 'ORDER_PLACED' || ord.status === 'ACCEPTED' ? (
                              <button
                                onClick={() => handleUpdateOrderStatus(ord.id, 'PREPARING')}
                                className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-[10px]"
                              >
                                Start Cooking
                              </button>
                            ) : ord.status === 'PREPARING' ? (
                              <button
                                onClick={() => handleUpdateOrderStatus(ord.id, 'READY')}
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px]"
                              >
                                Mark Ready
                              </button>
                            ) : ord.status === 'READY' ? (
                              <button
                                onClick={() => handleUpdateOrderStatus(ord.id, 'COLLECTED')}
                                className="px-2.5 py-1.5 rounded-lg bg-slate-900 text-white font-bold text-[10px]"
                              >
                                Complete Order
                              </button>
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* QR TOKEN SCANNER VERIFIER TAB */}
        {activeTab === 'scan' && (
          <div className="max-w-xl mx-auto space-y-6 py-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-orange-500 text-white flex items-center justify-center font-bold">
                <QrCode className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900">QR Pickup Verification</h2>
              <p className="text-xs text-slate-500">Enter token number (e.g. CX-1042) or scan QR code to verify and release meal.</p>
            </div>

            <form onSubmit={handleScanSubmit} className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={scanInput}
                  onChange={(e) => setScanInput(e.target.value)}
                  placeholder="Enter token like CX-1042..."
                  className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 text-sm font-bold focus:outline-none focus:border-orange-500"
                />
                <button
                  type="submit"
                  className="px-6 py-3 rounded-2xl bg-slate-900 text-white font-bold text-xs shadow-md"
                >
                  Verify Token
                </button>
              </div>
            </form>

            {scanMsg && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-bold text-center">
                {scanMsg}
              </div>
            )}

            {scannedResult && (
              <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <div>
                    <span className="text-xs text-slate-400 font-bold uppercase">Token Verified</span>
                    <h3 className="text-2xl font-extrabold text-orange-600">{scannedResult.order_number}</h3>
                  </div>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 font-bold text-xs rounded-full">
                    {scannedResult.status}
                  </span>
                </div>

                <div className="text-xs space-y-1 text-slate-700">
                  <p><strong>Student:</strong> {scannedResult.student_name} ({scannedResult.student_prn})</p>
                  <p><strong>Pickup Slot:</strong> {scannedResult.slot_time}</p>
                  <p><strong>Payment Status:</strong> {scannedResult.payment_status} ({scannedResult.payment_method})</p>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                  <span className="font-bold text-slate-800 block">Ordered Food Items:</span>
                  {scannedResult.items?.map(it => (
                    <div key={it.id} className="flex justify-between text-slate-600">
                      <span>{it.quantity} × {it.item_name}</span>
                      <span>₹{it.price * it.quantity}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleConfirmCollection}
                  className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md"
                >
                  Confirm Collection & Handover Food
                </button>
              </div>
            )}
          </div>
        )}

        {/* MENU MANAGEMENT TAB */}
        {activeTab === 'menu' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Menu Item Management</h2>
                <p className="text-xs text-slate-500">Add, edit, change prices, update stock & availability states</p>
              </div>
              <button
                onClick={() => {
                  setEditingItem(null);
                  setItemForm({
                    name: '',
                    category_id: 1,
                    description: '',
                    price: 70,
                    stock: 20,
                    prep_time: 10,
                    is_veg: true,
                    image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
                    availability: 'Available',
                    is_special: false
                  });
                  setShowItemModal(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-orange-500 text-white font-bold text-xs shadow-md flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Food Item</span>
              </button>
            </div>

            <div className="divide-y divide-slate-100 border border-slate-100 rounded-3xl overflow-hidden">
              {menuItems.map(item => (
                <div key={item.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    <img src={item.image_url} alt={item.name} className="w-12 h-12 rounded-xl object-cover" />
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                        {item.name}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          item.availability === 'Sold Out' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {item.availability}
                        </span>
                      </h4>
                      <p className="text-xs text-slate-500">₹{item.price} • Stock: {item.stock} • Prep: {item.prep_time}m</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* INVENTORY TAB */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Stock & Inventory Controls</h2>
                <p className="text-xs text-slate-500">Real-time stock monitoring. Automatically sets items Sold Out at stock 0.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {menuItems.map(item => (
                <div key={item.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50 flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-slate-800 text-xs">{item.name}</h5>
                    <span className="text-[11px] text-slate-500">Current Stock: <strong>{item.stock}</strong></span>
                  </div>

                  <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
                    <button
                      onClick={async () => {
                        const newSt = Math.max(0, item.stock - 5);
                        await api.updateMenuItem(item.id, { stock: newSt });
                        fetchAllData();
                      }}
                      className="px-2 py-1 font-bold text-xs hover:bg-slate-100 rounded"
                    >
                      -5
                    </button>
                    <span className="font-extrabold text-xs text-slate-900 px-1">{item.stock}</span>
                    <button
                      onClick={async () => {
                        const newSt = item.stock + 10;
                        await api.updateMenuItem(item.id, { stock: newSt, availability: 'Available' });
                        fetchAllData();
                      }}
                      className="px-2 py-1 font-bold text-xs hover:bg-slate-100 rounded text-emerald-600"
                    >
                      +10
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PICKUP SLOTS CONFIG TAB */}
        {activeTab === 'slots' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Pickup Slots Management</h2>
              <p className="text-xs text-slate-500">Configure 5-minute slot capacity limits (e.g. max 10 orders per slot)</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {slots.map(s => (
                <div key={s.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2 text-xs">
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>{s.slot_time}</span>
                    <span className="text-orange-600">{s.booked_count}/{s.capacity} Booked</span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-slate-500">Max Capacity:</span>
                    <input
                      type="number"
                      value={s.capacity}
                      onChange={(e) => handleSlotCapacityChange(s.id, e.target.value)}
                      className="w-16 px-2 py-1 border rounded text-xs font-bold text-center"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TABLES SEATING TAB */}
        {activeTab === 'tables' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Canteen Table Map Editor</h2>
              <p className="text-xs text-slate-500">Click table statuses to update live available seating map</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {tables.map(tbl => (
                <TableCard
                  key={tbl.id}
                  table={tbl}
                  isAdmin={true}
                  onAdminStatusChange={async (id, status) => {
                    await api.updateTableStatus(id, status);
                    fetchAllData();
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* ANNOUNCEMENT BANNER TAB */}
        {activeTab === 'announcements' && (
          <div className="max-w-xl mx-auto space-y-6">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Post Campus Announcement</h2>
              <p className="text-xs text-slate-500">Broadcast alert banner to all student dashboards in real-time</p>
            </div>

            <form onSubmit={handlePostAnnouncement} className="space-y-3">
              <textarea
                rows="3"
                required
                value={newAnnounceMsg}
                onChange={(e) => setNewAnnounceMsg(e.target.value)}
                placeholder="Type announcement e.g., 'Veg Thali available from 12:30 PM'..."
                className="w-full p-4 rounded-2xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-orange-500"
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs shadow-md"
              >
                Publish Live Announcement
              </button>
            </form>

            <div className="space-y-2 pt-4">
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Active Announcements</h4>
              {announcements.map(a => (
                <div key={a.id} className="p-3 rounded-xl bg-orange-50 border border-orange-200 text-xs font-semibold text-orange-900">
                  {a.message}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Item Edit Modal */}
      {showItemModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-extrabold text-slate-900 text-lg">
              {editingItem ? 'Edit Food Item' : 'Add New Food Item'}
            </h3>

            <form onSubmit={handleSaveItem} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Item Name</label>
                <input
                  type="text"
                  required
                  value={itemForm.name}
                  onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={itemForm.price}
                    onChange={(e) => setItemForm({ ...itemForm, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Stock Count</label>
                  <input
                    type="number"
                    required
                    value={itemForm.stock}
                    onChange={(e) => setItemForm({ ...itemForm, stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl text-xs font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows="2"
                  value={itemForm.description}
                  onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Availability State</label>
                  <select
                    value={itemForm.availability}
                    onChange={(e) => setItemForm({ ...itemForm, availability: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs font-medium bg-white"
                  >
                    <option value="Available">Available</option>
                    <option value="Selling Fast">Selling Fast</option>
                    <option value="Only 5 Left">Only 5 Left</option>
                    <option value="Temporarily Unavailable">Temp Unavailable</option>
                    <option value="Sold Out">Sold Out</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Prep Time (mins)</label>
                  <input
                    type="number"
                    value={itemForm.prep_time}
                    onChange={(e) => setItemForm({ ...itemForm, prep_time: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl text-xs font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Image URL</label>
                <input
                  type="text"
                  value={itemForm.image_url}
                  onChange={(e) => setItemForm({ ...itemForm, image_url: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs font-medium"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowItemModal(false)}
                  className="flex-1 py-2.5 rounded-xl border font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-orange-500 text-white font-bold"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
