import * as path from "path";
import * as fs from "fs";
import {
  ShiftType,
  DayOfWeek,
} from "../../shiftPreference/shift-preference.types";

export interface ShiftRequirementSeed {
  shift: string;
  nursesRequired: string;
  dayOfWeek: string;
}

export function getShiftRequirementSeeds(): ShiftRequirementSeed[] {
  const filePath = path.join(
    process.cwd(),
    "./src/db/seeds/shiftRequirements.json"
  );
  const fileContents = fs.readFileSync(filePath, "utf8");
  const shiftRequirements: ShiftRequirementSeed[] =
    JSON.parse(fileContents)["shiftRequirements"];
  return shiftRequirements;
}

export function convertToDbFormat(requirement: ShiftRequirementSeed) {
  return {
    shift: requirement.shift as ShiftType,
    dayOfWeek:
      DayOfWeek[requirement.dayOfWeek.toUpperCase() as keyof typeof DayOfWeek],
    nursesRequired: parseInt(requirement.nursesRequired),
  };
}
