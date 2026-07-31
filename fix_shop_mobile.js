import fs from 'fs';
let content = fs.readFileSync('src/pages/Shop.tsx', 'utf8');

// Add mobile category select
content = content.replace(/          \{\/\* Sorting \*\/\}\n          <div className="relative">/g, 
`          {/* Categories (Mobile) */}
          <div className="relative lg:hidden">
            <select 
              value={categoryFilter || 'All'}
              onChange={(e) => setSearchParams({ category: e.target.value === 'All' ? '' : e.target.value })}
              className="pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white dark:bg-slate-800 font-medium text-sm text-slate-700 dark:text-slate-300 w-full sm:w-48"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <Filter className="h-4 w-4 text-slate-400" />
            </div>
          </div>

          {/* Sorting */}
          <div className="relative">`);

// Replace lg sidebar 
// [S3] L157 gap-8 sidebar/grid -> gap-6
// [S4] L159 Sidebar w-64 + p-6 -> w-56 + p-4
content = content.replace(/<div className="flex flex-col lg:flex-row gap-8">/g, '<div className="flex flex-col lg:flex-row gap-6">');
content = content.replace(/<aside className="hidden lg:block w-64 flex-shrink-0">/g, '<aside className="hidden lg:block w-56 flex-shrink-0">');
content = content.replace(/<div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 sticky top-24 shadow-sm">/g, '<div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 sticky top-24 shadow-sm">');


fs.writeFileSync('src/pages/Shop.tsx', content);
