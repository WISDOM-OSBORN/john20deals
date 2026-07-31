import fs from 'fs';
let content = fs.readFileSync('src/components/Layout.tsx', 'utf8');

content = content.replace(/export default function Layout\(\{ children \}: \{ children: ReactNode \}\) \{/, 
`export default function Layout({ children }: { children: ReactNode }) {
  const { isDark } = useTheme();`);

fs.writeFileSync('src/components/Layout.tsx', content);
