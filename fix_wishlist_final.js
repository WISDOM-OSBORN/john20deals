import fs from 'fs';
let content = fs.readFileSync('src/pages/Wishlist.tsx', 'utf8');

// [W1] py-12 -> py-8 (container)
content = content.replace(/className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"/g, 'className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"');

// [W2] Empty state py-20 -> py-12 (Wait, it says py-12 in grep above, let's just make sure)
content = content.replace(/py-20/g, 'py-12'); 

// [W3] Icon w-20 h-20 -> w-16 h-16
content = content.replace(/w-20 h-20/g, 'w-16 h-16');

// [W4] CTA px-8 py-4 -> px-6 py-3
content = content.replace(/px-8 py-4/g, 'px-6 py-3');

fs.writeFileSync('src/pages/Wishlist.tsx', content);
