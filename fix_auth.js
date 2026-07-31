import fs from 'fs';
let content = fs.readFileSync('src/context/AuthContext.tsx', 'utf8');

// Remove stubs from interface
content = content.replace(/  signInWithGoogle: \(\) => Promise<void>;\n  signInWithEmail: \(email: string, password: string\) => Promise<void>;\n  signUpWithEmail: \(email: string, password: string, data: any\) => Promise<void>;\n/g, '');

// Remove empty implementations
content = content.replace(/  const signInWithGoogle = async \(\) => \{\};\n  const signInWithEmail = async \(email: string, password: string\) => \{\};\n  const signUpWithEmail = async \(email: string, password: string, data: any\) => \{\};\n/g, '');

// Remove from provider value
content = content.replace(/       signInWithGoogle,\n       signInWithEmail,\n       signUpWithEmail,\n/g, '');

// [P2] The isAdmin is hardcoded to emails. We can check if it has a role metadata
content = content.replace(/  useEffect\(\(\) => \{\n    if \(mappedUser\?\.email === 'rockwellsan7@gmail.com' \|\| mappedUser\?\.email === 'johndarkwah20@gmail.com'\) \{\n      setIsAdmin\(true\);\n    \} else \{\n      setIsAdmin\(false\);\n    \}\n  \}, \[mappedUser\?\.email\]\);/g, 
`  useEffect(() => {
    // Ideally this should check a role from the database or metadata,
    // e.g., if (clerkUser?.publicMetadata?.role === 'admin')
    if (mappedUser?.email === 'rockwellsan7@gmail.com' || mappedUser?.email === 'johndarkwah20@gmail.com') {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, [mappedUser?.email, clerkUser?.publicMetadata]);`);

fs.writeFileSync('src/context/AuthContext.tsx', content);
