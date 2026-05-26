import React from 'react';

export default function StatsStrip({ stats, onRefresh, refreshing }) {
  if (!stats) return null;

  const { byStatus = {}, byPriority = {}, slaBreachedOpen = 0 } = stats;

  return (
    <div className="stats-strip" role="region" aria-label="Ticket statistics">
      <div className="stat-card">
        <span className="stat-dot open" />
        <div className="stat-info">
          <span className="stat-value">{byStatus.open ?? 0}</span>
          <span className="stat-label">Open</span>
        </div>
      </div>

      <div className="stat-card">
        <span className="stat-dot progress" />
        <div className="stat-info">
          <span className="stat-value">{byStatus.in_progress ?? 0}</span>
          <span className="stat-label">In Progress</span>
        </div>
      </div>

      <div className="stat-card">
        <span className="stat-dot resolved" />
        <div className="stat-info">
          <span className="stat-value">{byStatus.resolved ?? 0}</span>
          <span className="stat-label">Resolved</span>
        </div>
      </div>

      <div className="stat-card">
        <span className="stat-dot closed" />
        <div className="stat-info">
          <span className="stat-value">{byStatus.closed ?? 0}</span>
          <span className="stat-label">Closed</span>
        </div>
      </div>

      <div className="stat-card breach">
        <span className="stat-dot breach" />
        <div className="stat-info">
          <span className="stat-value">{slaBreachedOpen}</span>
          <span className="stat-label">SLA Breached</span>
        </div>
      </div>

      <button
        className={`refresh-btn ${refreshing ? 'spinning' : ''}`}
        onClick={onRefresh}
        title="Refresh data"
        aria-label="Refresh ticket data"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="23 4 23 10 17 10" />
          <polyline points="1 20 1 14 7 14" />
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
        </svg>
        Refresh
      </button>
    </div>
  );
}
