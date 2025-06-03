export enum DayOfWeek {
  MONDAY = "monday",
  TUESDAY = "tuesday",
  WEDNESDAY = "wednesday",
  THURSDAY = "thursday",
  FRIDAY = "friday",
  SATURDAY = "saturday",
  SUNDAY = "sunday",
}

export enum ShiftType {
  day = "day",
  night = "night",
}

export interface Preference {
  shift: ShiftType;
  dayOfWeek: DayOfWeek;
}
