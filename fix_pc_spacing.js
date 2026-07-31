import fs from 'fs';
let content = fs.readFileSync('src/components/ProductCard.tsx', 'utf8');

content = content.replace(/<div className="relative aspect-\[4\/3\] p-4 bg-slate-50 dark:bg-slate-800\/50">/g, 
'<div className="relative aspect-[4/3] bg-slate-50 dark:bg-slate-800/50">');
content = content.replace(/className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"/g, 
'className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"');

// P-5 to P-4
content = content.replace(/<div className="p-5">/g, '<div className="p-4">');

// mt-4 to mt-3
content = content.replace(/<div className="mt-4 flex items-center justify-between">/g, '<div className="mt-3 flex items-center justify-between">');

fs.writeFileSync('src/components/ProductCard.tsx', content);
