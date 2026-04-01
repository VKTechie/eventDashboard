/*
Author: Vishnukarthick K
Description: This file contains the logic to fetch and process data from a Google Sheet published as a CSV. It includes functions to parse the CSV, match columns flexibly, normalize date and time formats, and transform the raw rows into a structured format grouped by staff members. It also implements caching to avoid unnecessary network requests.
*/

import { SHEET_CSV_URL } from "../config";

/* ================= CSV PARSER ================= */
function parseCSV(text) {
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim().split("\n");
  if (lines.length < 2) throw new Error("Sheet appears empty.");

  const rawHeaders = splitLine(lines[0]);

  // Handle duplicate headers — keep FIRST occurrence only by index
  const headersSeen = {};
  const headers = rawHeaders.map((h, i) => {
    const clean = (h || "").trim() || `col_${i}`;
    if (headersSeen[clean.toLowerCase()] !== undefined) {
      return `__dup_${i}`; // mark duplicates so we can ignore them
    }
    headersSeen[clean.toLowerCase()] = i;
    return clean;
  });

  console.log("[Sheet] Headers:", headers.filter(h => !h.startsWith("__dup")));

  const rows = lines.slice(1).map((line) => {
    const values = splitLine(line);
    const row = {};
    headers.forEach((h, i) => {
      if (!h.startsWith("__dup")) {
        row[h] = (values[i] || "").trim();
      }
    });
    return row;
  }).filter((row) => Object.values(row).some((v) => v !== ""));

  console.log("[Sheet] Total rows:", rows.length);
  if (rows[0]) console.log("[Sheet] Sample row:", JSON.stringify(rows[0]));
  return rows;
}

function splitLine(line) {
  const out = [];
  let cur = "";
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') { inQ = !inQ; continue; }
    if (c === "," && !inQ) { out.push(cur); cur = ""; continue; }
    cur += c;
  }
  out.push(cur);
  return out;
}

/* ================= COLUMN MATCHING ================= */
function clean(s) {
  return s.toLowerCase().replace(/[^a-z]/g, "");
}

function findCol(row, ...aliases) {
  const keys = Object.keys(row);
  // Exact clean match first
  for (const a of aliases) {
    const ca = clean(a);
    const found = keys.find((k) => clean(k) === ca);
    if (found !== undefined) return row[found] || "";
  }
  // Partial match
  for (const a of aliases) {
    const ca = clean(a);
    const found = keys.find((k) => {
      const ck = clean(k);
      return ck.includes(ca) || ca.includes(ck);
    });
    if (found !== undefined) return row[found] || "";
  }
  return "";
}

/* ================= NORMALIZERS ================= */
const MONTH_MAP = {
  jan:"Jan", feb:"Feb", mar:"Mar", apr:"Apr", may:"May",
  jun:"Jun", jul:"Jul", aug:"Aug", sep:"Sep", oct:"Oct",
  nov:"Nov", dec:"Dec",
};

function normaliseMonth(raw) {
  if (!raw) return null;
  const key = raw.trim().toLowerCase().replace(/[^a-z]/g, "").slice(0, 3);
  return MONTH_MAP[key] || null;
}

function normaliseDate(raw) {
  if (!raw) return "";
  const s = raw.trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  // DD-Month-YYYY e.g. "05-January-2026"
  const monthNames = {jan:1,feb:2,mar:3,apr:4,may:5,jun:6,jul:7,aug:8,sep:9,oct:10,nov:11,dec:12};
  const m2 = s.match(/^(\d{1,2})[-\/\s]([A-Za-z]+)[-\/\s](\d{4})$/);
  if (m2) {
    const mn = monthNames[m2[2].toLowerCase().slice(0,3)];
    if (mn) return `${m2[3]}-${String(mn).padStart(2,"0")}-${m2[1].padStart(2,"0")}`;
  }
  const m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
  if (m) {
    const [, d, mo, y] = m;
    const year = y.length === 2 ? "20" + y : y;
    return `${year}-${mo.padStart(2,"0")}-${d.padStart(2,"0")}`;
  }
  return s;
}

function parseDuration(startRaw, endRaw) {
  const toMins = (t) => {
    if (!t) return null;
    const str = t.toUpperCase().trim();
    const isPM = str.includes("PM");
    const isAM = str.includes("AM");
    const clean = str.replace(/[AP]M/g, "").trim();
    const [hRaw, mRaw] = clean.split(":");
    let h = parseInt(hRaw, 10);
    const m = parseInt(mRaw || "0", 10);
    if (isPM && h !== 12) h += 12;
    if (isAM && h === 12) h = 0;
    return h * 60 + m;
  };
  const s = toMins(startRaw);
  const e = toMins(endRaw);
  if (s == null || e == null || isNaN(s) || isNaN(e)) return 0;
  const diff = (e - s) / 60;
  return diff > 0 ? Math.round(diff * 100) / 100 : 0;
}

/* ================= TRANSFORM ================= */
function transformRows(rows) {
  const staffMap = {};
  let skipped = 0;

  rows.forEach((row, idx) => {
    const month = normaliseMonth(findCol(row, "Month"));
    if (!month) { skipped++; return; }

    const rawStatus = findCol(row, "Status").trim();
    if (!rawStatus) { skipped++; return; }
    const statusNorm = rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1).toLowerCase();
    const status = ["Completed","Upcoming","Cancelled"].includes(statusNorm) ? statusNorm : rawStatus;

    const primaryRaw   = findCol(row, "Primary Support");
    const secondaryRaw = findCol(row, "Secondary Support");

    if (idx < 3) {
      console.log(`[Row ${idx+2}] month="${month}" status="${status}" primary="${primaryRaw}" secondary="${secondaryRaw}"`);
    }

    if (!primaryRaw && !secondaryRaw) { skipped++; return; }

    const eventName   = findCol(row, "Event Name", "EventName") || "(unnamed)";
    const date        = normaliseDate(findCol(row, "Date"));
    const room        = findCol(row, "Room name", "Roomname", "Room Name") || "";
    const meetingType = findCol(row, "Meeting Type", "MeetingType") || "Hybrid";

    let duration = parseFloat(findCol(row, "Duration")) || 0;
    if (!duration) {
      duration = parseDuration(
        findCol(row, "Start Time", "StartTime", "Start TIme"),
        findCol(row, "End Time", "EndTime")
      );
    }

    const totalAtt = parseInt(findCol(row, "Total Attendees", "TotalAttendees", "Attendees")) || 0;

    const addEvent = (rawName, role) => {
      const staffName = rawName.trim().replace(/\s+/g, " ");
      if (!staffName) return;

      if (!staffMap[staffName]) {
        staffMap[staffName] = {
          total_events: 0,
          primary_count: 0,
          secondary_count: 0,
          total_hours: 0,
          total_attendees: 0,
          by_month: {},
          by_status: {},
          by_type: {},
          events: [],      // ✅ this was missing the push before
        };
      }

      const s = staffMap[staffName];
      s.total_events++;
      s.total_hours = Math.round((s.total_hours + duration) * 100) / 100;
      s.total_attendees += totalAtt;
      s.by_month[month]       = (s.by_month[month] || 0) + 1;
      s.by_status[status]     = (s.by_status[status] || 0) + 1;
      s.by_type[meetingType]  = (s.by_type[meetingType] || 0) + 1;
      if (role === "Primary") s.primary_count++;
      else s.secondary_count++;

      // ✅ THE FIX — actually push the event into the events array
      s.events.push({
        month,
        date,
        event: eventName,
        status,
        duration,
        type: meetingType,
        room,
        attendees: totalAtt,
        role,
      });
    };

    primaryRaw.split(/[,;]/).forEach((n) => { if (n.trim()) addEvent(n, "Primary"); });
    const primaryNames = new Set(primaryRaw.split(/[,;]/).map((n) => n.trim()));
    secondaryRaw.split(/[,;]/).forEach((n) => {
      if (n.trim() && !primaryNames.has(n.trim())) addEvent(n, "Secondary");
    });
  });

  console.log(`[Sheet] ✅ ${Object.keys(staffMap).length} staff, ${skipped} rows skipped`);
  console.log("[Sheet] Staff:", Object.keys(staffMap));
  Object.entries(staffMap).forEach(([name, d]) => {
    console.log(`  ${name}: ${d.events.length} events`);
  });

  return staffMap;
}

/* ================= CACHE + FETCH ================= */
let _cache = null;
let _cacheTime = 0;
const TTL = 5 * 60 * 1000;

export function isSheetConfigured() {
  return typeof SHEET_CSV_URL === "string" && SHEET_CSV_URL.trim().startsWith("http");
}
export function clearCache() { _cache = null; _cacheTime = 0; }

export async function fetchSheetData() {
  if (!isSheetConfigured()) throw new Error("NO_URL");
  if (_cache && Date.now() - _cacheTime < TTL) return _cache;

  const url = SHEET_CSV_URL.includes("?")
    ? `${SHEET_CSV_URL}&_t=${Date.now()}`
    : `${SHEET_CSV_URL}?_t=${Date.now()}`;

  console.log("[Sheet] Fetching:", url);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const text = await res.text();
  if (text.trim().startsWith("<!")) throw new Error("Got HTML — publish sheet as CSV.");

  const rows = parseCSV(text);
  if (rows.length === 0) throw new Error("No data rows.");

  const data = transformRows(rows);
  if (Object.keys(data).length === 0) throw new Error("No staff found. Check 'Primary Support' column.");

  _cache = data;
  _cacheTime = Date.now();
  return data;
}
