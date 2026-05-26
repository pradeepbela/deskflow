const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');
const { computeDerivedFields, SLA_TARGETS } = require('../utils/sla');

// Helper: throw an app error
function appError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

// Helper: enrich a plain ticket object with derived fields
function enrich(ticket) {
  return computeDerivedFields(ticket);
}

// ─────────────────────────────────────────────
// GET /tickets/stats
// Must be defined BEFORE /:id routes
// ─────────────────────────────────────────────
router.get('/stats', async (req, res, next) => {
  try {
    const allTickets = await Ticket.find().lean();
    const enriched = allTickets.map(enrich);

    // Counts per status
    const byStatus = { open: 0, in_progress: 0, resolved: 0, closed: 0 };
    // Counts per priority
    const byPriority = { low: 0, medium: 0, high: 0, urgent: 0 };
    // SLA breached (open or in_progress tickets that are past target)
    let slaBreachedOpen = 0;

    for (const t of enriched) {
      byStatus[t.status] = (byStatus[t.status] || 0) + 1;
      byPriority[t.priority] = (byPriority[t.priority] || 0) + 1;
      if (t.slaBreached && (t.status === 'open' || t.status === 'in_progress')) {
        slaBreachedOpen++;
      }
    }

    res.json({ byStatus, byPriority, slaBreachedOpen });
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────
// POST /tickets — Create a ticket
// ─────────────────────────────────────────────
router.post('/', async (req, res, next) => {
  try {
    const { subject, description, customerEmail, priority } = req.body;

    const ticket = await Ticket.create({ subject, description, customerEmail, priority });
    res.status(201).json(enrich(ticket.toObject()));
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────
// GET /tickets — List tickets with optional filters
// ?status=open|in_progress|resolved|closed
// ?priority=low|medium|high|urgent
// ?breached=true
// ─────────────────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const { status, priority, breached } = req.query;
    const query = {};

    if (status) {
      const validStatuses = ['open', 'in_progress', 'resolved', 'closed'];
      if (!validStatuses.includes(status)) {
        return next(appError(400, `Invalid status filter. Must be one of: ${validStatuses.join(', ')}`));
      }
      query.status = status;
    }

    if (priority) {
      const validPriorities = ['low', 'medium', 'high', 'urgent'];
      if (!validPriorities.includes(priority)) {
        return next(appError(400, `Invalid priority filter. Must be one of: ${validPriorities.join(', ')}`));
      }
      query.priority = priority;
    }

    let tickets = await Ticket.find(query).sort({ createdAt: -1 }).lean();
    let enriched = tickets.map(enrich);

    // Apply breached filter AFTER enrichment (it's a derived field)
    if (breached === 'true') {
      enriched = enriched.filter((t) => t.slaBreached);
    }

    res.json(enriched);
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────
// GET /tickets/:id — Get a single ticket
// ─────────────────────────────────────────────
router.get('/:id', async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id).lean();
    if (!ticket) return next(appError(404, 'Ticket not found'));
    res.json(enrich(ticket));
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────
// PATCH /tickets/:id — Update ticket (status change + optional fields)
// ─────────────────────────────────────────────
router.patch('/:id', async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return next(appError(404, 'Ticket not found'));

    const { status, subject, description, customerEmail, priority } = req.body;

    // Handle status transition
    if (status && status !== ticket.status) {
      const { valid, message } = Ticket.validateTransition(ticket.status, status);
      if (!valid) return next(appError(400, message));

      // Set/clear resolvedAt based on transition
      if (status === 'resolved') {
        ticket.resolvedAt = new Date();
      } else if (ticket.status === 'resolved' && status === 'in_progress') {
        // Moving back from resolved — clear resolvedAt
        ticket.resolvedAt = null;
      }

      ticket.status = status;
    }

    // Update other fields if provided
    if (subject !== undefined) ticket.subject = subject;
    if (description !== undefined) ticket.description = description;
    if (customerEmail !== undefined) ticket.customerEmail = customerEmail;
    if (priority !== undefined) ticket.priority = priority;

    await ticket.save();
    res.json(enrich(ticket.toObject()));
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────
// DELETE /tickets/:id — Delete a ticket
// ─────────────────────────────────────────────
router.delete('/:id', async (req, res, next) => {
  try {
    const ticket = await Ticket.findByIdAndDelete(req.params.id);
    if (!ticket) return next(appError(404, 'Ticket not found'));
    res.json({ message: 'Ticket deleted successfully', id: req.params.id });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
