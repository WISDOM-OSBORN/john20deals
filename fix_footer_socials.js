import fs from 'fs';
let content = fs.readFileSync('src/components/Footer.tsx', 'utf8');

content = content.replace(/import \{ Laptop, Mail, Phone, MapPin, Send, Ghost \} from 'lucide-react';/g, 
"import { Laptop, Mail, Phone, MapPin, Send, Ghost, Facebook, Instagram, MessageCircle } from 'lucide-react';");

content = content.replace(/            <div className="flex gap-4">\n              <a href="https:\/\/snapchat\.com\/add\/john_darkwah20" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-slate-400 hover:text-yellow-400 transition-colors">\n                <Ghost className="h-5 w-5" \/>\n                <span className="text-sm">john_darkwah20<\/span>\n              <\/a>\n            <\/div>/g, 
`            <div className="flex flex-col gap-3">
              <a href="https://snapchat.com/add/john_darkwah20" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-slate-400 hover:text-yellow-400 transition-colors">
                <Ghost className="h-5 w-5" />
                <span className="text-sm">john_darkwah20</span>
              </a>
              <a href="https://wa.me/+233505694171" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-slate-400 hover:text-green-400 transition-colors">
                <MessageCircle className="h-5 w-5" />
                <span className="text-sm">WhatsApp</span>
              </a>
              <a href="https://instagram.com/john20deals" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-slate-400 hover:text-pink-500 transition-colors">
                <Instagram className="h-5 w-5" />
                <span className="text-sm">john20deals</span>
              </a>
              <a href="https://facebook.com/john20deals" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-slate-400 hover:text-blue-500 transition-colors">
                <Facebook className="h-5 w-5" />
                <span className="text-sm">John20 Deals</span>
              </a>
            </div>`);

fs.writeFileSync('src/components/Footer.tsx', content);
