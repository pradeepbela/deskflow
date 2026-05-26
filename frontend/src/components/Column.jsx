import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import TicketCard from './TicketCard';

const COLUMN_META = {
  open:        { label: 'Open',        cls: 'col-open' },
  in_progress: { label: 'In Progress', cls: 'col-progress' },
  resolved:    { label: 'Resolved',    cls: 'col-resolved' },
  closed:      { label: 'Closed',      cls: 'col-closed' },
};

export default function Column({ status, tickets, onMove, onDelete, isOver, isOverInvalid }) {
  const meta = COLUMN_META[status];
  const { setNodeRef } = useDroppable({ id: status });

  const columnClass = [
    'column',
    meta.cls,
    isOver && !isOverInvalid ? 'drag-over' : '',
    isOverInvalid ? 'drag-over-invalid' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={columnClass} ref={setNodeRef} aria-label={`${meta.label} column`}>
      <div className="column-header">
        <div className="column-title-row">
          <span className="column-dot" aria-hidden="true" />
          <span className="column-name">{meta.label}</span>
        </div>
        <span className="column-count" aria-label={`${tickets.length} tickets`}>
          {tickets.length}
        </span>
      </div>

      <div className="column-body">
        <SortableContext
          items={tickets.map((t) => t._id)}
          strategy={verticalListSortingStrategy}
        >
          {tickets.length === 0 ? (
            <div className="column-empty">
              <span className="column-empty-icon">
                {status === 'open' ? '📭' : status === 'in_progress' ? '⚙️' : status === 'resolved' ? '✅' : '🔒'}
              </span>
              <span>No {meta.label.toLowerCase()} tickets</span>
            </div>
          ) : (
            tickets.map((ticket) => (
              <TicketCard
                key={ticket._id}
                ticket={ticket}
                onMove={onMove}
                onDelete={onDelete}
              />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  );
}
