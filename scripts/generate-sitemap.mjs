import 'dotenv/config';

const SITE = (process.env.SITE_URL || 'https://john20deals.com').replace(/\/$/, '');
const OUTPUT = 'dist/sitemap.xml';

const today = new Date().toISOString().slice(0, 10);

const staticRoutes = [
  { path: '/', changefreq: 'daily', priority: '1.0' },
  { path: '/shop', changefreq: 'daily', priority: '0.9' },
  { path: '/sell', changefreq: 'weekly', priority: '0.7' },
  { path: '/repair', changefreq: 'weekly', priority: '0.7' },
  { path: '/support', changefreq: 'monthly', priority: '0.6' },
  { path: '/privacy', changefreq: 'yearly', priority: '0.2' },
  { path: '/terms', changefreq: 'yearly', priority: '0.2' },
];

const xmlEscape = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

async function fetchProducts() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn('[sitemap] Supabase env vars missing; including static routes only.');
    return [];
  }

  const endpoint = `${supabaseUrl.replace(/\/$/, '')}/rest/v1/products?select=id,created_at&order=created_at.desc&limit=1000`;

  try {
    const res = await fetch(endpoint, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    });

    if (!res.ok) {
      console.warn(`[sitemap] products fetch failed (HTTP ${res.status}); including static routes only.`);
      return [];
    }

    const rows = await res.json();
    return Array.isArray(rows) ? rows : [];
  } catch (error) {
    console.warn(`[sitemap] products fetch error: ${error.message}; including static routes only.`);
    return [];
  }
}

async function main() {
  const products = await fetchProducts();

  const urls = [];

  for (const route of staticRoutes) {
    urls.push({
      loc: `${SITE}${route.path}`,
      lastmod: route.path === '/' ? today : undefined,
      changefreq: route.changefreq,
      priority: route.priority,
    });
  }

  for (const product of products) {
    if (!product?.id) continue;
    urls.push({
      loc: `${SITE}/product/${product.id}`,
      lastmod: (product.updated_at || product.created_at || today).slice(0, 10),
      changefreq: 'weekly',
      priority: '0.8',
    });
  }

  const body = urls
    .map((entry) => {
      const lastmod = entry.lastmod ? `<lastmod>${xmlEscape(entry.lastmod)}</lastmod>` : '';
      return `  <url>
    <loc>${xmlEscape(entry.loc)}</loc>${lastmod}
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;

  const { writeFileSync, mkdirSync } = await import('node:fs');
  mkdirSync('dist', { recursive: true });
  writeFileSync(OUTPUT, xml, 'utf8');

  console.log(`[sitemap] wrote ${OUTPUT} with ${urls.length} URLs (${products.length} products).`);
}

main();