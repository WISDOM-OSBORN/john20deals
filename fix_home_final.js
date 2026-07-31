import fs from 'fs';
let content = fs.readFileSync('src/pages/Home.tsx', 'utf8');

content = content.replace(/className="hidden md:grid md:grid-cols-4 gap-6"/g, 'className="hidden md:grid md:grid-cols-4 gap-5"');
content = content.replace(/className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"/g, 'className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"');
content = content.replace(/className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 h-80 animate-pulse"/g, 'className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 h-64 animate-pulse"');
content = content.replace(/className="md:hidden relative w-full overflow-hidden -mx-4 px-4 sm:mx-0 sm:px-0"/g, 'className="md:hidden relative w-full overflow-hidden"');

fs.writeFileSync('src/pages/Home.tsx', content);
