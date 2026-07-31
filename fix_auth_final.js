import fs from 'fs';
let content = fs.readFileSync('src/context/AuthContext.tsx', 'utf8');

content = content.replace(/      signInWithGoogle, \n      signInWithEmail, \n      signUpWithEmail, \n/g, '');
content = content.replace(/       signInWithGoogle,\n       signInWithEmail,\n       signUpWithEmail,\n/g, '');
content = content.replace(/signInWithGoogle,\s+signInWithEmail,\s+signUpWithEmail,\s+/g, '');

fs.writeFileSync('src/context/AuthContext.tsx', content);
