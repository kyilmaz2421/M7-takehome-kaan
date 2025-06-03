import { Nurse } from "./nurse";
import { Schedule } from "./schedule";

export interface ShiftRequirement {
  dayOfWeek: string;
  shift: ShiftType;
  nursesRequired: number;
}

export type DayOfWeek =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";
export const DAYS_OF_WEEK: DayOfWeek[] = [
  "monday" as DayOfWeek,
  "tuesday" as DayOfWeek,
  "wednesday" as DayOfWeek,
  "thursday" as DayOfWeek,
  "friday" as DayOfWeek,
  "saturday" as DayOfWeek,
  "sunday" as DayOfWeek,
];

export enum ShiftType {
  Day = "day",
  Night = "night",
}

export interface Shift {
  id: number;
  date: Date;
  type: ShiftType;
  dayOfWeek: DayOfWeek;
  nurse: Nurse | null;
  schedule: Schedule | null;
}
