import fs from 'fs';
let content = fs.readFileSync('src/pages/Home.tsx', 'utf8');

const regex = /      \} else \{\n        throw new Error\('No products found'\);\n      \}\n    \} catch \(error\) \{\n      console\.warn\('Using fallback products due to fetch error'\);\n      setFeaturedProducts\(\[\s+[\s\S]*?      \]\);\n    \}/;

content = content.replace(regex, 
`      } else {
        setFeaturedProducts([]);
      }
    } catch (error) {
      console.warn('Error fetching featured products:', error);
      setFeaturedProducts([]);
    }`);

fs.writeFileSync('src/pages/Home.tsx', content);
