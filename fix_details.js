import fs from 'fs';
let content = fs.readFileSync('src/pages/ProductDetails.tsx', 'utf8');
content = content.replace(
  /<button\s+onClick=\{\(\) => setShowSwapModal\(true\)\}\s+className="w-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-2 border-slate-200 dark:border-slate-700 py-4 rounded-xl font-bold text-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2"\s*>\s*<RefreshCw className="h-5 w-5" \/>\s*Propose Swap\s*<\/button>/g,
  `{product.swap_allowed !== false && (
              <button
                onClick={() => setShowSwapModal(true)}
                className="w-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-2 border-slate-200 dark:border-slate-700 py-4 rounded-xl font-bold text-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className="h-5 w-5" />
                Propose Swap
              </button>
            )}`
);
fs.writeFileSync('src/pages/ProductDetails.tsx', content);
