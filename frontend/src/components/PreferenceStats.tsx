import { Shift } from "../model/shift";
import { ShiftPreference } from "../model/nurse";

interface PreferenceStatsProps {
  shifts: Shift[];
  nursePreferences: Record<number, ShiftPreference[]>;
}

interface PreferenceMetrics {
  matches: number;
  mismatches: number;
  neutral: number;
  total: number;
}

const PreferenceStats = ({
  shifts,
  nursePreferences,
}: PreferenceStatsProps) => {
  const calculateStats = (): PreferenceMetrics => {
    return shifts.reduce(
      (stats, shift) => {
        if (!shift.nurse) return stats;

        const nurseId = shift.nurse.id;
        const preferences = nursePreferences[nurseId] || [];

        // If nurse has no preferences, count as neutral
        if (preferences.length === 0) {
          return {
            ...stats,
            neutral: stats.neutral + 1,
            total: stats.total + 1,
          };
        }

        // Check if this shift matches any preferences
        const hasPreference = preferences.some(
          (pref) =>
            pref.dayOfWeek === shift.dayOfWeek && pref.shift === shift.type,
        );

        if (hasPreference) {
          return {
            ...stats,
            matches: stats.matches + 1,
            total: stats.total + 1,
          };
        } else {
          return {
            ...stats,
            mismatches: stats.mismatches + 1,
            total: stats.total + 1,
          };
        }
      },
      { matches: 0, mismatches: 0, neutral: 0, total: 0 },
    );
  };

  const stats = calculateStats();

  const formatPercentage = (value: number, total: number): string => {
    return ((value / total) * 100).toFixed(1) + "%";
  };

  return (
    <div className="preference-stats" style={{ marginTop: "1rem" }}>
      <h4>Preference Matching Statistics:</h4>
      <div style={{ display: "flex", gap: "2rem", marginTop: "0.5rem" }}>
        <div>
          <span style={{ color: "#4CAF50" }}>Preferences Matched: </span>
          {stats.matches} ({formatPercentage(stats.matches, stats.total)})
        </div>
        <div>
          <span style={{ color: "#f44336" }}>Preferences Not Met: </span>
          {stats.mismatches} ({formatPercentage(stats.mismatches, stats.total)})
        </div>
        <div>
          <span style={{ color: "white" }}>No Preferences: </span>
          {stats.neutral} ({formatPercentage(stats.neutral, stats.total)})
        </div>
      </div>
    </div>
  );
};

export default PreferenceStats;
