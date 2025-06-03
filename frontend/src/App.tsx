import m7Logo from "/Logo-black.png";
import "./App.css";
import { useEffect, useState } from "react";
import Nurses from "./components/Nurses";
import Schedule from "./components/Schedule";
import ShiftRequirements from "./components/ShiftRequirements";
import { ShiftPreference, Nurse } from "./model/nurse";
import { ShiftRequirement } from "./model/shift";
import * as api from "./services/apiService";

function App() {
  const [nurses, setNurses] = useState<Nurse[] | null>(null);
  const [requirements, setRequirements] = useState<ShiftRequirement[] | null>(
    null,
  );
  const [nursePreferences, setNursePreferences] = useState<
    Record<number, ShiftPreference[]>
  >({});
  const [error, setError] = useState<string | null>(null);

  // Fetch nurses
  useEffect(() => {
    const fetchNurses = async () => {
      try {
        const nurses = await api.default.getNurses();
        setNurses(nurses);

        // Fetch preferences for each nurse
        const preferencesMap: Record<number, ShiftPreference[]> = {};
        await Promise.all(
          nurses.map(async (nurse) => {
            const preferences = await api.default.getNursePreferences(nurse.id);
            preferencesMap[nurse.id] = preferences;
          }),
        );
        setNursePreferences(preferencesMap);
      } catch (err) {
        setError(
          `Failed to fetch nurses and preferences: ${err instanceof Error ? err.message : "Unknown error"}`,
        );
        console.error(err);
      }
    };

    fetchNurses();
  }, []);

  // Fetch shift requirements
  useEffect(() => {
    const fetchRequirements = async () => {
      try {
        const requirements = await api.default.getShiftRequirements();
        setRequirements(requirements);
      } catch (err) {
        setError(
          `Failed to fetch requirements: ${err instanceof Error ? err.message : "Unknown error"}`,
        );
        console.error(err);
      }
    };

    fetchRequirements();
  }, []);

  return (
    <>
      <div>
        <a href="https://m7health.com" target="_blank">
          <img src={m7Logo} className="logo" alt="M7 Health logo" />
        </a>
      </div>
      <h1>M7 Health scheduling exercise</h1>
      <div className="card">
        Check the README for guidance on how to complete this exercise. Find
        inspiration{" "}
        <a href="https://www.m7health.com/product" target="_blank">
          on M7's site
        </a>
        .
      </div>

      {error && <div className="message-base error-message">{error}</div>}

      <Nurses
        nurses={nurses}
        nursePreferences={nursePreferences}
        setNursePreferences={setNursePreferences}
      />
      <ShiftRequirements requirements={requirements} />
      <Schedule
        requirements={requirements}
        nursePreferences={nursePreferences}
      />
    </>
  );
}

export default App;
