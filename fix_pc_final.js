import fs from 'fs';
let content = fs.readFileSync('src/components/ProductCard.tsx', 'utf8');

// [PC1] Remove p-4, change object-contain to object-cover
content = content.replace(/className="relative aspect-\[4\/3\] bg-slate-50 dark:bg-slate-800 overflow-hidden p-4 flex items-center justify-center"/g, 'className="relative aspect-[4/3] bg-slate-50 dark:bg-slate-800 overflow-hidden flex items-center justify-center"');
content = content.replace(/className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"/g, 'className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"');

// [PC2] Body p-5 -> p-4
content = content.replace(/<div className="p-5 flex flex-col flex-1">/g, '<div className="p-4 flex flex-col flex-1">');

// [PC3] mt-4 price row -> mt-3
content = content.replace(/<div className="mt-4 flex items-center justify-between">/g, '<div className="mt-3 flex items-center justify-between">');

fs.writeFileSync('src/components/ProductCard.tsx', content);
