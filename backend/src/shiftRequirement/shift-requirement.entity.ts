import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import {
  ShiftType,
  DayOfWeek,
} from "../shiftPreference/shift-preference.types";

@Entity("shift_requirements")
export class ShiftRequirementEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: "enum",
    enum: ShiftType,
    enumName: "shift_type_enum",
  })
  shift: ShiftType;

  @Column({
    type: "enum",
    enum: DayOfWeek,
    enumName: "day_of_week_enum",
  })
  dayOfWeek: DayOfWeek;

  @Column({ type: "integer" })
  nursesRequired: number;
}
