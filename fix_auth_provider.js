import fs from 'fs';
let content = fs.readFileSync('src/context/AuthContext.tsx', 'utf8');

// Remove from provider value (second attempt)
content = content.replace(/       signInWithGoogle,\n       signInWithEmail,\n       signUpWithEmail,\n/g, '');

fs.writeFileSync('src/context/AuthContext.tsx', content);
