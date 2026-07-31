import fs from 'fs';
let content = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');

// Remove broadcast state
content = content.replace(/  const \[broadcastMessage, setBroadcastMessage\] = useState\(''\);\n  const \[sendingBroadcast, setSendingBroadcast\] = useState\(false\);\n/g, '');

// Remove handleBroadcast and generateProductBroadcast
content = content.replace(/  const handleBroadcast = async \(\) => {[\s\S]*?  };\n\n  const generateProductBroadcast = \(product: Product\) => {[\s\S]*?  };\n\n/g, '');

// Rename the tab from Broadcast to Subscribers
content = content.replace(/          onClick=\{\(\) => setActiveTab\('newsletter'\)\}\n          className=\{`pb-3 px-1 font-medium text-sm transition-colors border-b-2 whitespace-nowrap \$\{\n            activeTab === 'newsletter' \? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'\n          \}`\}\n        >\n          Broadcast/g, 
`          onClick={() => setActiveTab('newsletter')}
          className={\`pb-3 px-1 font-medium text-sm transition-colors border-b-2 whitespace-nowrap \${
            activeTab === 'newsletter' ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
          }\`}
        >
          Subscribers`);

// Remove the product row broadcast button
content = content.replace(/                    <button \n                      onClick=\{\(\) => generateProductBroadcast\(product\)\}\n                      className="p-2 text-slate-400 dark:text-slate-500 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900\/30 rounded-xl transition-all"\n                      title="Broadcast this product"\n                    >\n                      <Send className="h-4 w-4" \/>\n                    <\/button>\n/g, '');

// Remove the right side broadcast panel
content = content.replace(/          <div className="lg:col-span-1">[\s\S]*?            <\/div>\n          <\/div>/g, '');

// Change the left side of subscribers to span full
content = content.replace(/<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">\n          <div className="lg:col-span-2">/g, 
`<div className="grid grid-cols-1 gap-8">\n          <div className="lg:col-span-1">`);

fs.writeFileSync('src/pages/AdminDashboard.tsx', content);
