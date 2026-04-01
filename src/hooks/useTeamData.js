/*
Author: Vishnukarthick K
Description: This custom React hook, `useTeamData`, manages the fetching and state of team data from a Google Sheet. It handles loading states, errors, and provides a fallback to static data if the sheet is not configured or if fetching fails. The hook also supports auto-refreshing the data every 5 minutes when the sheet is live.
*/
import { useState, useEffect, useCallback } from "react";
import { fetchSheetData, isSheetConfigured, clearCache } from "../utils/fetchSheetData";
import { TEAM_DATA as STATIC_DATA } from "../data/teamData";

export function useTeamData() {
  const sheetConfigured = isSheetConfigured();

  const [state, setState] = useState({
    data: sheetConfigured ? null : STATIC_DATA,
    loading: sheetConfigured,
    error: null,
    source: sheetConfigured ? "loading" : "static",
    lastUpdated: sheetConfigured ? null : new Date(),
  });

  const load = useCallback(async (forceRefresh = false) => {
    if (!sheetConfigured) return;
    if (forceRefresh) clearCache();

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const data = await fetchSheetData();
      setState({ data, loading: false, error: null, source: "sheet", lastUpdated: new Date() });
    } catch (err) {
      console.error("[useTeamData] Sheet fetch failed:", err.message);
      setState({
        data: STATIC_DATA,
        loading: false,
        error: err.message,
        source: "fallback",
        lastUpdated: new Date(),
      });
    }
  }, [sheetConfigured]);

  useEffect(() => { load(); }, [load]);

  // Auto-refresh every 5 min when sheet is live
  useEffect(() => {
    if (!sheetConfigured) return;
    const id = setInterval(() => load(true), 5 * 60 * 1000);
    return () => clearInterval(id);
  }, [sheetConfigured, load]);

  return {
    ...state,
    sheetConfigured,
    refresh: () => load(true),
  };
}
