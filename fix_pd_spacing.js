import fs from 'fs';
let content = fs.readFileSync('src/pages/ProductDetails.tsx', 'utf8');

content = content.replace(/<div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">/g, '<div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">');
content = content.replace(/<div className="aspect-square bg-slate-50 dark:bg-slate-800\/50 rounded-3xl p-8 flex items-center justify-center mb-4 relative overflow-hidden border border-slate-100 dark:border-slate-800">/g, 
'<div className="aspect-square bg-slate-50 dark:bg-slate-800/50 rounded-3xl flex items-center justify-center mb-4 relative overflow-hidden border border-slate-100 dark:border-slate-800">');
content = content.replace(/className="w-20 h-20 rounded-xl/g, 'className="w-16 h-16 rounded-xl');

content = content.replace(/<div className="bg-slate-50 dark:bg-slate-800\/50 p-6 rounded-2xl mb-8 border border-slate-100 dark:border-slate-800">/g, 
'<div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl mb-6 border border-slate-100 dark:border-slate-800">');

content = content.replace(/              <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mb-6">\n                <span>SKU: PT-\{product\.id\.substring\(0, 6\)\}<\/span>\n                <span>•<\/span>\n                <span className="capitalize">Condition: \{product\.condition \|\| 'New'\}<\/span>\n              <\/div>/, 
`              <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mb-6">
                <span className="capitalize">Condition: {product.condition || 'New'}</span>
              </div>`);

fs.writeFileSync('src/pages/ProductDetails.tsx', content);
