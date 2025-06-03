import NursePreferences from "./NursePreferences";
import { DAYS_OF_WEEK } from "../model/shift";
import { Nurse, ShiftPreference } from "../model/nurse";
import Table from "./shared/Table";

interface NursesProps {
  nurses: Nurse[] | null;
  nursePreferences: Record<number, ShiftPreference[]>;
  setNursePreferences: any;
}

const Nurses = ({
  nurses,
  nursePreferences,
  setNursePreferences,
}: NursesProps) => {
  if (!nurses) {
    return <div>Loading...</div>;
  }

  const columns = [
    { header: "ID", key: "id" },
    {
      header: "Name & Preferences",
      key: "preferences",
      render: (nurse: Nurse) => {
        const preferences = nursePreferences[nurse.id] || [];
        return (
          <NursePreferences
            id={nurse.id}
            name={nurse.name}
            days={DAYS_OF_WEEK}
            preferences={preferences}
            setNursePreferences={setNursePreferences}
          />
        );
      },
    },
  ];

  return (
    <div className="card">
      <div className="panel">
        <h3 className="header-title">Nurse Preferences</h3>
        <Table data={nurses} columns={columns} />
      </div>
    </div>
  );
};

export default Nurses;
