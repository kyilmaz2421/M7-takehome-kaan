import { Shift, ShiftRequirement } from "../model/shift";
import { ShiftPreference } from "../model/nurse";
import Table from "./shared/Table";

interface ScheduledShiftsProps {
  shifts: Shift[];
  requirements: ShiftRequirement[] | null;
  nursePreferences: Record<number, ShiftPreference[]>;
}

const capitalizeDay = (day: string): string =>
  day.charAt(0).toUpperCase() + day.slice(1);

const ScheduledShifts = ({
  shifts,
  requirements,
  nursePreferences,
}: ScheduledShiftsProps) => {
  // Group shifts by day
  const shiftsByDay = shifts.reduce(
    (acc, shift) => {
      const day = shift.dayOfWeek.toLowerCase();
      if (!acc[day]) {
        acc[day] = { day: day, day_shifts: [], night_shifts: [] };
      }
      if (shift.type === "day") {
        acc[day].day_shifts.push(shift);
      } else {
        acc[day].night_shifts.push(shift);
      }
      return acc;
    },
    {} as Record<
      string,
      { day: string; day_shifts: Shift[]; night_shifts: Shift[] }
    >,
  );

  const getRequirementForDay = (
    dayName: string,
    shiftType: "day" | "night",
  ): number => {
    if (!requirements) return 0;
    const requirement = requirements.find(
      (req) =>
        req.dayOfWeek.toLowerCase() === dayName.toLowerCase() &&
        req.shift === shiftType,
    );
    return requirement ? requirement.nursesRequired : 0;
  };

  const hasPreferenceForShift = (
    nurseId: number,
    dayOfWeek: string,
    shiftType: "day" | "night",
  ) => {
    const preferences = nursePreferences[nurseId] || [];
    return preferences.some(
      (pref) => pref.dayOfWeek === dayOfWeek && pref.shift === shiftType,
    );
  };

  const hasAnyPreferences = (nurseId: number) => {
    return (nursePreferences[nurseId] || []).length > 0;
  };

  const renderNurses = (shifts: Shift[]) => {
    return shifts
      .map((shift) => {
        if (!shift.nurse) return "Unassigned";

        if (!hasAnyPreferences(shift.nurse.id)) {
          // White names indicate the nurse had no shift preferences
          return `<span style="color: white">${shift.nurse.name} (${shift.nurse.id})</span>`;
        }

        const hasPreference = hasPreferenceForShift(
          shift.nurse.id,
          shift.dayOfWeek,
          shift.type,
        );

        // Green names indicate the nurse preferred this shift
        // Red names indicate the nurse did not prefer this shift
        const color = hasPreference ? "#4CAF50" : "#f44336";
        return `<span style="color: ${color}">${shift.nurse.name} (${shift.nurse.id})</span>`;
      })
      .join(", ");
  };

  const renderRequirementStatus = (
    shifts: Shift[],
    dayName: string,
    shiftType: "day" | "night",
  ) => {
    const required = getRequirementForDay(dayName, shiftType);
    const assigned = shifts.filter((shift) => shift.nurse).length;
    const meets = assigned >= required;
    const color = meets ? "#4CAF50" : "#f44336";

    return (
      <div>
        <span style={{ color }}>{meets.toString()}</span>
        <br />
        <span style={{ fontSize: "0.9em", color: "#888" }}>
          ({assigned} assigned / {required} required)
        </span>
      </div>
    );
  };

  const columns = [
    {
      header: "Day",
      key: "day",
      render: (row: any) => capitalizeDay(row.day),
    },
    {
      header: "Day Shift",
      key: "day_shifts",
      render: (row: any) => (
        <div
          dangerouslySetInnerHTML={{ __html: renderNurses(row.day_shifts) }}
        />
      ),
    },
    {
      header: "Meets shift requirements for the day",
      key: "meets_day_requirements",
      render: (row: any) =>
        renderRequirementStatus(row.day_shifts, row.day, "day"),
    },
    {
      header: "Night Shift",
      key: "night_shifts",
      render: (row: any) => (
        <div
          dangerouslySetInnerHTML={{ __html: renderNurses(row.night_shifts) }}
        />
      ),
    },
    {
      header: "Meets shift requirements for the night",
      key: "meets_night_requirements",
      render: (row: any) =>
        renderRequirementStatus(row.night_shifts, row.day, "night"),
    },
  ];

  return <Table data={Object.values(shiftsByDay)} columns={columns} />;
};

export default ScheduledShifts;
