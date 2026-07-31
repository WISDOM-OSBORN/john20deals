import fs from 'fs';
let content = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');

content = content.replace(/<div className="grid grid-cols-2 gap-4">/g, '<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">');

fs.writeFileSync('src/pages/AdminDashboard.tsx', content);
