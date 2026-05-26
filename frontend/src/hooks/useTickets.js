import { useState, useEffect, useCallback, useRef } from 'react';
import { ticketsApi } from '../api/tickets';

const STATUS_ORDER = ['open', 'in_progress', 'resolved', 'closed'];

/** Returns the valid next forward status, or null */
export function nextStatus(current) {
  const idx = STATUS_ORDER.indexOf(current);
  return idx < STATUS_ORDER.length - 1 ? STATUS_ORDER[idx + 1] : null;
}

/** Returns the valid previous status, or null */
export function prevStatus(current) {
  const idx = STATUS_ORDER.indexOf(current);
  return idx > 0 ? STATUS_ORDER[idx - 1] : null;
}

/**
 * Master hook for ticket state management.
 * Handles fetching, creating, updating, deleting tickets and stats.
 */
export function useTickets(filters = {}) {
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  const fetchTickets = useCallback(async () => {
    try {
      setError(null);
      const data = await ticketsApi.list(filtersRef.current);
      setTickets(data);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const data = await ticketsApi.stats();
      setStats(data);
    } catch {
      // Stats failure is non-critical
    }
  }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchTickets(), fetchStats()]);
    setLoading(false);
  }, [fetchTickets, fetchStats]);

  // Initial load
  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Re-fetch when filters change (without resetting loading)
  useEffect(() => {
    fetchTickets();
  }, [filters.status, filters.priority, filters.breached, fetchTickets]);

  // Auto-refresh every 30s
  useEffect(() => {
    const id = setInterval(() => {
      fetchTickets();
      fetchStats();
    }, 30000);
    return () => clearInterval(id);
  }, [fetchTickets, fetchStats]);

  /** Create a ticket; on success push to local state */
  const createTicket = useCallback(async (body) => {
    const ticket = await ticketsApi.create(body);
    setTickets((prev) => [ticket, ...prev]);
    await fetchStats();
    return ticket;
  }, [fetchStats]);

  /** Move ticket to a new status */
  const moveTicket = useCallback(async (id, status) => {
    const updated = await ticketsApi.update(id, { status });
    setTickets((prev) =>
      prev.map((t) => (t._id === id ? updated : t))
    );
    await fetchStats();
    return updated;
  }, [fetchStats]);

  /** Delete a ticket */
  const deleteTicket = useCallback(async (id) => {
    await ticketsApi.remove(id);
    setTickets((prev) => prev.filter((t) => t._id !== id));
    await fetchStats();
  }, [fetchStats]);

  return {
    tickets,
    stats,
    loading,
    error,
    refresh: fetchAll,
    createTicket,
    moveTicket,
    deleteTicket,
  };
}

/** Format ageMinutes to human readable */
export function formatAge(minutes) {
  if (!minutes && minutes !== 0) return '—';
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

/** Group tickets by status */
export function groupByStatus(tickets) {
  return {
    open:        tickets.filter((t) => t.status === 'open'),
    in_progress: tickets.filter((t) => t.status === 'in_progress'),
    resolved:    tickets.filter((t) => t.status === 'resolved'),
    closed:      tickets.filter((t) => t.status === 'closed'),
  };
}
