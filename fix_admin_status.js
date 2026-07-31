import fs from 'fs';
let content = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');

content = content.replace(/      case 'pending':\n        return 'bg-yellow-100 text-yellow-700 border-yellow-200';\n      case 'paid':\n        return 'bg-blue-100 text-blue-700 border-blue-200';\n      case 'delivered':\n        return 'bg-green-100 text-green-700 border-green-200';\n      case 'cancelled':\n        return 'bg-red-100 text-red-700 border-red-200';\n      default:\n        return 'bg-slate-100 text-slate-700 border-slate-200';/g,
`      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-400 dark:border-yellow-800/50';
      case 'paid':
        return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/50 dark:text-blue-400 dark:border-blue-800/50';
      case 'delivered':
        return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/50 dark:text-green-400 dark:border-green-800/50';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/50 dark:text-red-400 dark:border-red-800/50';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';`);

fs.writeFileSync('src/pages/AdminDashboard.tsx', content);
