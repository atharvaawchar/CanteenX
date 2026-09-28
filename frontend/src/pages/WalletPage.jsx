import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Wallet, 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ShieldCheck, 
  CreditCard, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function WalletPage() {
  const { updateBalance } = useAuth();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addAmount, setAddAmount] = useState('200');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetchWallet();
  }, []);

  const fetchWallet = () => {
    setLoading(true);
    api.getWallet()
      .then(data => {
        setBalance(data.balance);
        setTransactions(data.transactions || []);
        updateBalance(data.balance);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleAddFunds = async (e) => {
    e.preventDefault();
    try {
      const res = await api.addWalletFunds(Number(addAmount));
      setBalance(res.balance);
      setTransactions(res.transactions || []);
      updateBalance(res.balance);
      setShowAddModal(false);
      setMsg(`Successfully recharged ₹${addAmount} to your wallet!`);
      setTimeout(() => setMsg(''), 4000);
    } catch (err) {
      alert(err.message || 'Failed to add funds');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-4">
        <div>
          <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">Campus Payments</span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            CanteenX Wallet
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Preload your canteen wallet for 1-click lightning fast checkout.
          </p>
        </div>
      </div>

      {msg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{msg}</span>
        </div>
      )}

      {/* Balance Card Banner */}
      <div className="bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-2">
          <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Available Balance</span>
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-amber-400">
            ₹{balance.toFixed(2)}
          </h2>
          <p className="text-xs text-slate-400 flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Encrypted Campus Digital Balance</span>
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs shadow-lg shadow-orange-500/25 flex items-center gap-2 transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span>Add Money</span>
        </button>
      </div>

      {/* Transactions History */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-4">
        <h3 className="font-extrabold text-slate-900 text-base">Transaction History</h3>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(n => (
              <div key={n} className="h-16 bg-slate-100 animate-pulse rounded-xl"></div>
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">No transactions recorded yet.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {transactions.map((tx) => (
              <div key={tx.id} className="py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    tx.type === 'credit' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                  }`}>
                    {tx.type === 'credit' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-800">{tx.description}</h5>
                    <span className="text-[10px] text-slate-400">
                      {new Date(tx.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </span>
                  </div>
                </div>

                <span className={`text-sm font-extrabold ${
                  tx.type === 'credit' ? 'text-emerald-600' : 'text-slate-900'
                }`}>
                  {tx.type === 'credit' ? '+' : '-'}₹{tx.amount}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Funds Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-5">
            <h3 className="font-extrabold text-slate-900 text-lg">Top Up Wallet</h3>
            <p className="text-xs text-slate-500">Select or enter top-up amount for simulated instant payment gateway.</p>

            <form onSubmit={handleAddFunds} className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                {['100', '200', '500'].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setAddAmount(amt)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      addAmount === amt
                        ? 'bg-orange-500 border-orange-600 text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    + ₹{amt}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Custom Amount (₹)
                </label>
                <input
                  type="number"
                  required
                  min="10"
                  value={addAmount}
                  onChange={(e) => setAddAmount(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md"
                >
                  Confirm Recharge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
