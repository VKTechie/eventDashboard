import React, { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import styles from "./Profile.module.css";
import { TEAM_DATA } from "../data/teamData";

function initials(name) {
  return name.split(" ").map((w) => w[0]).join("");
}

const STATUS_STYLE = {
  Completed: { cls: "done",      label: "Completed" },
  Upcoming:  { cls: "upcoming",  label: "Upcoming"  },
  Cancelled: { cls: "cancelled", label: "Cancelled" },
};

const TYPE_COLORS = {
  Hybrid:    "#5b7cfa",
  Virtual:   "#36c998",
  "In-Room": "#f97c5b",
};

function CustomTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    return (
      <div className={styles.tooltip}>
        <span>{payload[0].value} events</span>
      </div>
    );
  }
  return null;
}

export default function Profile({ name, paletteIdx, onBack }) {
  const data = TEAM_DATA[name];
  const [filter, setFilter] = useState("All");
  const [monthFilter, setMonthFilter] = useState("All");

  const months = ["Jan", "Feb", "Mar"];
  const monthData = months.map((m) => ({ month: m, count: data.by_month[m] || 0 }));

  const filtered = data.events.filter((e) => {
    const statusMatch = filter === "All" || e.status === filter;
    const monthMatch = monthFilter === "All" || e.month === monthFilter;
    return statusMatch && monthMatch;
  });

  const statusFilters = ["All", "Completed", "Upcoming", "Cancelled"];
  const accentColor = ["#5b7cfa","#36c998","#f97c5b","#b87cf9","#f97bb5","#5be4d8"][paletteIdx % 6];
  const bgColor     = ["rgba(91,124,250,0.15)","rgba(54,201,152,0.15)","rgba(249,124,91,0.15)","rgba(184,124,249,0.15)","rgba(249,123,181,0.15)","rgba(91,228,216,0.15)"][paletteIdx % 6];

  const completed = data.by_status.Completed || 0;
  const compPct   = Math.round((completed / data.total_events) * 100);

  return (
    <div className={styles.wrapper}>
      {/* Back */}
      <button className={styles.backBtn} onClick={onBack}>
        <span className={styles.backArrow}>←</span> Back to dashboard
      </button>

      {/* Hero */}
      <div className={styles.hero}>
        <div className={styles.heroAvatar} style={{ background: bgColor, color: accentColor }}>
          {initials(name)}
        </div>
        <div className={styles.heroInfo}>
          <h2 className={styles.heroName}>{name}</h2>
          <p className={styles.heroRole}>Event Support Staff · Q1 2026</p>
          <div className={styles.heroTags}>
            <span className={styles.tag} style={{ borderColor: `${accentColor}40`, color: accentColor, background: bgColor }}>
              {data.total_events} Events
            </span>
            <span className={styles.tag} style={{ borderColor: "rgba(54,201,152,0.3)", color: "var(--green)", background: "rgba(54,201,152,0.1)" }}>
              {data.total_hours.toFixed(1)}h Logged
            </span>
            <span className={styles.tag} style={{ borderColor: "rgba(249,124,91,0.3)", color: "var(--orange)", background: "rgba(249,124,91,0.1)" }}>
              {data.total_attendees.toLocaleString()} Attendees
            </span>
            <span className={styles.tag} style={{ borderColor: "rgba(184,124,249,0.3)", color: "var(--purple)", background: "rgba(184,124,249,0.1)" }}>
              {data.primary_count} Primary · {data.secondary_count} Secondary
            </span>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className={styles.statsRow}>
        {/* Events by month chart */}
        <div className={styles.card}>
          <div className={styles.cardTitle}>Events by Month</div>
          <ResponsiveContainer width="100%" height={130}>
            <BarChart data={monthData} barCategoryGap="30%">
              <XAxis dataKey="month" tick={{ fill: "var(--mu2)", fontSize: 11, fontFamily: "var(--mono)" }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {monthData.map((entry, i) => (
                  <Cell key={i} fill={entry.count === Math.max(...monthData.map(m => m.count)) ? accentColor : "var(--s4)"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Meeting types */}
        <div className={styles.card}>
          <div className={styles.cardTitle}>Meeting Types</div>
          <div className={styles.kpiList}>
            {Object.entries(data.by_type).map(([k, v]) => (
              <div key={k} className={styles.kpiRow}>
                <div className={styles.kpiLeft}>
                  <div className={styles.kpiDot} style={{ background: TYPE_COLORS[k] || accentColor }} />
                  <span className={styles.kpiLabel}>{k}</span>
                </div>
                <div className={styles.kpiRight}>
                  <div className={styles.kpiBar}>
                    <div className={styles.kpiBarFill} style={{ width: `${Math.round((v / data.total_events) * 100)}%`, background: TYPE_COLORS[k] || accentColor }} />
                  </div>
                  <span className={styles.kpiVal} style={{ color: TYPE_COLORS[k] || accentColor }}>{v}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status breakdown */}
        <div className={styles.card}>
          <div className={styles.cardTitle}>Status Breakdown</div>
          <div className={styles.kpiList}>
            {Object.entries(data.by_status).map(([k, v]) => {
              const col = k === "Completed" ? "var(--green)" : k === "Upcoming" ? "var(--blue)" : "var(--red)";
              return (
                <div key={k} className={styles.kpiRow}>
                  <div className={styles.kpiLeft}>
                    <div className={styles.kpiDot} style={{ background: col }} />
                    <span className={styles.kpiLabel}>{k}</span>
                  </div>
                  <div className={styles.kpiRight}>
                    <div className={styles.kpiBar}>
                      <div className={styles.kpiBarFill} style={{ width: `${Math.round((v / data.total_events) * 100)}%`, background: col }} />
                    </div>
                    <span className={styles.kpiVal} style={{ color: col }}>{v}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* completion ring-ish */}
          <div className={styles.compWrap}>
            <div className={styles.compCircle} style={{ background: `conic-gradient(${accentColor} ${compPct}%, var(--s3) 0%)` }}>
              <div className={styles.compInner}>
                <span className={styles.compPct} style={{ color: accentColor }}>{compPct}%</span>
                <span className={styles.compLbl}>done</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Event table */}
      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <div className={styles.cardTitle}>All Events ({filtered.length})</div>
          <div className={styles.filters}>
            <div className={styles.filterGroup}>
              {statusFilters.map((f) => (
                <button
                  key={f}
                  className={`${styles.filterBtn} ${filter === f ? styles.filterActive : ""}`}
                  style={filter === f ? { borderColor: accentColor, color: accentColor } : {}}
                  onClick={() => setFilter(f)}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className={styles.filterGroup}>
              {["All", ...months].map((m) => (
                <button
                  key={m}
                  className={`${styles.filterBtn} ${monthFilter === m ? styles.filterActive : ""}`}
                  style={monthFilter === m ? { borderColor: accentColor, color: accentColor } : {}}
                  onClick={() => setMonthFilter(m)}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Event Name</th>
                <th>Date</th>
                <th>Month</th>
                <th>Status</th>
                <th>Duration</th>
                <th>Type</th>
                <th>Room</th>
                <th>Attendees</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className={styles.emptyRow}>No events match this filter</td>
                </tr>
              ) : (
                filtered.map((ev, i) => {
                  const st = STATUS_STYLE[ev.status] || STATUS_STYLE.Upcoming;
                  return (
                    <tr key={i}>
                      <td className={styles.eventName}>{ev.event}</td>
                      <td className={styles.mono}>{ev.date.slice(5)}</td>
                      <td className={styles.mono}>{ev.month}</td>
                      <td>
                        <span className={`${styles.badge} ${styles[st.cls]}`}>{st.label}</span>
                      </td>
                      <td className={styles.mono}>{ev.duration}h</td>
                      <td>
                        <span className={styles.typePill} style={{ color: TYPE_COLORS[ev.type] || accentColor, background: `${TYPE_COLORS[ev.type] || accentColor}18` }}>
                          {ev.type}
                        </span>
                      </td>
                      <td className={styles.room}>{ev.room}</td>
                      <td className={styles.mono}>{ev.attendees > 0 ? ev.attendees : "—"}</td>
                      <td>
                        <span className={styles.rolePill} style={ev.role === "Primary" ? { color: accentColor, background: bgColor } : {}}>
                          {ev.role}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
