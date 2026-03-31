# Event Support Dashboard

A React dashboard for your event support team — built from your `Event_.xlsx` data.

## Tech Stack
- React 18
- Recharts (bar charts)
- CSS Modules (scoped styles)
- Google Fonts: Plus Jakarta Sans + JetBrains Mono

## Setup & Run

### Prerequisites
- Node.js 16+ installed ([download](https://nodejs.org))

### Steps

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm start
```

The app opens at **http://localhost:3000**

## Project Structure

```
src/
├── data/
│   └── teamData.js       ← All team data (edit this to update)
├── components/
│   ├── Dashboard.jsx     ← Main team overview page
│   ├── Dashboard.module.css
│   ├── Profile.jsx       ← Individual member profile page
│   └── Profile.module.css
├── App.js                ← Page routing (Dashboard ↔ Profile)
├── index.js              ← React entry point
└── index.css             ← Global styles & CSS variables
```

## How to Update Data

Edit `src/data/teamData.js` and replace the `TEAM_DATA` object
with fresh values from your Google Sheet or updated Excel file.

Each staff member entry follows this shape:

```js
StaffName: {
  total_events: 31,
  primary_count: 27,
  secondary_count: 4,
  total_hours: 134.8,
  total_attendees: 1368,
  by_month: { Jan: 10, Feb: 14, Mar: 7 },
  by_status: { Completed: 26, Upcoming: 5 },
  by_type: { Hybrid: 28, Virtual: 2, "In-Room": 1 },
  events: [
    {
      month: "Jan",
      date: "2026-01-05",
      event: "Event Name",
      status: "Completed",        // Completed | Upcoming | Cancelled
      duration: 6.5,              // hours
      type: "Hybrid",             // Hybrid | Virtual | In-Room
      room: "BAN-06-06 Design Studio",
      attendees: 48,
      role: "Primary",            // Primary | Secondary
    },
    // ...
  ],
}
```

## Build for Production

```bash
npm run build
```

Output goes to the `build/` folder — deploy anywhere (Netlify, Vercel, S3, etc).
