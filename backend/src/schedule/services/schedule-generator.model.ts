import { ShiftRequirements } from "src/shift/shift.entity";
import {
  Preference,
  ShiftType,
  DayOfWeek,
} from "src/shiftPreference/shift-preference.types";
import { ScheduleEntity } from "../schedule.entity";
import { ShiftEntity } from "src/shift/shift.entity";
import { NurseEntity } from "src/nurse/nurse.entity";

export interface NursePreference {
  nurseId: number;
  preferences: Preference[];
}

export abstract class ScheduleGenerator {
  protected requirements: ShiftRequirements[];
  protected nurses: NursePreference[];
  protected readonly MAX_SHIFTS_PER_WEEK = 5;
  protected readonly DAYS: DayOfWeek[] = [
    DayOfWeek.MONDAY,
    DayOfWeek.TUESDAY,
    DayOfWeek.WEDNESDAY,
    DayOfWeek.THURSDAY,
    DayOfWeek.FRIDAY,
    DayOfWeek.SATURDAY,
    DayOfWeek.SUNDAY,
  ];

  constructor(requirements: ShiftRequirements[], nurses: NursePreference[]) {
    this.requirements = requirements.map((requirement) => ({
      ...requirement,
      nursesRequired: Number(requirement.nursesRequired),
    }));
    this.nurses = nurses;
    this.isSchedulePossible();
  }

  protected isSchedulePossible(): void {
    const numberOfShiftsNeeded = this.requirements.reduce(
      (acc, requirement) => {
        return acc + requirement.nursesRequired;
      },
      0
    );
    const numberOfShiftsAvailable =
      this.nurses.length * this.MAX_SHIFTS_PER_WEEK;
    if (numberOfShiftsNeeded > numberOfShiftsAvailable) {
      throw new Error(
        `Schedule is not possible. ${numberOfShiftsNeeded} shifts needed, ${numberOfShiftsAvailable} shifts available`
      );
    }
  }

  abstract generateSchedule(): Promise<ScheduleEntity>;

  protected getDateForDay(dayOfWeek: DayOfWeek): Date {
    const today = new Date();
    const days = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    const targetDay = days.indexOf(dayOfWeek);
    const currentDay = today.getDay();
    const daysToAdd = (targetDay + 7 - currentDay) % 7;

    const date = new Date(today);
    date.setDate(today.getDate() + daysToAdd);
    return date;
  }

  protected createShift(
    nurseId: number,
    date: Date,
    type: ShiftType,
    dayOfWeek: DayOfWeek
  ): ShiftEntity {
    const shift = new ShiftEntity();
    shift.date = date;
    shift.type = type;
    shift.dayOfWeek = dayOfWeek;
    shift.nurse = { id: nurseId } as NurseEntity;
    return shift;
  }
}
