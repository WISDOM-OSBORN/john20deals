import fs from 'fs';
let content = fs.readFileSync('src/components/Layout.tsx', 'utf8');

content = content.replace(/import \{ Toaster \} from 'react-hot-toast';/g, 
"import { Toaster } from 'react-hot-toast';\nimport { useTheme } from '../context/ThemeContext';");

content = content.replace(/export default function Layout\(\) \{/g, 
"export default function Layout() {\n  const { isDark } = useTheme();");

content = content.replace(/      <Toaster position="top-center" \/>/g, 
`      <Toaster 
        position="top-center" 
        toastOptions={{
          style: isDark ? {
            background: '#1e293b',
            color: '#fff',
            border: '1px solid #334155'
          } : undefined
        }}
      />`);

fs.writeFileSync('src/components/Layout.tsx', content);
