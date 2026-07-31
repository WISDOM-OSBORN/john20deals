import fs from 'fs';
let content = fs.readFileSync('src/pages/Profile.tsx', 'utf8');

// The camera overlay:
// {isEditing && (
//   <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
//     <Camera className="h-6 w-6 text-white" />
//   </div>
// )}

content = content.replace(/                \{isEditing && \(\n                  <div className="absolute inset-0 bg-black\/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">\n                    <Camera className="h-6 w-6 text-white" \/>\n                  <\/div>\n                \)\}/g, '');

fs.writeFileSync('src/pages/Profile.tsx', content);
