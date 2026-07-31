import fs from 'fs';
let content = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');

content = content.replace(/bg-slate-50 focus:bg-white/g, 'bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500');

fs.writeFileSync('src/pages/AdminDashboard.tsx', content);
