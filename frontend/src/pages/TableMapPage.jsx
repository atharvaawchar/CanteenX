import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useSocket } from '../context/SocketContext';
import TableCard from '../components/TableCard';
import { 
  Users, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Info,
  Layers
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function TableMapPage() {
  const socket = useSocket();
  const [tables, setTables] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resMsg, setResMsg] = useState({ text: '', type: '' });

  const fetchTables = () => {
    api.getTables()
      .then(data => {
        setTables(data.tables || []);
        setSummary(data.summary || {});
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTables();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('tables_updated', (updatedTables) => {
        setTables(updatedTables);
        setSummary({
          total: updatedTables.length,
          available: updatedTables.filter(t => t.status === 'AVAILABLE').length,
          occupied: updatedTables.filter(t => t.status === 'OCCUPIED').length,
          reserved: updatedTables.filter(t => t.status === 'RESERVED').length,
          cleaning: updatedTables.filter(t => t.status === 'CLEANING').length
        });
      });
    }
  }, [socket]);

  const handleReserveTable = async (table) => {
    try {
      setResMsg({ text: '', type: '' });
      const res = await api.reserveTable(table.id);
      setResMsg({ text: res.message, type: 'success' });
      fetchTables();
    } catch (err) {
      setResMsg({ text: err.message || 'Failed to reserve table', type: 'error' });
    }
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Page Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">
              Smart Seating Management
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              Find a Seat Before You Arrive
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Live graphic map of canteen tables. Reserve a table for 20 minutes before walking over.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-100 text-xs font-bold text-slate-700">
            <Info className="w-4 h-4 text-orange-500" />
            <span>20 Mins Reservation Lock</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-bold pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-emerald-700">
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            <span>Available ({summary?.available || 0})</span>
          </div>
          <div className="flex items-center gap-1.5 text-rose-700">
            <div className="w-3 h-3 rounded-full bg-rose-500"></div>
            <span>Occupied ({summary?.occupied || 0})</span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-700">
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            <span>Reserved ({summary?.reserved || 0})</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600">
            <div className="w-3 h-3 rounded-full bg-slate-400"></div>
            <span>Cleaning ({summary?.cleaning || 0})</span>
          </div>
        </div>
      </div>

      {resMsg.text && (
        <div className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-2 ${
          resMsg.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          {resMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
          <span>{resMsg.text}</span>
        </div>
      )}

      {/* 20 TABLES GRAPHICAL MAP GRID */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-100 animate-pulse rounded-2xl"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
          {tables.map((tbl) => (
            <TableCard
              key={tbl.id}
              table={tbl}
              onReserve={handleReserveTable}
            />
          ))}
        </div>
      )}

    </div>
  );
}
