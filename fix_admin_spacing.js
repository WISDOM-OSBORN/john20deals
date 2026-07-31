import fs from 'fs';
let content = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');

content = content.replace(/<div className="py-8 px-4 max-w-7xl mx-auto">/g, '<div className="py-6 px-4 max-w-7xl mx-auto">');
content = content.replace(/<div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">/g, '<div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">');
content = content.replace(/<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">/g, '<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">');
content = content.replace(/className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6/g, 'className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5');
content = content.replace(/<div className="bg-blue-50 dark:bg-blue-900\/30 p-4 rounded-2xl">/g, '<div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-2xl">');
content = content.replace(/<div className="bg-green-50 dark:bg-green-900\/30 p-4 rounded-2xl">/g, '<div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-2xl">');
content = content.replace(/<div className="bg-purple-50 dark:bg-purple-900\/30 p-4 rounded-2xl">/g, '<div className="bg-purple-50 dark:bg-purple-900/30 p-3 rounded-2xl">');
content = content.replace(/<div className="bg-orange-50 dark:bg-orange-900\/30 p-4 rounded-2xl">/g, '<div className="bg-orange-50 dark:bg-orange-900/30 p-3 rounded-2xl">');

content = content.replace(/px-6 py-5/g, 'px-6 py-4');
content = content.replace(/px-6 py-4/g, 'px-6 py-3');

content = content.replace(/className="h-80"/g, 'className="h-64"');

fs.writeFileSync('src/pages/AdminDashboard.tsx', content);
