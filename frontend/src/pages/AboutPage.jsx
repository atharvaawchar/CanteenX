import React from 'react';
import { Utensils, ShieldCheck, Clock, Users, Zap, Award, CheckCircle2 } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-16">
      
      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm text-center space-y-4">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
          <Utensils className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">About CanteenX</h1>
        <p className="text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
          CanteenX is an intelligent college canteen management and pre-ordering platform engineered to solve lunch break crowding, long billing queues, and food preparation delays.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-3">
          <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
            <Zap className="w-5 h-5 text-orange-500" />
            The Campus Problem
          </h3>
          <ul className="space-y-2 text-xs text-slate-600 list-disc pl-4">
            <li>500+ students reaching canteen at the exact same lunch break timestamp.</li>
            <li>Long physical billing queues wasting 15-20 mins out of a 30-min break.</li>
            <li>Kitchen delays due to sudden unmanaged peak orders.</li>
            <li>Overcrowded dining tables and uncertainty of food stock availability.</li>
          </ul>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-3">
          <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            The CanteenX Solution
          </h3>
          <ul className="space-y-2 text-xs text-slate-600 list-disc pl-4">
            <li>Distributed 5-minute express pickup slot selection.</li>
            <li>Pre-ordering meals before the bell rings with digital tokens.</li>
            <li>Live Kanban order prep tracking for kitchen staff & students.</li>
            <li>Real-time 20-table seat map and digital wallet payments.</li>
          </ul>
        </div>
      </div>

    </div>
  );
}
