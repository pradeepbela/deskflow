import React, { useState } from 'react';
import './index.css';
import { useTickets } from './hooks/useTickets';
import Board from './components/Board';
import StatsStrip from './components/StatsStrip';
import FilterBar from './components/FilterBar';
import CreateTicketModal from './components/CreateTicketModal';
import { ToastContainer } from './components/Toast';

export default function App() {
  const [filters, setFilters] = useState({ priority: '', breached: false });
  const [showModal, setShowModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const {
    tickets,
    stats,
    loading,
    error,
    refresh,
    createTicket,
    moveTicket,
    deleteTicket,
  } = useTickets(filters);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  return (
    <div className="app">
      {/* ── Header ── */}
      <header className="header">
        <div className="header-left">
          <div className="header-logo" aria-hidden="true">🎯</div>
          <div>
            <div className="header-title">DeskFlow</div>
            <div className="header-subtitle">Support Ticket Triage Board</div>
          </div>
        </div>

        <div className="header-actions">
          <button
            id="new-ticket-btn"
            className="btn btn-primary"
            onClick={() => setShowModal(true)}
            aria-label="Create new ticket"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Ticket
          </button>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="main-content">
        {/* Stats */}
        <StatsStrip
          stats={stats}
          onRefresh={handleRefresh}
          refreshing={refreshing}
        />

        {/* Filters */}
        <FilterBar filters={filters} onChange={setFilters} />

        {/* Error banner */}
        {error && (
          <div className="error-banner" role="alert">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            {error} —{' '}
            <button
              onClick={handleRefresh}
              style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', textDecoration: 'underline', font: 'inherit' }}
            >
              retry
            </button>
          </div>
        )}

        {/* Board */}
        {loading ? (
          <div className="loading-screen" role="status" aria-label="Loading tickets">
            <div className="spinner" />
            <span>Loading tickets…</span>
          </div>
        ) : (
          <Board
            tickets={tickets}
            onMove={moveTicket}
            onDelete={deleteTicket}
          />
        )}
      </main>

      {/* ── Modal ── */}
      {showModal && (
        <CreateTicketModal
          onClose={() => setShowModal(false)}
          onCreate={createTicket}
        />
      )}

      {/* ── Toasts ── */}
      <ToastContainer />
    </div>
  );
}
