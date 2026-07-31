import fs from 'fs';
let content = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');
content = content.replace(
  /<select \n                      name="condition" \n                      defaultValue=\{currentProduct\?\.condition \|\| 'New'\} \n                      className="w-full pl-10 pr-4 py-3 rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500\/20 focus:border-blue-500 transition-all appearance-none"\n                    >\n                      <option value="New">New<\/option>\n                      <option value="Open Box">Open Box<\/option>\n                      <option value="Refurbished">Refurbished<\/option>\n                      <option value="Used - \(UK USED\)">Used - \(UK USED\)<\/option>\n                    <\/select>\n                  <\/div>\n                <\/div>\n              <\/div>/,
  `<select 
                      name="condition" 
                      defaultValue={currentProduct?.condition || 'New'} 
                      className="w-full pl-10 pr-4 py-3 rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none"
                    >
                      <option value="New">New</option>
                      <option value="Open Box">Open Box</option>
                      <option value="Refurbished">Refurbished</option>
                      <option value="Used - (UK USED)">Used - (UK USED)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <input
                  type="checkbox"
                  name="swap_allowed"
                  id="swap_allowed"
                  defaultChecked={currentProduct ? currentProduct.swap_allowed !== false : true}
                  className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                />
                <div>
                  <label htmlFor="swap_allowed" className="text-sm font-bold text-slate-900 dark:text-white block">
                    Allow Swaps
                  </label>
                  <p className="text-xs text-slate-500 dark:text-slate-400">If checked, customers can propose to trade in items for this product.</p>
                </div>
              </div>`
);
fs.writeFileSync('src/pages/AdminDashboard.tsx', content);
