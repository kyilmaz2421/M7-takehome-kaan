import { useState, useEffect } from "react";
import { ShiftType, DayOfWeek } from "../model/shift";
import { ShiftPreference } from "../model/nurse";
import Table from "./shared/Table";
import * as api from "../services/apiService";

// Utility functions for formatting
const formatShiftType = (shift: ShiftType): string => {
  return shift.charAt(0).toUpperCase() + shift.slice(1);
};

const formatDayOfWeek = (day: DayOfWeek): string => {
  return day.charAt(0).toUpperCase() + day.slice(1);
};

type NursePreferredShifts = {
  [key in DayOfWeek]: ShiftType | null;
};

interface PreferenceRow {
  day: DayOfWeek;
  shifts: ShiftType | null;
}

interface NursePreferencesProps {
  id: number;
  name: string;
  days: string[];
  preferences: ShiftPreference[];
  setNursePreferences: any;
}

const NursePreferences = ({
  id,
  name,
  days,
  preferences,
  setNursePreferences,
}: NursePreferencesProps) => {
  const [showNursePreferredShifts, setShowNursePreferredShifts] =
    useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasExistingPreferences, setHasExistingPreferences] = useState(false);
  const [nursePreferredShifts, setNursePreferredShifts] =
    useState<NursePreferredShifts>({
      monday: null,
      tuesday: null,
      wednesday: null,
      thursday: null,
      friday: null,
      saturday: null,
      sunday: null,
    });

  useEffect(() => {
    const shifts: NursePreferredShifts = {
      monday: null,
      tuesday: null,
      wednesday: null,
      thursday: null,
      friday: null,
      saturday: null,
      sunday: null,
    };

    preferences.forEach((pref) => {
      const day = pref.dayOfWeek.toLowerCase() as DayOfWeek;
      shifts[day] = pref.shift as ShiftType;
    });

    setNursePreferredShifts(shifts);
    setHasExistingPreferences(preferences.length > 0);
  }, [preferences]);

  const handleClick = () => {
    setShowNursePreferredShifts((show) => !show);
    // Clear messages when toggling
    setError(null);
    setSuccess(null);
  };

  const handleSubmitPreferences = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const shiftsToPost: ShiftPreference[] = [];
    Object.entries(nursePreferredShifts).forEach(([day, shift]) => {
      if (shift !== null) {
        shiftsToPost.push({
          dayOfWeek: day.toLowerCase(),
          shift: shift as ShiftType,
        });
      }
    });

    try {
      // First make the API call
      await api.default.setNursePreferences(id, shiftsToPost);

      // Then update the global state
      setNursePreferences((prev: Record<number, ShiftPreference[]>) => ({
        ...prev,
        [id]: shiftsToPost,
      }));

      setSuccess("Preferences saved successfully!");
      setHasExistingPreferences(shiftsToPost.length > 0);
    } catch (err) {
      setError(
        `Failed to save preferences: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
      console.error("Error saving preferences:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target;
    if (input.type === "checkbox") {
      // Uncheck any other checkbox for the same day
      const day = input.name;
      const newValue = input.checked ? (input.value as ShiftType) : null;

      setNursePreferredShifts((prev: NursePreferredShifts) => ({
        ...prev,
        [day]: newValue,
      }));
    }
  };

  const handleRemoveAllPreferences = async () => {
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      // First make the API call
      await api.default.setNursePreferences(id, []);

      // Then update the global state
      setNursePreferences((prev: Record<number, ShiftPreference[]>) => ({
        ...prev,
        [id]: [],
      }));

      // Reset local state
      setNursePreferredShifts({
        monday: null,
        tuesday: null,
        wednesday: null,
        thursday: null,
        friday: null,
        saturday: null,
        sunday: null,
      });

      setSuccess("All preferences removed successfully!");
      setHasExistingPreferences(false);
    } catch (err) {
      setError(
        `Failed to remove preferences: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
      console.error("Error removing preferences:", err);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      header: "Day of the Week",
      key: "day",
      width: "30%",
      render: (row: PreferenceRow) => formatDayOfWeek(row.day),
    },
    {
      header: "Type of Shift",
      key: "shifts",
      width: "70%",
      render: (row: PreferenceRow) => (
        <div className="shift-options">
          <div className="shift-option">
            <input
              type="checkbox"
              id={`${row.day}-${ShiftType.Day}`}
              name={row.day}
              value={ShiftType.Day}
              checked={nursePreferredShifts[row.day] === ShiftType.Day}
              onChange={handleChange}
            />
            <label htmlFor={`${row.day}-${ShiftType.Day}`}>
              {formatShiftType(ShiftType.Day)}
            </label>
          </div>
          <div className="shift-option">
            <input
              type="checkbox"
              id={`${row.day}-${ShiftType.Night}`}
              name={row.day}
              value={ShiftType.Night}
              checked={nursePreferredShifts[row.day] === ShiftType.Night}
              onChange={handleChange}
            />
            <label htmlFor={`${row.day}-${ShiftType.Night}`}>
              {formatShiftType(ShiftType.Night)}
            </label>
          </div>
        </div>
      ),
    },
  ];

  const tableData = days.map((day) => ({
    day: day as DayOfWeek,
    shifts: nursePreferredShifts[day as DayOfWeek],
  }));

  return (
    <div className="nurse-preferences-container">
      <button
        onClick={handleClick}
        className={`button-base button-secondary ${showNursePreferredShifts ? "active" : ""}`}
        disabled={loading}
      >
        {name}
      </button>

      {showNursePreferredShifts && (
        <div className="panel">
          <h3 className="header-title">
            Pick at least 3 preferred shifts for the week:
          </h3>
          {error && <div className="message-base error-message">{error}</div>}
          {success && (
            <div className="message-base success-message">{success}</div>
          )}
          <form onSubmit={handleSubmitPreferences}>
            <Table data={tableData} columns={columns} />
            <div className="button-container">
              <button
                type="submit"
                className="button-base button-primary"
                disabled={loading}
              >
                {loading ? "Saving..." : "Submit Preferences"}
              </button>
              {hasExistingPreferences && (
                <button
                  type="button"
                  onClick={handleRemoveAllPreferences}
                  className="button-base button-danger"
                  disabled={loading}
                >
                  {loading ? "Removing..." : "Remove All Preferences"}
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      <style>{`
        .message-base {
          padding: 1rem;
          margin: 1rem 0;
          border-radius: 4px;
        }

        .error-message {
          background-color: rgba(255, 0, 0, 0.1);
          color: #ff0000;
        }

        .success-message {
          background-color: rgba(0, 255, 0, 0.1);
          color: #00ff00;
        }

        .nurse-preferences-container {
          margin: 1rem 0;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }

        .shift-options {
          display: flex;
          gap: 2rem;
        }

        .shift-option {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .shift-option input[type="checkbox"] {
          width: 1.2rem;
          height: 1.2rem;
          cursor: pointer;
          accent-color: #3498db;
        }

        .shift-option label {
          color: white;
          cursor: pointer;
        }

        .button-container {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
        }

        button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default NursePreferences;
