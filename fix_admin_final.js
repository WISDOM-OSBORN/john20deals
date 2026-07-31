import fs from 'fs';
let content = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');

// [A1]
content = content.replace(/className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"/g, 'className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"');
content = content.replace(/className="flex items-center justify-between mb-8"/g, 'className="flex items-center justify-between mb-6"');

// [A2] Stats cards
content = content.replace(/className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"/g, 'className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"');
content = content.replace(/className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm"/g, 'className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm"');
content = content.replace(/className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900\/30 text-blue-600 dark:text-blue-400"/g, 'className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"');
content = content.replace(/className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900\/30 text-emerald-600 dark:text-emerald-400"/g, 'className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"');
content = content.replace(/className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900\/30 text-purple-600 dark:text-purple-400"/g, 'className="p-3 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"');
content = content.replace(/className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900\/30 text-amber-600 dark:text-amber-400"/g, 'className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"');

// [A3] Table headers and cells
content = content.replace(/py-5/g, 'py-4');
content = content.replace(/py-4/g, 'py-3'); // will catch py-4 that were just replaced? Let's be careful.
// Wait, I should use specific replace for table cells
content = content.replace(/<th className="text-left py-5 px-6/g, '<th className="text-left py-4 px-6');
content = content.replace(/<td className="py-4 px-6/g, '<td className="py-3 px-6');

// [A4] Charts h-80 -> h-64
content = content.replace(/h-80/g, 'h-64');

// [A5] Newsletter gap-8 -> gap-6, broadcast card p-8 -> p-6
content = content.replace(/className="grid grid-cols-1 lg:grid-cols-2 gap-8"/g, 'className="grid grid-cols-1 lg:grid-cols-2 gap-6"');
content = content.replace(/className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm"/g, 'className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm"');

fs.writeFileSync('src/pages/AdminDashboard.tsx', content);
