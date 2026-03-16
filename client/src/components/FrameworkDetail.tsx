import type { Framework } from '../types';

interface Props {
  framework: Framework;
  onClose: () => void;
}

export default function FrameworkDetail({ framework, onClose }: Props) {
  return (
    <aside className="framework-detail" style={{ '--fw-color': framework.color } as React.CSSProperties}>
      <div className="framework-detail__bar" />
      <button className="framework-detail__close" onClick={onClose} aria-label="Close">
        ✕
      </button>
      <h2 className="framework-detail__name">{framework.name}</h2>
      <p className="framework-detail__lang">
        <strong>Language:</strong> {framework.language}
      </p>
      <p className="framework-detail__category">
        <strong>Category:</strong> {framework.category}
      </p>
      <p className="framework-detail__desc">{framework.description}</p>

      <h4>Use Cases</h4>
      <ul className="framework-detail__usecases">
        {framework.useCases.map((uc) => (
          <li key={uc}>{uc}</li>
        ))}
      </ul>

      <h4>Tags</h4>
      <div className="framework-detail__tags">
        {framework.tags.map((tag) => (
          <span key={tag} className="tag">
            {tag}
          </span>
        ))}
      </div>

      <a
        href={framework.officialSite}
        target="_blank"
        rel="noopener noreferrer"
        className="framework-detail__link"
      >
        Official Website ↗
      </a>
    </aside>
  );
}
