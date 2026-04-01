import React, { useState } from "react";
import "./index.css";
import Dashboard from "./components/Dashboard";
import Profile from "./components/Profile";
import { useTeamData } from "./hooks/useTeamData";

// Inject spinner animation once
const styleEl = document.createElement("style");
styleEl.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
document.head.appendChild(styleEl);

export default function App() {
  const [selected, setSelected] = useState(null);
  const { data, loading, error, source, lastUpdated, sheetConfigured, refresh } = useTeamData();

  function handleSelect(name, idx) {
    setSelected({ name, idx });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function handleBack() {
    setSelected(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ── Loading ──
  if (loading) {
    return (
      <div style={S.centered}>
        <div style={S.spinner} />
        <p style={S.hint}>Fetching data from Google Sheet…</p>
      </div>
    );
  }

  return (
    <>
      {/* Top status bar */}
      <div style={S.bar}>
        {sheetConfigured ? (
          <>
            <span style={{ ...S.dot, background: source === "sheet" ? "#36c998" : "#f97c5b" }} />
            <span style={S.barText}>
              {source === "sheet"
                ? `Live · Google Sheet · refreshed ${lastUpdated?.toLocaleTimeString()}`
                : `Sheet error — showing offline data`}
            </span>
            {error && <span style={S.errText} title={error}>⚠ {error.split("\n")[0]}</span>}
            <button style={S.refreshBtn} onClick={refresh}>↻ Refresh</button>
          </>
        ) : (
          <>
            <span style={{ ...S.dot, background: "#f97c5b" }} />
            <span style={S.barText}>Offline data · </span>
            <span style={S.hint2}>
              Open <code style={S.code}>src/config.js</code> and paste your Google Sheet CSV URL to go live
            </span>
          </>
        )}
      </div>

      {selected ? (
        <Profile name={selected.name} paletteIdx={selected.idx} onBack={handleBack} data={data} />
      ) : (
        <Dashboard onSelect={handleSelect} data={data} />
      )}
    </>
  );
}

const S = {
  centered: {
    minHeight: "100vh", display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center", gap: 16, background: "var(--bg)",
  },
  spinner: {
    width: 36, height: 36, borderRadius: "50%",
    border: "3px solid rgba(91,124,250,0.2)",
    borderTop: "3px solid #5b7cfa",
    animation: "spin 0.8s linear infinite",
  },
  bar: {
    display: "flex", alignItems: "center", gap: 8,
    padding: "6px 20px", background: "var(--s1)",
    borderBottom: "0.5px solid var(--b1)",
    fontSize: 11, fontFamily: "var(--mono)", flexWrap: "wrap",
  },
  dot: { width: 6, height: 6, borderRadius: "50%", flexShrink: 0 },
  barText: { color: "var(--mu2)" },
  hint:  { fontSize: 13, color: "var(--mu2)", fontFamily: "var(--ff)" },
  hint2: { color: "var(--mu)", fontSize: 11 },
  code:  { background: "var(--s3)", padding: "1px 5px", borderRadius: 4, color: "var(--blue)", fontFamily: "var(--mono)" },
  errText: { color: "#f97c5b", fontSize: 10, maxWidth: 320, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 },
  refreshBtn: {
    background: "var(--s2)", border: "0.5px solid var(--b2)",
    borderRadius: 6, padding: "3px 10px", fontSize: 10,
    color: "var(--mu2)", cursor: "pointer", fontFamily: "var(--mono)",
  },
};
