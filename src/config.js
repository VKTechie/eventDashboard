/**
 * ═══════════════════════════════════════════════════════════
 *  STEP 1 OF 1 — Paste your Google Sheet URL below
 * ═══════════════════════════════════════════════════════════
 *
 *  HOW TO GET THE URL:
 *
 *  1. Open your Google Sheet in the browser
 *  2. Click  File  →  Share  →  Publish to web
 *  3. Left  dropdown  → choose your sheet tab  (e.g. "Sheet1")
 *  4. Right dropdown  → choose  "Comma-separated values (.csv)"
 *  5. Click the blue  "Publish"  button  →  Yes
 *  6. Copy the URL that appears
 *  7. Paste it between the quotes on the line below
 *  8. Save this file  →  the dashboard will reload with live data
 *
 *  The URL looks like:
 *  https://docs.google.com/spreadsheets/d/XXXXXXX/pub?gid=0&single=true&output=csv
 *
 *  Leave it empty ("") to use the saved offline data instead.
 * ═══════════════════════════════════════════════════════════
 */

export const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRSH-wcMgd-PwUpO1kAHjwCHpp9t2umXnAu-u-3blDdC9z9FAH9ZFRhEzYHkdXRj-zuPfd-FCdGE4zy/pub?output=csv";   // ← paste your URL here

/**
 *  YOUR SHEET COLUMN HEADERS (Row 1) should include:
 *
 *  Month | Date | Start Time | End Time | Duration | Event Name
 *  Meeting Type | Primary Support | Secondary Support
 *  Room name | Status | Total Attendees
 *
 *  Exact spelling / order doesn't matter — the app matches them flexibly.
 */
