import fs from 'fs';
let content = fs.readFileSync('src/pages/Wishlist.tsx', 'utf8');

content = content.replace(/<div className="py-12 px-4 max-w-7xl mx-auto">/g, '<div className="py-8 px-4 max-w-7xl mx-auto">');
content = content.replace(/<div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">/g, '<div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">');
content = content.replace(/<div className="bg-slate-50 dark:bg-slate-800\/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">/g, '<div className="bg-slate-50 dark:bg-slate-800/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">');
content = content.replace(/className="inline-block bg-blue-600 text-white font-bold px-8 py-4 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600\/20"/g, 'className="inline-block bg-blue-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"');

fs.writeFileSync('src/pages/Wishlist.tsx', content);
