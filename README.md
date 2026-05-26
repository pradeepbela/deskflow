# DeskFlow — Support Ticket Triage Board

**Submitted by:** Pradeep Bela  
**Roll No:** 0827CS231182  

A full-stack MERN application for support ticket management with SLA tracking, status transition rules, and an interactive Kanban board.

---

## 🚀 Live Demo

- **Frontend:** `<your-netlify-url>`
- **Backend API:** `<your-render-url>`

---

## 🛠 Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Database  | MongoDB Atlas (free tier)         |
| Backend   | Node.js · Express · Mongoose      |
| Frontend  | React 18 · Vite · @dnd-kit        |
| Styling   | Vanilla CSS (dark mode, glassmorphism) |
| Deploy    | Render (API) · Netlify (frontend) |

---

## 📁 Project Structure

```
deskflow/
├── backend/
│   ├── src/
│   │   ├── models/Ticket.js        # Mongoose schema + transition validator
│   │   ├── routes/tickets.js       # All API endpoints
│   │   ├── utils/sla.js            # SLA targets + derived field computation
│   │   └── middleware/errorHandler.js
│   ├── src/app.js                  # Express app setup (CORS, routes)
│   ├── server.js                   # Entry point (MongoDB connect)
│   └── render.yaml                 # Render deployment config
└── frontend/
    ├── src/
    │   ├── api/tickets.js          # Fetch wrapper for all endpoints
    │   ├── hooks/useTickets.js     # Master state hook
    │   ├── components/
    │   │   ├── Board.jsx           # DnD context + column layout
    │   │   ├── Column.jsx          # Droppable status column
    │   │   ├── TicketCard.jsx      # Draggable ticket card
    │   │   ├── StatsStrip.jsx      # Aggregate stats bar
    │   │   ├── FilterBar.jsx       # Priority + SLA breach filters
    │   │   ├── CreateTicketModal.jsx # New ticket form
    │   │   └── Toast.jsx           # Toast notification system
    │   ├── App.jsx
    │   └── index.css               # Full design system
    └── netlify.toml
```

---

## ✨ Features

### Backend
- ✅ Full CRUD for tickets (`POST`, `GET`, `PATCH`, `DELETE`)
- ✅ `GET /tickets/stats` — per-status, per-priority, SLA breach counts
- ✅ **Status transition rules** enforced server-side (one step forward/backward only)
- ✅ **SLA breach detection** per priority: urgent=1h, high=4h, medium=24h, low=72h
- ✅ **Derived fields** computed at read time (`ageMinutes`, `slaBreached`)
- ✅ `resolvedAt` auto-set on → resolved, auto-cleared on ← in_progress
- ✅ `ageMinutes` freezes at resolution time for resolved/closed tickets
- ✅ Combined query filters: `?status`, `?priority`, `?breached=true`
- ✅ Input validation with descriptive 400 errors

### Frontend
- ✅ Kanban board with 4 status columns
- ✅ **Drag-and-drop** between columns (bonus) with snap-back on invalid moves
- ✅ Priority badges (color-coded: urgent/high/medium/low)
- ✅ SLA breach indicator (pulsing red border + badge)
- ✅ Age display (e.g. "3h 12m")
- ✅ Only valid transition buttons shown per card
- ✅ Stats strip auto-refreshes every 30s
- ✅ Priority filter + SLA breached toggle (combinable)
- ✅ Create ticket modal with inline field validation
- ✅ All updates without page reload
- ✅ Loading and error states throughout
- ✅ Toast notifications for actions

---

## 🔧 Local Development

### Prerequisites
- Node.js 18+
- MongoDB Atlas connection string (or local MongoDB)

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env and set MONGODB_URI
npm run dev
# API runs on http://localhost:5000
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
# .env already points to http://localhost:5000 via Vite proxy
npm run dev
# App runs on http://localhost:5173
```

---

## 🌐 Deployment

### Backend → Render

1. Push code to GitHub
2. Create a new **Web Service** on [render.com](https://render.com)
3. Connect your repo, set root directory to `backend/`
4. Set environment variables:
   - `MONGODB_URI` — your Atlas connection string
   - `FRONTEND_URL` — your Netlify URL (after frontend deploy)
5. Deploy

### Frontend → Netlify

1. Create a new site on [netlify.com](https://netlify.com)
2. Connect your repo, set base directory to `frontend/`
3. Set environment variable:
   - `VITE_API_URL` — your Render backend URL (e.g. `https://deskflow-api.onrender.com`)
4. Deploy

---

## 📡 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/tickets` | Create a ticket |
| `GET` | `/tickets` | List tickets (`?status`, `?priority`, `?breached=true`) |
| `GET` | `/tickets/stats` | Aggregate counts |
| `PATCH` | `/tickets/:id` | Update ticket / move status |
| `DELETE` | `/tickets/:id` | Delete ticket |

### Status Transition Rules
```
Forward  (one step): open → in_progress → resolved → closed
Backward (one step): in_progress → open, resolved → in_progress, closed → resolved
Skipping (e.g. open → resolved): ❌ REJECTED with 400
```

### SLA Targets
| Priority | Target |
|----------|--------|
| urgent   | 1 hour |
| high     | 4 hours |
| medium   | 24 hours |
| low      | 72 hours |

---

## 📝 Sample API Response

```json
{
  "_id": "65f...",
  "subject": "Cannot log in",
  "description": "Getting 401 on every login attempt",
  "customerEmail": "user@example.com",
  "priority": "high",
  "status": "in_progress",
  "createdAt": "2026-05-20T08:00:00.000Z",
  "resolvedAt": null,
  "ageMinutes": 312,
  "slaBreached": true
}
```
