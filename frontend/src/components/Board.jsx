import React, { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import Column from './Column';
import { TicketCardOverlay } from './TicketCard';
import { groupByStatus, nextStatus, prevStatus } from '../hooks/useTickets';
import { showToast } from './Toast';

const STATUSES = ['open', 'in_progress', 'resolved', 'closed'];
const STATUS_ORDER = { open: 0, in_progress: 1, resolved: 2, closed: 3 };

/** Check if a drag from one status column to another is valid (one step only) */
function isValidDrop(fromStatus, toStatus) {
  if (fromStatus === toStatus) return true;
  const diff = STATUS_ORDER[toStatus] - STATUS_ORDER[fromStatus];
  return diff === 1 || diff === -1;
}

export default function Board({ tickets, onMove, onDelete }) {
  const [activeTicket, setActiveTicket] = useState(null);
  const [overId, setOverId] = useState(null);

  const grouped = groupByStatus(tickets);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  function handleDragStart(event) {
    const { active } = event;
    const ticket = tickets.find((t) => t._id === active.id);
    setActiveTicket(ticket || null);
  }

  function handleDragOver(event) {
    const { over } = event;
    setOverId(over?.id ?? null);
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    setActiveTicket(null);
    setOverId(null);

    if (!over) return;

    const draggedTicket = tickets.find((t) => t._id === active.id);
    if (!draggedTicket) return;

    // Resolve drop target to a status column
    // over.id can be a column status string OR a ticket._id (dropped onto a card)
    let targetStatus = STATUSES.includes(over.id)
      ? over.id
      : tickets.find((t) => t._id === over.id)?.status;

    if (!targetStatus || targetStatus === draggedTicket.status) return;

    if (!isValidDrop(draggedTicket.status, targetStatus)) {
      showToast(
        `Can't move from "${draggedTicket.status.replace('_', ' ')}" to "${targetStatus.replace('_', ' ')}" — only one step allowed`,
        'error'
      );
      return;
    }

    onMove(draggedTicket._id, targetStatus).catch((err) => {
      showToast(err.message, 'error');
    });
  }

  // Determine the column being hovered and whether the drop is valid
  const getOverStatus = () => {
    if (!overId) return null;
    if (STATUSES.includes(overId)) return overId;
    return tickets.find((t) => t._id === overId)?.status ?? null;
  };
  const overColumnStatus = getOverStatus();

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="board" role="main" aria-label="Ticket board">
        {STATUSES.map((status) => (
          <Column
            key={status}
            status={status}
            tickets={grouped[status] || []}
            onMove={onMove}
            onDelete={onDelete}
            isOver={overColumnStatus === status && activeTicket?.status !== status}
            isOverInvalid={
              overColumnStatus === status &&
              activeTicket &&
              activeTicket.status !== status &&
              !isValidDrop(activeTicket.status, status)
            }
          />
        ))}
      </div>

      <DragOverlay>
        {activeTicket ? (
          <div className="drag-overlay">
            <TicketCardOverlay ticket={activeTicket} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
