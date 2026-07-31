import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf8');

// Remove multer import
content = content.replace(/import multer from "multer";\n/g, '');

fs.writeFileSync('server.ts', content);
