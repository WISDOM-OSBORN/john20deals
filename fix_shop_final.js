import fs from 'fs';
let content = fs.readFileSync('src/pages/Shop.tsx', 'utf8');

// [S1] py-8 -> py-6
content = content.replace(/className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"/g, 'className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"');

// [S6] Pagination mt-12 -> mt-8
content = content.replace(/className="mt-12 flex justify-center items-center gap-2"/g, 'className="mt-8 flex justify-center items-center gap-2"');

// Add categoryCounts state and fetch
if (!content.includes('categoryCounts')) {
  content = content.replace(/const \[loading, setLoading\] = useState\(true\);/g, `const [loading, setLoading] = useState(true);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchCounts = async () => {
      const { data } = await supabase.from('products').select('category');
      if (data) {
        const counts: Record<string, number> = { All: data.length };
        data.forEach(p => {
          counts[p.category] = (counts[p.category] || 0) + 1;
        });
        setCategoryCounts(counts);
      }
    };
    fetchCounts();
  }, []);`);
}

// Add counts to sidebar buttons
content = content.replace(/{cat}\n                <\/button>/g, `{cat} {categoryCounts[cat] !== undefined && <span className="ml-auto text-xs bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-full">{categoryCounts[cat]}</span>}
                </button>`);

// Also change flex to flex + items-center + justify-between so span aligns right
content = content.replace(/className={\`w-full text-left px-3 py-2/g, 'className={`w-full flex items-center justify-between text-left px-3 py-2');

fs.writeFileSync('src/pages/Shop.tsx', content);
