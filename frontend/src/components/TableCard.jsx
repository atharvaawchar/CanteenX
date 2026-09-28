import React from 'react';
import { Users, Clock, ShieldAlert, CheckCircle, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TableCard({ table, onReserve, isAdmin, onAdminStatusChange }) {
  const getStatusConfig = () => {
    switch (table.status) {
      case 'AVAILABLE':
        return {
          bg: 'bg-emerald-50 border-emerald-200',
          badgeBg: 'bg-emerald-500 text-white',
          dot: 'bg-emerald-500',
          label: 'AVAILABLE',
          textColor: 'text-emerald-800'
        };
      case 'OCCUPIED':
        return {
          bg: 'bg-rose-50 border-rose-200 opacity-90',
          badgeBg: 'bg-rose-500 text-white',
          dot: 'bg-rose-500',
          label: 'OCCUPIED',
          textColor: 'text-rose-800'
        };
      case 'RESERVED':
        return {
          bg: 'bg-amber-50 border-amber-200',
          badgeBg: 'bg-amber-500 text-white',
          dot: 'bg-amber-500',
          label: 'RESERVED (20m)',
          textColor: 'text-amber-800'
        };
      case 'CLEANING':
      default:
        return {
          bg: 'bg-slate-100 border-slate-200',
          badgeBg: 'bg-slate-500 text-white',
          dot: 'bg-slate-500',
          label: 'CLEANING',
          textColor: 'text-slate-700'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`rounded-2xl p-4 border transition-all flex flex-col justify-between shadow-sm relative overflow-hidden ${config.bg}`}
    >
      {/* Table visual icon header */}
      <div className="flex items-center justify-between">
        <span className="font-mono font-extrabold text-lg text-slate-900">
          Table {table.table_number}
        </span>
        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${config.badgeBg}`}>
          {config.label}
        </span>
      </div>

      {/* Seat layout visual graphic */}
      <div className="my-4 flex items-center justify-center gap-2 py-3 bg-white/60 rounded-xl backdrop-blur-sm">
        <Users className="w-4 h-4 text-slate-500" />
        <span className="text-xs font-bold text-slate-700">{table.seats} Seats</span>
      </div>

      {/* Actions */}
      {isAdmin ? (
        <div className="grid grid-cols-2 gap-1 text-[10px]">
          {['AVAILABLE', 'OCCUPIED', 'RESERVED', 'CLEANING'].map((st) => (
            <button
              key={st}
              onClick={() => onAdminStatusChange(table.id, st)}
              className={`py-1 px-1.5 rounded font-bold transition-all ${
                table.status === st
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white/80 text-slate-600 hover:bg-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      ) : table.status === 'AVAILABLE' ? (
        <button
          onClick={() => onReserve(table)}
          className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
        >
          Reserve Table (20 mins)
        </button>
      ) : (
        <span className="text-[11px] text-center font-semibold text-slate-400 block py-1">
          {table.status === 'RESERVED' ? 'Currently Locked' : 'Unavailable'}
        </span>
      )}
    </motion.div>
  );
}
