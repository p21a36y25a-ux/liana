import { useState } from 'react';
import type { Framework, FrameworkCategory } from '../types';
import FrameworkCard from './FrameworkCard';
import FrameworkDetail from './FrameworkDetail';

interface Props {
  frameworks: Framework[];
}

const CATEGORIES: { value: FrameworkCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'frontend', label: 'Frontend' },
  { value: 'backend', label: 'Backend' },
  { value: 'fullstack', label: 'Full-Stack' },
  { value: 'bundler', label: 'Bundler / Build Tool' },
];

export default function FrameworkList({ frameworks }: Props) {
  const [selected, setSelected] = useState<Framework | null>(null);
  const [filter, setFilter] = useState<FrameworkCategory | 'all'>('all');
  const [search, setSearch] = useState('');

  const visible = frameworks.filter((fw) => {
    const matchesCategory = filter === 'all' || fw.category === filter;
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      fw.name.toLowerCase().includes(q) ||
      fw.tags.some((t) => t.toLowerCase().includes(q));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="framework-list-wrapper">
      <div className="framework-list__controls">
        <input
          type="search"
          placeholder="Search frameworks or tags…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="framework-list__search"
          aria-label="Search frameworks"
        />
        <div className="framework-list__filters" role="group" aria-label="Filter by category">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              className={`filter-btn${filter === cat.value ? ' filter-btn--active' : ''}`}
              onClick={() => setFilter(cat.value)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="framework-list__count">
        Showing {visible.length} of {frameworks.length} frameworks
      </div>

      <div className="framework-grid">
        {visible.map((fw) => (
          <FrameworkCard
            key={fw.id}
            framework={fw}
            isSelected={selected?.id === fw.id}
            onClick={() => setSelected(selected?.id === fw.id ? null : fw)}
          />
        ))}
      </div>

      {selected && (
        <FrameworkDetail framework={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
