import { useEffect, useState } from "react";
import * as api from "./services/apiService";
import m7Logo from "/Logo-black.png";
import "./App.css";
import NursePreferences from "./components/NursePreferences";

function App() {
  const [nurses, setNurses] = useState<unknown[] | null>(null);
  const [requirements, setRequirements] = useState<unknown[] | null>(null);
  const [schedules, setSchedules] = useState<unknown[] | null>(null);
  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  useEffect(() => {
    const fetchNurses = async () => {
      const nurses = await api.default.getNurses(); // TODO: this appears to be getting called twice on page load... why?
      setNurses(nurses);
    };

    fetchNurses().catch(console.error);
  }, []);

  useEffect(() => {
    const fetchRequirements = async () => {
      const requirements = await api.default.getShiftRequirements();
      setRequirements(requirements);
    };

    fetchRequirements().catch(console.error);
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
      <div className="card">
        <h2>Nurses</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
            </tr>
          </thead>
          <tbody>
            {nurses &&
              nurses.map((nurse: any) => (
                <tr key={nurse.id}>
                  <td>{nurse.id}</td>
                  <td>
                    <NursePreferences
                      id={nurse.id}
                      name={nurse.name}
                      days={days}
                    />
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <div className="card">
        <h2>Shift Requirements</h2>
        <table>
          <thead>
            <tr>
              <th>Day</th>
              <th>Shift</th>
              <th>Nurses required</th>
            </tr>
          </thead>
          <tbody>
            {requirements &&
              requirements.map((req: any) => (
                <tr key={req.dayOfWeek + "-" + req.shift}>
                  <td>{req.dayOfWeek}</td>
                  <td>{req.shift}</td>
                  <td>{req.nursesRequired}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <div className="card">
        <h2>Schedules</h2>
        <div>TODO</div>
        {schedules &&
          schedules.map((schedule: any) => (
            <div className="schedule" key={schedule.id}>
              {/* TODO: Display table of available schedules */}
            </div>
          ))}
      </div>
    </>
  );
}

export default App;
