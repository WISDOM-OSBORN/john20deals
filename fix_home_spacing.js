import fs from 'fs';
let content = fs.readFileSync('src/pages/Home.tsx', 'utf8');

// H1
content = content.replace(/<div className="space-y-16 pb-16">/g, '<div className="space-y-12 pb-12">');
// H2 & H6 (remove bg image)
content = content.replace(/      \{\/\* Hero Section \*\/\}\n      <section className="relative overflow-hidden bg-slate-50 dark:bg-slate-900 py-16">\n        <div className="absolute inset-0 z-0 opacity-\[0\.04\] dark:opacity-10 pointer-events-none"\n             style=\{\{ backgroundImage: "url\('https:\/\/images\.unsplash\.com\/photo-1550751827-4bd374c3f58b\?q=80&w=2070&auto=format&fit=crop'\)", backgroundSize: "cover", backgroundPosition: "center" \}\}\n        ><\/div>/g, 
`      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-50 dark:bg-slate-900 py-12">`);

// H3
content = content.replace(/<p className="text-xl text-slate-600 dark:text-slate-300 mb-10 max-w-2xl mx-auto">/g, 
'<p className="text-xl text-slate-600 dark:text-slate-300 mb-6 max-w-2xl mx-auto">');

// H7 "Nationwide Delivery"
// <div className="bg-blue-600 dark:bg-blue-900 text-white py-12">
content = content.replace(/<div className="bg-blue-600 dark:bg-blue-900 text-white py-12">/g, '<div className="bg-blue-600 dark:bg-blue-900 text-white py-8">');
content = content.replace(/<Truck className="h-6 w-6 text-blue-200" \/>/g, '<Truck className="h-5 w-5 text-blue-200" />');
content = content.replace(/<ShieldCheck className="h-6 w-6 text-blue-200" \/>/g, '<ShieldCheck className="h-5 w-5 text-blue-200" />');
content = content.replace(/<Clock className="h-6 w-6 text-blue-200" \/>/g, '<Clock className="h-5 w-5 text-blue-200" />');

// [H9] L266 Category tiles aspect-square + p-6 text inset are huge. Reduce padding to p-4, heading text-xl -> text-lg.
content = content.replace(/<div className="absolute inset-0 bg-gradient-to-t from-black\/80 via-black\/30 to-transparent flex items-end p-6">/g, 
'<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-end p-4">');
content = content.replace(/<h3 className="text-white font-bold text-xl">/g, '<h3 className="text-white font-bold text-lg">');

fs.writeFileSync('src/pages/Home.tsx', content);
