import React, { useMemo } from "react";
import styles from "./Dashboard.module.css";
import { PALETTE } from "../data/teamData";

function initials(name) {
  return name.split(" ").map((w) => w[0]).join("");
}

function MemberCard({ name, data, palette, onClick }) {
  const completed = data.by_status.Completed || 0;
  const compPct = Math.round((completed / data.total_events) * 100);

  return (
    <div className={styles.card} onClick={onClick}>
      <div className={styles.cardBar} style={{ background: palette.accent }} />
      <div className={styles.cardTop}>
        <div
          className={styles.avatar}
          style={{ background: palette.bg, color: palette.accent }}
        >
          {initials(name)}
        </div>
        <div>
          <div className={styles.memberName}>{name}</div>
          <div className={styles.memberRole}>Event Support Staff</div>
        </div>
      </div>

      <div className={styles.pills}>
        <span className={styles.pill}>
          <b>{data.total_events}</b> events
        </span>
        <span className={styles.pill}>
          <b>{data.total_hours.toFixed(0)}h</b> logged
        </span>
        <span className={styles.pill}>
          <b>{data.total_attendees.toLocaleString()}</b> attendees
        </span>
      </div>

      <div className={styles.progressBlock}>
        <div className={styles.progressLabel}>
          <span>Completion rate</span>
          <span style={{ color: palette.accent }}>{compPct}%</span>
        </div>
        <div className={styles.progressBg}>
          <div
            className={styles.progressFill}
            style={{ width: `${compPct}%`, background: palette.accent }}
          />
        </div>
      </div>

      <div className={styles.cardFooter} style={{ color: palette.accent }}>
        View full profile →
      </div>
    </div>
  );
}

export default function Dashboard({ onSelect, data }) {
  const names = Object.keys(data);

  const totals = useMemo(() => {
    return names.reduce(
      (acc, n) => {
        const d = data[n];
        acc.events += d.total_events;
        acc.hours += d.total_hours;
        acc.attendees += d.total_attendees;
        acc.completed += d.by_status.Completed || 0;
        return acc;
      },
      { events: 0, hours: 0, attendees: 0, completed: 0 }
    );
  }, [names, data]);

  const compRate = Math.round((totals.completed / totals.events) * 100);

  return (
    <div className={styles.wrapper}>
      {/* Header */}
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Event Support Dashboard</h1>
          <p className={styles.subtitle}>Bangalore Team · January – March 2026</p>
        </div>
        <div className={styles.quarterBadge}>Q1 2026</div>
      </header>

      {/* Top stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Total Events</div>
          <div className={`${styles.statValue} ${styles.blue}`}>{totals.events}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Hours Logged</div>
          <div className={`${styles.statValue} ${styles.green}`}>{totals.hours.toFixed(0)}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Attendees Served</div>
          <div className={`${styles.statValue} ${styles.orange}`}>{totals.attendees.toLocaleString()}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Completion Rate</div>
          <div className={`${styles.statValue} ${styles.purple}`}>{compRate}%</div>
        </div>
      </div>

      {/* Team grid */}
      <div className={styles.sectionLabel}>Team Members · click a card to view profile</div>
      <div className={styles.teamGrid}>
        {names.map((name, i) => (
          <MemberCard
            key={name}
            name={name}
            data={data[name]}
            palette={PALETTE[i % PALETTE.length]}
            onClick={() => onSelect(name, i)}
          />
        ))}
      </div>
    </div>
  );
}
