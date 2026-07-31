import fs from 'fs';
let content = fs.readFileSync('src/pages/Home.tsx', 'utf8');

// [H1] space-y-16 pb-16 -> space-y-12 pb-12
content = content.replace(/className="space-y-16 pb-16"/g, 'className="space-y-12 pb-12"');
// [H2] py-16 -> py-12 (for hero)
content = content.replace(/className="relative bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-16 overflow-hidden"/g, 'className="relative bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-12 overflow-hidden"');
// [H3] mb-10 under hero heading
content = content.replace(/className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto"/g, 'className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 mb-6 max-w-2xl mx-auto"');
// [H4] Service cards p-6 -> p-5
content = content.replace(/className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group/g, 'className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group');
// [H5] floating animations -> remove animate-[float_3s_ease-in-out_infinite], animate-[float_4s_ease-in-out_infinite], etc.
content = content.replace(/ animate-\[float_[^\]]+\]/g, '');
// [H6] Hero background image -> remove it
content = content.replace(/<div className="absolute inset-0 opacity-\[0\.04\] dark:opacity-\[0\.02\] pointer-events-none" style=\{\{ backgroundImage: `url\('https:\/\/images\.unsplash\.com\/photo-[^\']+'\)` \}\}>\s*<\/div>/g, '');
// [H7] Nationwide Delivery banner
content = content.replace(/className="bg-slate-900 dark:bg-slate-800 rounded-3xl p-8 sm:p-12 text-center text-white relative overflow-hidden shadow-xl"/g, 'className="bg-slate-900 dark:bg-slate-800 rounded-3xl p-5 sm:p-8 text-center text-white relative overflow-hidden shadow-xl"');
content = content.replace(/<Truck className="h-8 w-8 text-blue-400" \/>/g, '<Truck className="h-6 w-6 text-blue-400" />');
// [H9] Category tiles p-6 -> p-4, text-xl -> text-lg
content = content.replace(/className="aspect-square rounded-2xl relative overflow-hidden group bg-slate-100 dark:bg-slate-800"/g, 'className="aspect-square rounded-2xl relative overflow-hidden group bg-slate-100 dark:bg-slate-800"');
content = content.replace(/className="absolute inset-0 bg-gradient-to-t from-black\/80 via-black\/30 to-transparent p-6 flex flex-col justify-end"/g, 'className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-4 flex flex-col justify-end"');
content = content.replace(/<h3 className="text-white font-bold text-xl mb-1 group-hover:-translate-y-1 transition-transform">/g, '<h3 className="text-white font-bold text-lg mb-1 group-hover:-translate-y-1 transition-transform">');

fs.writeFileSync('src/pages/Home.tsx', content);
