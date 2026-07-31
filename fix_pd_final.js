import fs from 'fs';
let content = fs.readFileSync('src/pages/ProductDetails.tsx', 'utf8');

// [PD1] p-8 -> p-0 for image container
content = content.replace(/className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-8 flex items-center justify-center aspect-square lg:aspect-auto h-full max-h-\[500px\]"/g, 'className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-center overflow-hidden aspect-square lg:aspect-auto h-full max-h-[500px]"');
content = content.replace(/className="max-w-full max-h-full object-contain"/g, 'className="w-full h-full object-cover"');

// [PD2] gap-12 -> gap-8
content = content.replace(/className="grid grid-cols-1 lg:grid-cols-2 gap-12"/g, 'className="grid grid-cols-1 lg:grid-cols-2 gap-8"');

// [PD3] Thumbnails w-20 h-20 -> w-16 h-16
content = content.replace(/className={\`h-20 w-20 rounded-xl/g, 'className={`h-16 w-16 rounded-xl');
content = content.replace(/className="h-20 w-20 rounded-xl/g, 'className="h-16 w-16 rounded-xl');
content = content.replace(/w-20/g, 'w-16'); // just in case
content = content.replace(/h-20/g, 'h-16');

// [PD4] Price box p-6 -> p-5, mb-8 -> mb-6
content = content.replace(/className="bg-slate-50 dark:bg-slate-800\/50 rounded-2xl p-6 mb-8"/g, 'className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 mb-6"');

// [PD5] Remove Fake SKU
content = content.replace(/<span className="text-slate-400 dark:text-slate-500">•<\/span>\n\s*<span className="text-slate-500 dark:text-slate-400">SKU: PT-[a-zA-Z0-9]+<\/span>/g, '');

fs.writeFileSync('src/pages/ProductDetails.tsx', content);
