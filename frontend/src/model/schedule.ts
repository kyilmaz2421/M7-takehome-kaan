import { Shift } from "./shift";

export enum SchedulingAlgorithm {
  HEURISTIC = "heuristic",
  ILP = "ilp",
}

export interface Schedule {
  id: number;
  created: Date;
  updated: Date;
  shifts: Shift[];
  schedulingAlgorithm: SchedulingAlgorithm;
}
