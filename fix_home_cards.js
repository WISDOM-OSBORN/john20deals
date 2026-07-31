import fs from 'fs';
let content = fs.readFileSync('src/pages/Home.tsx', 'utf8');

// Replace the Buy motion div
content = content.replace(/<motion\.div \n              animate=\{\{ y: \[0, -6, 0\] \}\}\n              transition=\{\{ repeat: Infinity, duration: 3, ease: "easeInOut" \}\}\n              className="bg-white\/90 backdrop-blur-sm dark:bg-slate-800\/90 p-6 rounded-2xl shadow-sm border border-slate-100\/50 dark:border-slate-700\/50 flex flex-col items-center text-center hover:scale-105 hover:-translate-y-2 transition-all duration-300 cursor-pointer"\n            >/g, 
`<Link 
              to="/shop"
              className="bg-white/90 backdrop-blur-sm dark:bg-slate-800/90 p-5 rounded-2xl shadow-sm border border-slate-100/50 dark:border-slate-700/50 flex flex-col items-center text-center hover:-translate-y-1 hover:shadow-md transition-all duration-300"
            >`);

// Sell motion div
content = content.replace(/<motion\.div \n              animate=\{\{ y: \[0, -6, 0\] \}\}\n              transition=\{\{ repeat: Infinity, duration: 3, ease: "easeInOut", delay: 0\.5 \}\}\n              className="bg-white\/90 backdrop-blur-sm dark:bg-slate-800\/90 p-6 rounded-2xl shadow-sm border border-slate-100\/50 dark:border-slate-700\/50 flex flex-col items-center text-center hover:scale-105 hover:-translate-y-2 transition-all duration-300 cursor-pointer"\n            >/g, 
`<Link 
              to="/support"
              className="bg-white/90 backdrop-blur-sm dark:bg-slate-800/90 p-5 rounded-2xl shadow-sm border border-slate-100/50 dark:border-slate-700/50 flex flex-col items-center text-center hover:-translate-y-1 hover:shadow-md transition-all duration-300"
            >`);

// Swap motion div
content = content.replace(/<motion\.div \n              animate=\{\{ y: \[0, -6, 0\] \}\}\n              transition=\{\{ repeat: Infinity, duration: 3, ease: "easeInOut", delay: 1 \}\}\n              className="bg-white\/90 backdrop-blur-sm dark:bg-slate-800\/90 p-6 rounded-2xl shadow-sm border border-slate-100\/50 dark:border-slate-700\/50 flex flex-col items-center text-center hover:scale-105 hover:-translate-y-2 transition-all duration-300 cursor-pointer"\n            >/g, 
`<Link 
              to="/shop"
              className="bg-white/90 backdrop-blur-sm dark:bg-slate-800/90 p-5 rounded-2xl shadow-sm border border-slate-100/50 dark:border-slate-700/50 flex flex-col items-center text-center hover:-translate-y-1 hover:shadow-md transition-all duration-300"
            >`);

// Repair motion div
content = content.replace(/<motion\.div \n              animate=\{\{ y: \[0, -6, 0\] \}\}\n              transition=\{\{ repeat: Infinity, duration: 3, ease: "easeInOut", delay: 1\.5 \}\}\n              className="bg-white\/90 backdrop-blur-sm dark:bg-slate-800\/90 p-6 rounded-2xl shadow-sm border border-slate-100\/50 dark:border-slate-700\/50 flex flex-col items-center text-center hover:scale-105 hover:-translate-y-2 transition-all duration-300 cursor-pointer"\n            >/g, 
`<Link 
              to="/support"
              className="bg-white/90 backdrop-blur-sm dark:bg-slate-800/90 p-5 rounded-2xl shadow-sm border border-slate-100/50 dark:border-slate-700/50 flex flex-col items-center text-center hover:-translate-y-1 hover:shadow-md transition-all duration-300"
            >`);

// Closing tags
content = content.replace(/<\/motion\.div>/g, '</Link>');

fs.writeFileSync('src/pages/Home.tsx', content);
