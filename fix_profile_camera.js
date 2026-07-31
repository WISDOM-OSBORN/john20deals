import fs from 'fs';
let content = fs.readFileSync('src/pages/Profile.tsx', 'utf8');

// I will remove the <Camera /> icon overlay from the Profile picture
content = content.replace(/            <div className="relative group">\n              <img src=\{user\.user_metadata\.avatar_url \|\| "https:\/\/ui-avatars\.com\/api\/\?name=User&background=random"\} alt="Profile" className="h-20 w-20 rounded-full object-cover shadow-md" \/>\n              <div className="absolute inset-0 bg-black\/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">\n                <Camera className="h-6 w-6 text-white" \/>\n              <\/div>\n            <\/div>/g, 
`            <div className="relative">
              <img src={user.user_metadata.avatar_url || "https://ui-avatars.com/api/?name=User&background=random"} alt="Profile" className="h-20 w-20 rounded-full object-cover shadow-md" />
            </div>`);

fs.writeFileSync('src/pages/Profile.tsx', content);
