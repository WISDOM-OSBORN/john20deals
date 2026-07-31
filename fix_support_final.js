import fs from 'fs';
let content = fs.readFileSync('src/pages/Support.tsx', 'utf8');

// [SP1] py-12 -> py-8 ; cards p-6 -> p-5
content = content.replace(/py-12/g, 'py-8');
content = content.replace(/p-6/g, 'p-5'); // Wait, check if there are other p-6

fs.writeFileSync('src/pages/Support.tsx', content);
