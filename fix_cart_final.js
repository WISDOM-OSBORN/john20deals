import fs from 'fs';
let content = fs.readFileSync('src/pages/Cart.tsx', 'utf8');

// [C1] py-12 -> py-6 ; gap-12 -> gap-8
content = content.replace(/py-12/g, 'py-6');
content = content.replace(/gap-12/g, 'gap-8');

// [C2] Item image h-24 w-24 -> h-20 w-20
content = content.replace(/className="h-24 w-24 flex-shrink-0 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden"/g, 'className="h-20 w-20 flex-shrink-0 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden"');

// [C3] mb-8 title -> mb-6
content = content.replace(/mb-8/g, 'mb-6');

// [C4] WhatsApp button py-4 text-lg -> py-3 text-base
content = content.replace(/py-4 text-lg/g, 'py-3 text-base');

fs.writeFileSync('src/pages/Cart.tsx', content);
