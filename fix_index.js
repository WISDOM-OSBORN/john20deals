import fs from 'fs';
let content = fs.readFileSync('index.html', 'utf8');

// Add inline script and meta tags
content = content.replace(/<head>/g, 
`<head>
    <script>
      (function() {
        try {
          var localTheme = localStorage.getItem('theme');
          var isDark = localTheme === 'dark' || (!localTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
          if (isDark) {
            document.documentElement.classList.add('dark');
            document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#0f172a');
          }
        } catch (e) {}
      })();
    </script>
    <meta name="theme-color" content="#ffffff" />
    <meta name="description" content="John20 Deals - High-quality laptops, smartphones, and accessories." />
    <meta property="og:title" content="John20 Deals" />
    <meta property="og:description" content="High-quality laptops, smartphones, and accessories." />`);

// Update title
content = content.replace(/<title>.*<\/title>/g, '<title>John20 Deals</title>');

fs.writeFileSync('index.html', content);
