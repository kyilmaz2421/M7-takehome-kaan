import {
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
} from "typeorm";

import { ShiftEntity } from "../shift/shift.entity";

export enum SchedulingAlgorithm {
  HEURISTIC = "heuristic",
  ILP = "ilp",
}

@Entity("schedules")
export class ScheduleEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: "enum",
    enum: SchedulingAlgorithm,
    default: SchedulingAlgorithm.HEURISTIC,
  })
  schedulingAlgorithm: SchedulingAlgorithm;

  @OneToMany(() => ShiftEntity, (shift) => shift.schedule, {
    eager: true,
    cascade: true, // This will automatically save the shifts when the schedule is saved
  })
  shifts: ShiftEntity[];

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  updated: Date;
}
