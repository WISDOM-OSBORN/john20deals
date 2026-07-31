import fs from 'fs';
let content = fs.readFileSync('src/components/Footer.tsx', 'utf8');

content = content.replace(/pt-16/g, 'pt-10');
content = content.replace(/gap-12 mb-12/g, 'gap-8 mb-10');

fs.writeFileSync('src/components/Footer.tsx', content);
