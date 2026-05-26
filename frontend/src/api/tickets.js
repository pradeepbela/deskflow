const BASE_URL = import.meta.env.VITE_API_URL || '';

async function request(path, options = {}) {
  const url = `${BASE_URL}/tickets${path}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });

  const data = await res.json().catch(() => ({ error: 'Invalid server response' }));

  if (!res.ok) {
    const err = new Error(data.error || `Request failed with status ${res.status}`);
    err.status = res.status;
    throw err;
  }

  return data;
}

export const ticketsApi = {
  /** Get all tickets with optional filters */
  list: ({ status, priority, breached } = {}) => {
    const params = new URLSearchParams();
    if (status)   params.set('status', status);
    if (priority) params.set('priority', priority);
    if (breached) params.set('breached', 'true');
    const qs = params.toString();
    return request(qs ? `?${qs}` : '');
  },

  /** Get aggregate stats */
  stats: () => request('/stats'),

  /** Create a new ticket */
  create: (body) =>
    request('', { method: 'POST', body: JSON.stringify(body) }),

  /** Update ticket (status transition or field update) */
  update: (id, body) =>
    request(`/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),

  /** Delete a ticket */
  remove: (id) =>
    request(`/${id}`, { method: 'DELETE' }),
};
