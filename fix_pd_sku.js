import fs from 'fs';
let content = fs.readFileSync('src/pages/ProductDetails.tsx', 'utf8');

// The SKU line: <span>SKU: PT-{product.id.slice(0, 8).toUpperCase()}</span>
// And the bullet before it: <span className="text-slate-400 dark:text-slate-500">•</span>
content = content.replace(/<span className="text-slate-400 dark:text-slate-500">•<\/span>\n\s*<span>SKU: PT-\{product\.id\.slice\(0, 8\)\.toUpperCase\(\)\}<\/span>/g, '');

fs.writeFileSync('src/pages/ProductDetails.tsx', content);
