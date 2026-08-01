import React from 'react';

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  accent: string;
}

export default function StatCard({ label, value, icon, accent }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-lg transition-shadow">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-2xl ${accent}`}>{icon}</div>
        <div>
          <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider">{label}</p>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">{value}</h3>
        </div>
      </div>
    </div>
  );
}
