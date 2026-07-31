import fs from 'fs';

// Fix Layout.tsx
let layoutContent = fs.readFileSync('src/components/Layout.tsx', 'utf8');
if (!layoutContent.includes('const { isDark }')) {
  layoutContent = layoutContent.replace(/export default function Layout\(\{ children \}: \{ children: React\.ReactNode \}\) \{/g, 
  "export default function Layout({ children }: { children: React.ReactNode }) {\n  const { isDark } = useTheme();");
}
fs.writeFileSync('src/components/Layout.tsx', layoutContent);

// Fix Navbar.tsx
let navbarContent = fs.readFileSync('src/components/Navbar.tsx', 'utf8');
if (!navbarContent.includes('import React')) {
  navbarContent = "import React, { useState } from 'react';\n" + navbarContent.replace(/import \{ useState \} from 'react';\n/, '');
}
fs.writeFileSync('src/components/Navbar.tsx', navbarContent);

// Fix AuthContext.tsx
let authContent = fs.readFileSync('src/context/AuthContext.tsx', 'utf8');
authContent = authContent.replace(/       signInWithGoogle,\n       signInWithEmail,\n       signUpWithEmail,\n/g, '');
fs.writeFileSync('src/context/AuthContext.tsx', authContent);
