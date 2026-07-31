import fs from 'fs';
let content = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

// Add useNavigate import
content = content.replace(/import \{ Link, useLocation \} from 'react-router-dom';/g, "import { Link, useLocation, useNavigate } from 'react-router-dom';");

// Add state and navigate inside the component
content = content.replace(/  const \{ theme, setTheme, isDark \} = useTheme\(\);\n/g, 
`  const { theme, setTheme, isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(\`/shop?q=\$\{encodeURIComponent(searchQuery.trim())\}\`);
    }
  };
`);

// Wrap the input in a form
content = content.replace(/            <div className="relative">\n              <Search className="absolute left-3 top-1\/2 -translate-y-1\/2 h-4 w-4 text-slate-400" \/>\n              <input\n                type="text"\n                placeholder="Search\.\.\."\n                className="pl-9 pr-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 border-none text-sm focus:ring-2 focus:ring-blue-500 w-48 dark:text-white dark:placeholder-slate-400"\n              \/>\n            <\/div>/g, 
`            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 border-none text-sm focus:ring-2 focus:ring-blue-500 w-48 dark:text-white dark:placeholder-slate-400"
              />
            </form>`);

fs.writeFileSync('src/components/Navbar.tsx', content);
