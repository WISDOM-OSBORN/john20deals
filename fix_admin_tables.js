import fs from 'fs';
let content = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');

// The best way is to wrap <table ...> up to </table> with <div className="overflow-x-auto">
// I'll do this by replacing `<table className="w-full text-left text-sm">` with `<div className="overflow-x-auto"><table className="w-full text-left text-sm">`
// but only for the first three tables. Since we removed Broadcast, there are fewer lines now.
// Let's use a simpler regex for the outer div.

content = content.replace(/<div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-md">\n          <table className="w-full text-left text-sm">/g, 
`<div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-md">
          <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">`);

// Close the div after the table.
content = content.replace(/          <\/table>\n        <\/div>/g, 
`          </table>
          </div>
        </div>`);

fs.writeFileSync('src/pages/AdminDashboard.tsx', content);
