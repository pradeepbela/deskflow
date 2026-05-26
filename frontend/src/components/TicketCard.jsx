import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { formatAge, nextStatus, prevStatus } from '../hooks/useTickets';
import { showToast } from './Toast';

const PRIORITY_LABEL = { low: 'Low', medium: 'Medium', high: 'High', urgent: 'Urgent' };
const STATUS_LABEL = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
};

export default function TicketCard({ ticket, onMove, onDelete }) {
  const [moving, setMoving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const next = nextStatus(ticket.status);
  const prev = prevStatus(ticket.status);

  // dnd-kit sortable
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: ticket._id, data: { ticket } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleMove = async (newStatus) => {
    if (moving) return;
    setMoving(true);
    try {
      await onMove(ticket._id, newStatus);
      showToast(`Moved to ${STATUS_LABEL[newStatus]}`, 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setMoving(false);
    }
  };

  const handleDelete = async () => {
    if (deleting) return;
    if (!confirm(`Delete ticket "${ticket.subject}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await onDelete(ticket._id);
      showToast('Ticket deleted', 'success');
    } catch (err) {
      showToast(err.message, 'error');
      setDeleting(false);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={[
        'ticket-card',
        `priority-${ticket.priority}`,
        ticket.slaBreached ? 'sla-breached' : '',
        isDragging ? 'dragging' : '',
        moving ? 'moving' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label={`Ticket: ${ticket.subject}`}
      {...attributes}
      {...listeners}
    >
      {/* Header */}
      <div className="card-header">
        <span className="card-subject" title={ticket.subject}>
          {ticket.subject}
        </span>
        <button
          className="card-delete-btn"
          onClick={(e) => { e.stopPropagation(); handleDelete(); }}
          aria-label="Delete ticket"
          title="Delete ticket"
          disabled={deleting}
        >
          {deleting ? '…' : '✕'}
        </button>
      </div>

      {/* Meta row */}
      <div className="card-meta">
        <span className={`priority-badge badge-${ticket.priority}`}>
          {PRIORITY_LABEL[ticket.priority]}
        </span>

        <span className="card-age" title={`Created: ${new Date(ticket.createdAt).toLocaleString()}`}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
          </svg>
          {formatAge(ticket.ageMinutes)}
        </span>

        {ticket.slaBreached && (
          <span className="sla-badge" title="This ticket has exceeded its SLA response time target">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            SLA
          </span>
        )}
      </div>

      {/* Email */}
      <div className="card-email" title={ticket.customerEmail}>
        {ticket.customerEmail}
      </div>

      {/* Actions — only valid transitions */}
      {(prev || next) && (
        <div className="card-actions" onClick={(e) => e.stopPropagation()}>
          {prev && (
            <button
              className="action-btn backward"
              onClick={() => handleMove(prev)}
              disabled={moving}
              aria-label={`Move back to ${STATUS_LABEL[prev]}`}
              title={`← Move to ${STATUS_LABEL[prev]}`}
            >
              ← {STATUS_LABEL[prev]}
            </button>
          )}
          {next && (
            <button
              className="action-btn forward"
              onClick={() => handleMove(next)}
              disabled={moving}
              aria-label={`Move forward to ${STATUS_LABEL[next]}`}
              title={`Move to ${STATUS_LABEL[next]} →`}
            >
              {STATUS_LABEL[next]} →
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/** Lightweight clone rendered while dragging (no dnd listeners) */
export function TicketCardOverlay({ ticket }) {
  const next = nextStatus(ticket.status);
  const prev = prevStatus(ticket.status);

  return (
    <div
      className={[
        'ticket-card',
        `priority-${ticket.priority}`,
        ticket.slaBreached ? 'sla-breached' : '',
      ].filter(Boolean).join(' ')}
    >
      <div className="card-header">
        <span className="card-subject">{ticket.subject}</span>
      </div>
      <div className="card-meta">
        <span className={`priority-badge badge-${ticket.priority}`}>
          {PRIORITY_LABEL[ticket.priority]}
        </span>
        <span className="card-age">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
          </svg>
          {formatAge(ticket.ageMinutes)}
        </span>
        {ticket.slaBreached && <span className="sla-badge">⚠ SLA</span>}
      </div>
      <div className="card-email">{ticket.customerEmail}</div>
      {(prev || next) && (
        <div className="card-actions">
          {prev && <button className="action-btn backward" disabled>← {prev}</button>}
          {next && <button className="action-btn forward" disabled>{next} →</button>}
        </div>
      )}
    </div>
  );
}
