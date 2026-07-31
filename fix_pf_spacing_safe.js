import fs from 'fs';
let content = fs.readFileSync('src/pages/Profile.tsx', 'utf8');

content = content.replace(/<div className="py-12">/g, '<div className="py-8">');
content = content.replace(/<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">/g, '<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">');
content = content.replace(/<div className="bg-slate-50\/50 dark:bg-slate-800\/50 p-8 flex flex-col items-center gap-4 border-b border-slate-100 dark:border-slate-800 text-center">/g, 
'<div className="bg-slate-50/50 dark:bg-slate-800/50 p-6 flex flex-col items-center gap-4 border-b border-slate-100 dark:border-slate-800 text-center">');
content = content.replace(/<div className="p-8">/g, '<div className="p-6">');

fs.writeFileSync('src/pages/Profile.tsx', content);
