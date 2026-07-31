import fs from 'fs';
let content = fs.readFileSync('src/components/ProductCard.tsx', 'utf8');

content = content.replace(/className="absolute top-3 left-3"/g, 'className="absolute bottom-3 left-3"');

fs.writeFileSync('src/components/ProductCard.tsx', content);
