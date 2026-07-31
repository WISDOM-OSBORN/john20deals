import fs from 'fs';
let content = fs.readFileSync('src/pages/Profile.tsx', 'utf8');

// Remove the scattered img tag
const badString = '<img src={user.user_metadata.avatar_url || "https://ui-avatars.com/api/?name=User&background=random"} alt="Profile" className="h-20 w-20 rounded-full object-cover shadow-md" />';
content = content.split(badString).join('');

fs.writeFileSync('src/pages/Profile.tsx', content);
