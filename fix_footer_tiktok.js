import fs from 'fs';
let content = fs.readFileSync('src/components/Footer.tsx', 'utf8');

// Wait, I need to make sure Music (for Tiktok) or Video is imported from lucide-react if I want to use it.
// Or just let's check what icons are imported.
content = content.replace(/import \{ ([^}]+) \} from 'lucide-react';/, "import { $1, Music } from 'lucide-react';");

const newLinks = `              <a href="https://facebook.com/john20deals" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-slate-400 hover:text-blue-500 transition-colors">
                <Facebook className="h-5 w-5" />
                <span className="text-sm">John20 Deals</span>
              </a>
              <a href="https://tiktok.com/@john20deals" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-slate-400 hover:text-indigo-400 transition-colors">
                <Music className="h-5 w-5" />
                <span className="text-sm">@john20deals</span>
              </a>`;

content = content.replace(/<a href="https:\/\/facebook\.com\/john20deals"[\s\S]*?<\/a>/, newLinks);

fs.writeFileSync('src/components/Footer.tsx', content);
