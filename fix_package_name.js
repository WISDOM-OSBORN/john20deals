import fs from 'fs';
let content = fs.readFileSync('package.json', 'utf8');

content = content.replace(/"name": "react-example"/g, '"name": "john20-deals"');

fs.writeFileSync('package.json', content);
