import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { ShiftEntity } from "../shift/shift.entity";
import { Preference } from "../shiftPreference/shift-preference.types";

@Entity("nurses")
export class NurseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 500 })
  name: string;

  @Column("json", { nullable: true })
  // This is a JSON string, but we want to deserialize it into a Preference[]
  // While I am not super familiar with TypeORM we have functions on the set preferences function to validate wqe only write a Preference[] | null into the database
  preferences: Preference[] | null;

  @OneToMany(() => ShiftEntity, (shift) => shift.nurse)
  shifts: ShiftEntity[];
}
