import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";

import { NurseEntity } from "../nurse/nurse.entity";
import { ScheduleEntity } from "../schedule/schedule.entity";
import {
  ShiftType,
  DayOfWeek,
} from "../shiftPreference/shift-preference.types";

export type ShiftRequirements = {
  shift: ShiftType;
  dayOfWeek: DayOfWeek;
  nursesRequired: number;
};

@Entity("shifts")
export class ShiftEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "date" })
  date: Date;

  @Column({
    type: "enum",
    enum: DayOfWeek,
    enumName: "day_of_week_enum",
  })
  dayOfWeek: DayOfWeek;

  @Column({ type: "varchar", length: 10 })
  type: ShiftType;

  @ManyToOne(() => NurseEntity, (nurse) => nurse.shifts, {
    eager: true,
  })
  nurse: NurseEntity;

  @ManyToOne(() => ScheduleEntity, (schedule) => schedule.shifts)
  schedule: ScheduleEntity;
}
