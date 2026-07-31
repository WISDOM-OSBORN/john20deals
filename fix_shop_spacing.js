import fs from 'fs';
let content = fs.readFileSync('src/pages/Shop.tsx', 'utf8');

content = content.replace(/<div className="py-8">/g, '<div className="py-6">');
content = content.replace(/<div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">/g, '<div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">');
content = content.replace(/<div className="mt-12 flex justify-center gap-2">/g, '<div className="mt-8 flex justify-center gap-2">');

fs.writeFileSync('src/pages/Shop.tsx', content);
