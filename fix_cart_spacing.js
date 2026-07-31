import fs from 'fs';
let content = fs.readFileSync('src/pages/Cart.tsx', 'utf8');

content = content.replace(/<div className="py-12 px-4 max-w-7xl mx-auto">/g, '<div className="py-6 px-4 max-w-7xl mx-auto">');
content = content.replace(/<h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">Shopping Cart<\/h1>/g, '<h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Shopping Cart</h1>');
content = content.replace(/<div className="grid grid-cols-1 lg:grid-cols-3 gap-12">/g, '<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">');
content = content.replace(/className="h-24 w-24 object-cover rounded-xl/g, 'className="h-20 w-20 object-cover rounded-xl');
content = content.replace(/className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700/g, 'className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-base hover:bg-blue-700');

fs.writeFileSync('src/pages/Cart.tsx', content);
