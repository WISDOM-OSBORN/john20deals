import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface Crumb {
  name: string;
  to?: string;
}

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 mb-6 overflow-x-auto whitespace-nowrap">
      <Link to="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors shrink-0">
        Home
      </Link>
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <React.Fragment key={idx}>
            <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 dark:text-slate-600" />
            {!isLast && item.to ? (
              <Link to={item.to} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors shrink-0">
                {item.name}
              </Link>
            ) : (
              <span className="font-medium text-slate-800 dark:text-slate-200 shrink-0">{item.name}</span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
