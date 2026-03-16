import type { Framework, FrameworkCategory } from '../types';

interface Props {
  framework: Framework;
  isSelected: boolean;
  onClick: () => void;
}

const categoryLabels: Record<FrameworkCategory, string> = {
  frontend: 'Frontend',
  backend: 'Backend',
  fullstack: 'Full-Stack',
  bundler: 'Bundler / Build Tool',
};

export default function FrameworkCard({ framework, isSelected, onClick }: Props) {
  return (
    <button
      className={`framework-card${isSelected ? ' framework-card--selected' : ''}`}
      onClick={onClick}
      style={{ '--fw-color': framework.color } as React.CSSProperties}
      aria-pressed={isSelected}
    >
      <div className="framework-card__header">
        <span className="framework-card__dot" />
        <h3 className="framework-card__name">{framework.name}</h3>
        <span className="framework-card__category">
          {categoryLabels[framework.category]}
        </span>
      </div>
      <p className="framework-card__lang">{framework.language}</p>
      <p className="framework-card__desc">{framework.description.slice(0, 100)}…</p>
      <div className="framework-card__tags">
        {framework.tags.slice(0, 4).map((tag) => (
          <span key={tag} className="tag">
            {tag}
          </span>
        ))}
      </div>
    </button>
  );
}
