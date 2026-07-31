import fs from 'fs';

let loginContent = fs.readFileSync('src/pages/Login.tsx', 'utf8');
loginContent = loginContent.replace(
  /import \{ SignIn \} from '@clerk\/clerk-react';/,
  "import { SignIn } from '@clerk/clerk-react';\nimport { dark } from '@clerk/themes';\nimport { useTheme } from '../context/ThemeContext';"
);
loginContent = loginContent.replace(
  /export default function Login\(\) \{/,
  "export default function Login() {\n  const { isDark } = useTheme();"
);
loginContent = loginContent.replace(
  /<SignIn path="\/login" routing="path" signUpUrl="\/signup" \/>/,
  '<SignIn path="/login" routing="path" signUpUrl="/signup" appearance={{ baseTheme: isDark ? dark : undefined }} />'
);
fs.writeFileSync('src/pages/Login.tsx', loginContent);

let signupContent = fs.readFileSync('src/pages/SignUp.tsx', 'utf8');
signupContent = signupContent.replace(
  /import \{ SignUp \} from '@clerk\/clerk-react';/,
  "import { SignUp } from '@clerk/clerk-react';\nimport { dark } from '@clerk/themes';\nimport { useTheme } from '../context/ThemeContext';"
);
signupContent = signupContent.replace(
  /export default function SignUpPage\(\) \{/,
  "export default function SignUpPage() {\n  const { isDark } = useTheme();"
);
signupContent = signupContent.replace(
  /<SignUp path="\/signup" routing="path" signInUrl="\/login" \/>/,
  '<SignUp path="/signup" routing="path" signInUrl="/login" appearance={{ baseTheme: isDark ? dark : undefined }} />'
);
fs.writeFileSync('src/pages/SignUp.tsx', signupContent);
