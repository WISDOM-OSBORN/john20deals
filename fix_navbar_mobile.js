import fs from 'fs';
let content = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

// Remove Categories from navLinks
content = content.replace(/    \{ name: 'Shop', path: '\/shop' \},\n    \{ name: 'Categories', path: '\/shop' \}, \/\/ Simplified for now/g, 
"    { name: 'Shop', path: '/shop' },");

// Add Search and Wishlist to mobile menu
content = content.replace(/          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">\n            \{navLinks\.map/g,
`          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <div className="px-3 py-2">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 w-full rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-sm focus:ring-2 focus:ring-blue-500 dark:text-white dark:placeholder-slate-400"
                />
              </form>
            </div>
            {navLinks.map`);

content = content.replace(/            \{user \? \(/g, 
`            <Link
              to="/wishlist"
              className="flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-300 hover:text-pink-500 dark:hover:text-pink-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              onClick={() => setIsMenuOpen(false)}
            >
              <Heart className="h-5 w-5" /> Wishlist
            </Link>
            {user ? (`);

fs.writeFileSync('src/components/Navbar.tsx', content);
