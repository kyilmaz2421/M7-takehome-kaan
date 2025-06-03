import { ShiftRequirement } from "../model/shift";
import Table from "./shared/Table";

interface ShiftRequirementsProps {
  requirements: ShiftRequirement[] | null;
}

const ShiftRequirements = ({ requirements }: ShiftRequirementsProps) => {
  if (!requirements) {
    return <div>Loading...</div>;
  }

  // Sort requirements by day of week and shift
  const sortedRequirements = [...requirements].sort((a, b) => {
    const days = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];
    const dayCompare = days.indexOf(a.dayOfWeek) - days.indexOf(b.dayOfWeek);
    if (dayCompare !== 0) return dayCompare;
    return a.shift.localeCompare(b.shift);
  });

  const columns = [
    {
      header: "Day",
      key: "dayOfWeek",
      render: (row: ShiftRequirement) =>
        row.dayOfWeek.charAt(0).toUpperCase() + row.dayOfWeek.slice(1),
    },
    {
      header: "Shift",
      key: "shift",
      render: (row: ShiftRequirement) =>
        row.shift.charAt(0).toUpperCase() + row.shift.slice(1),
    },
    { header: "Nurses Required", key: "nursesRequired" },
  ];

  return (
    <div className="card">
      <div className="panel">
        <h3 className="header-title">Shift Requirements</h3>
        {requirements.length === 0 ? (
          <div>No shift requirements available</div>
        ) : (
          <Table data={sortedRequirements} columns={columns} />
        )}
      </div>
    </div>
  );
};

export default ShiftRequirements;
