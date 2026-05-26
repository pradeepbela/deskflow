import React, { useState } from 'react';
import { showToast } from './Toast';

const PRIORITIES = ['low', 'medium', 'high', 'urgent'];

const INITIAL = { subject: '', description: '', customerEmail: '', priority: '' };

function validate(form) {
  const errors = {};
  if (!form.subject.trim()) errors.subject = 'Subject is required';
  else if (form.subject.trim().length > 200) errors.subject = 'Subject cannot exceed 200 characters';

  if (!form.description.trim()) errors.description = 'Description is required';

  if (!form.customerEmail.trim()) {
    errors.customerEmail = 'Customer email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.customerEmail.trim())) {
    errors.customerEmail = 'Please enter a valid email address';
  }

  if (!form.priority) errors.priority = 'Priority is required';

  return errors;
}

export default function CreateTicketModal({ onClose, onCreate }) {
  const [form, setForm] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear field error on change
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    setServerError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    setServerError('');
    try {
      await onCreate({
        subject: form.subject.trim(),
        description: form.description.trim(),
        customerEmail: form.customerEmail.trim().toLowerCase(),
        priority: form.priority,
      });
      showToast('Ticket created successfully!', 'success');
      onClose();
    } catch (err) {
      setServerError(err.message || 'Failed to create ticket. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Close on overlay click
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="modal-overlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title" id="modal-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
            New Support Ticket
          </h2>
          <button
            className="modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <form className="form" onSubmit={handleSubmit} noValidate>
          {/* Subject */}
          <div className="form-group">
            <label className="form-label" htmlFor="ticket-subject">
              Subject <span className="required">*</span>
            </label>
            <input
              id="ticket-subject"
              name="subject"
              type="text"
              className={`form-input ${errors.subject ? 'error' : ''}`}
              placeholder="e.g. Cannot log in to dashboard"
              value={form.subject}
              onChange={handleChange}
              autoFocus
              maxLength={200}
            />
            {errors.subject && (
              <span className="form-error" role="alert">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {errors.subject}
              </span>
            )}
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label" htmlFor="ticket-description">
              Description <span className="required">*</span>
            </label>
            <textarea
              id="ticket-description"
              name="description"
              className={`form-textarea ${errors.description ? 'error' : ''}`}
              placeholder="Describe the issue in detail…"
              value={form.description}
              onChange={handleChange}
              rows={4}
            />
            {errors.description && (
              <span className="form-error" role="alert">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {errors.description}
              </span>
            )}
          </div>

          {/* Customer Email */}
          <div className="form-group">
            <label className="form-label" htmlFor="ticket-email">
              Customer Email <span className="required">*</span>
            </label>
            <input
              id="ticket-email"
              name="customerEmail"
              type="email"
              className={`form-input ${errors.customerEmail ? 'error' : ''}`}
              placeholder="customer@example.com"
              value={form.customerEmail}
              onChange={handleChange}
            />
            {errors.customerEmail && (
              <span className="form-error" role="alert">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {errors.customerEmail}
              </span>
            )}
          </div>

          {/* Priority */}
          <div className="form-group">
            <label className="form-label" htmlFor="ticket-priority">
              Priority <span className="required">*</span>
            </label>
            <select
              id="ticket-priority"
              name="priority"
              className={`form-select ${errors.priority ? 'error' : ''}`}
              value={form.priority}
              onChange={handleChange}
            >
              <option value="" className="form-option">Select priority…</option>
              {PRIORITIES.map((p) => (
                <option key={p} value={p} className="form-option">
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                  {p === 'urgent' ? ' — 1 hour SLA' :
                   p === 'high'   ? ' — 4 hour SLA' :
                   p === 'medium' ? ' — 24 hour SLA' :
                                    ' — 72 hour SLA'}
                </option>
              ))}
            </select>
            {errors.priority && (
              <span className="form-error" role="alert">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {errors.priority}
              </span>
            )}
          </div>

          {/* Server error */}
          {serverError && (
            <div className="error-banner" role="alert">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              {serverError}
            </div>
          )}

          <div className="form-footer">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              id="submit-ticket-btn"
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                  Creating…
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Create Ticket
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
