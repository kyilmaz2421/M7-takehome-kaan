import { Schedule as ScheduleType } from "../model/schedule";
import { useEffect, useState } from "react";
import * as api from "../services/apiService";
import { ShiftRequirement } from "../model/shift";
import { ShiftPreference } from "../model/nurse";
import ScheduledShifts from "./ScheduledShifts";
import PreferenceStats from "./PreferenceStats";

interface ScheduleProps {
  requirements: ShiftRequirement[] | null;
  nursePreferences: Record<number, ShiftPreference[]>;
}

const Schedule = ({ requirements, nursePreferences }: ScheduleProps) => {
  const [schedules, setSchedules] = useState<ScheduleType[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSchedules = async () => {
      const mostRecentSchedules = await api.default.getMostRecentSchedules();
      setSchedules(mostRecentSchedules);
    };

    fetchSchedules().catch(console.error);
  }, []);

  const handleGenerateSchedule = async () => {
    if (!requirements) {
      setError("Cannot generate schedule: Shift requirements not loaded");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const nursePreferencesArray = Object.entries(nursePreferences).map(
        ([nurseId, preferences]) => ({
          nurseId: parseInt(nurseId),
          preferences,
        }),
      );

      await api.default.generateSchedule(requirements, nursePreferencesArray);
      const newSchedules = await api.default.getMostRecentSchedules();
      setSchedules(newSchedules);
    } catch (err) {
      setError(
        `Failed to generate schedule: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="header">
        <h2>Schedules</h2>
        <button
          onClick={handleGenerateSchedule}
          className={`button-base button-primary ${loading ? "disabled" : ""}`}
          disabled={loading || !requirements}
        >
          {loading ? "Generating..." : "Generate New Schedule"}
        </button>
      </div>

      {error && <div className="message-base error-message">{error}</div>}

      {schedules && schedules.length > 0 && (
        <>
          {schedules.map((schedule, index) => (
            <div
              key={schedule.id}
              className="panel"
              style={{ marginBottom: "2rem" }}
            >
              <h3 className="header-title">
                Schedule {index + 1}
                {index === 0 && " (Most Recent)"}
                {schedule.schedulingAlgorithm &&
                  ` - Generated using ${schedule.schedulingAlgorithm} algorithm`}
              </h3>
              <div
                className="schedule-legend"
                style={{
                  marginBottom: "1rem",
                  padding: "1rem",
                  backgroundColor: "#2c3440",
                  borderRadius: "4px",
                  color: "white",
                }}
              >
                <p>
                  <strong>Legend:</strong>
                </p>
                <p>
                  • Numbers in parentheses (e.g. "(1)") represent the Nurse ID
                </p>
                <p>
                  • <span style={{ color: "#4CAF50" }}>Green</span> names
                  indicate the nurse preferred this shift
                </p>
                <p>
                  • <span style={{ color: "#f44336" }}>Red</span> names indicate
                  the nurse did not prefer this shift
                </p>
                <p>
                  • <span style={{ color: "white" }}>White</span> names indicate
                  the nurse had no shift preferences
                </p>
              </div>
              {schedule.shifts && schedule.shifts.length > 0 ? (
                <>
                  <PreferenceStats
                    shifts={schedule.shifts}
                    nursePreferences={nursePreferences}
                  />
                  <ScheduledShifts
                    shifts={schedule.shifts}
                    requirements={requirements}
                    nursePreferences={nursePreferences}
                  />
                </>
              ) : (
                <div>No shifts in this schedule</div>
              )}
            </div>
          ))}
        </>
      )}

      {!schedules && (
        <div>No schedules available yet, please generate a schedule</div>
      )}
      {schedules?.length === 0 && <div>No schedules available</div>}
    </div>
  );
};

export default Schedule;
