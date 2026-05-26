import React from 'react';

const PRIORITIES = ['low', 'medium', 'high', 'urgent'];

export default function FilterBar({ filters, onChange }) {
  const { priority, breached } = filters;

  const setPriority = (p) => onChange({ ...filters, priority: priority === p ? '' : p });
  const toggleBreached = () => onChange({ ...filters, breached: !breached });

  return (
    <div className="filter-bar" role="search" aria-label="Filter tickets">
      <span className="filter-label">Filter</span>

      <div className="filter-pills" role="group" aria-label="Filter by priority">
        <button
          id="filter-all"
          className={`pill ${!priority ? 'active' : ''}`}
          onClick={() => onChange({ ...filters, priority: '' })}
          aria-pressed={!priority}
        >
          All
        </button>
        {PRIORITIES.map((p) => (
          <button
            key={p}
            id={`filter-${p}`}
            className={`pill ${priority === p ? `active ${p}` : ''}`}
            onClick={() => setPriority(p)}
            aria-pressed={priority === p}
          >
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      <div className="filter-divider" aria-hidden="true" />

      <button
        id="filter-sla-breach"
        className={`toggle-breach ${breached ? 'active' : ''}`}
        onClick={toggleBreached}
        aria-pressed={breached}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        SLA Breached Only
      </button>
    </div>
  );
}
