import fs from 'fs';
let content = fs.readFileSync('src/pages/Profile.tsx', 'utf8');

content = content.replace(/<div className="py-12">/g, '<div className="py-8">');
content = content.replace(/<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">/g, '<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">');
content = content.replace(/<div className="bg-slate-50 dark:bg-slate-800\/50 p-8 flex flex-col items-center border-b border-slate-100 dark:border-slate-800">/g, 
'<div className="bg-slate-50 dark:bg-slate-800/50 p-6 flex flex-col items-center border-b border-slate-100 dark:border-slate-800">');
content = content.replace(/<div className="p-8 space-y-6">/g, '<div className="p-6 space-y-6">');
content = content.replace(/<img src=\{user\.user_metadata\.avatar_url || 'https:\/\/via\.placeholder\.com\/150'\} alt="Profile" className="h-24 w-24 rounded-full object-cover shadow-md" \/>/g, 
'<img src={user.user_metadata.avatar_url || "https://ui-avatars.com/api/?name=User&background=random"} alt="Profile" className="h-20 w-20 rounded-full object-cover shadow-md" />');

fs.writeFileSync('src/pages/Profile.tsx', content);
