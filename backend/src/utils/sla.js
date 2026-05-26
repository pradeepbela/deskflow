// SLA response time targets in minutes
const SLA_TARGETS = {
  urgent: 60,      // 1 hour
  high: 240,       // 4 hours
  medium: 1440,    // 24 hours
  low: 4320,       // 72 hours
};

/**
 * Compute derived fields for a ticket document.
 * @param {Object} ticket - Plain ticket object (from .lean() or .toObject())
 * @returns {Object} ticket with ageMinutes and slaBreached added
 */
function computeDerivedFields(ticket) {
  const now = new Date();
  const createdAt = new Date(ticket.createdAt);
  const resolvedAt = ticket.resolvedAt ? new Date(ticket.resolvedAt) : null;
  const isResolved = ticket.status === 'resolved' || ticket.status === 'closed';

  // ageMinutes: use resolvedAt as end time if resolved/closed, else now
  const endTime = isResolved && resolvedAt ? resolvedAt : now;
  const ageMinutes = Math.floor((endTime - createdAt) / 60000);

  // slaBreached: true if age exceeds target AND ticket is not closed with SLA met
  const target = SLA_TARGETS[ticket.priority];
  let slaBreached = false;

  if (isResolved && resolvedAt) {
    // For resolved/closed: check if resolution happened after target
    const resolvedAge = Math.floor((resolvedAt - createdAt) / 60000);
    slaBreached = resolvedAge > target;
  } else {
    // For open/in_progress: check if current time exceeds target
    slaBreached = ageMinutes > target;
  }

  return {
    ...ticket,
    ageMinutes,
    slaBreached,
  };
}

/**
 * Format minutes as human-readable string e.g. "3h 12m"
 */
function formatAge(minutes) {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

module.exports = { SLA_TARGETS, computeDerivedFields, formatAge };
