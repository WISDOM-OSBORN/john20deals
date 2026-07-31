import fs from 'fs';
let content = fs.readFileSync('src/pages/Support.tsx', 'utf8');

content = content.replace(/<div className="py-12 px-4 max-w-7xl mx-auto">/g, '<div className="py-8 px-4 max-w-7xl mx-auto">');
content = content.replace(/className="bg-white dark:bg-slate-900 p-6 rounded-2xl/g, 'className="bg-white dark:bg-slate-900 p-5 rounded-2xl');
content = content.replace(/<div className="bg-blue-600 dark:bg-blue-900 rounded-3xl p-8 text-center text-white shadow-xl">/g, '<div className="bg-blue-600 dark:bg-blue-900 rounded-3xl p-6 text-center text-white shadow-xl">');

fs.writeFileSync('src/pages/Support.tsx', content);
