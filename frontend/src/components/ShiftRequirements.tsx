import { ShiftRequirement } from "../model/shift";
import Table from "./shared/Table";

interface ShiftRequirementsProps {
  requirements: ShiftRequirement[] | null;
}

const ShiftRequirements = ({ requirements }: ShiftRequirementsProps) => {
  if (!requirements) {
    return <div>Loading...</div>;
  }

  const columns = [
    {
      header: "Day",
      key: "dayOfWeek",
      render: (row: ShiftRequirement) =>
        row.dayOfWeek.charAt(0).toUpperCase() + row.dayOfWeek.slice(1),
    },
    { header: "Shift", key: "shift" },
    { header: "Nurses required", key: "nursesRequired" },
  ];

  return (
    <div className="card">
      <div className="panel">
        <h3 className="header-title">Shift Requirements</h3>
        {requirements.length === 0 ? (
          <div>No shift requirements available</div>
        ) : (
          <Table data={requirements} columns={columns} />
        )}
      </div>
    </div>
  );
};

export default ShiftRequirements;
