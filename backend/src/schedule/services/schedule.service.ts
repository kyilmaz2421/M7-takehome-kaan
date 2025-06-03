import {
  NotImplementedException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ScheduleEntity, SchedulingAlgorithm } from "../schedule.entity";
import { Preference } from "../../shiftPreference/shift-preference.types";
import { ShiftRequirements } from "../../shift/shift.entity";
import { ScheduleGeneratorHeuristicService } from "./schedule-generator-hueristic.service";
import { ScheduleGeneratorILPService } from "./schedule-generator-ilp.service";
import { ScheduleGenerator } from "./schedule-generator.model";

@Injectable()
export class ScheduleService {
  constructor(
    @InjectRepository(ScheduleEntity)
    private readonly scheduleRepository: Repository<ScheduleEntity>
  ) {}

  async generateScheduleHeuristic(
    requirements: ShiftRequirements[],
    nurseToPreferences: { nurseId: number; preferences: Preference[] }[]
  ): Promise<ScheduleEntity> {
    const scheduleGenerator = new ScheduleGeneratorHeuristicService(
      requirements,
      nurseToPreferences
    );
    return this.generateSchedule(scheduleGenerator);
  }

  async generateScheduleILP(
    requirements: ShiftRequirements[],
    nurseToPreferences: { nurseId: number; preferences: Preference[] }[]
  ): Promise<ScheduleEntity> {
    const scheduleGenerator = new ScheduleGeneratorILPService(
      requirements,
      nurseToPreferences
    );
    return this.generateSchedule(scheduleGenerator);
  }

  async generateSchedule(
    scheduleGenerator: ScheduleGenerator
  ): Promise<ScheduleEntity> {
    const schedule = await scheduleGenerator.generateSchedule();
    return await this.scheduleRepository.save(schedule);
  }

  async getSchedules(): Promise<ScheduleEntity[]> {
    const schedules = await this.scheduleRepository.find({
      order: { created: "DESC" },
    });
    if (!schedules || schedules.length === 0) {
      throw new NotFoundException("No schedules found");
    }
    return schedules;
  }

  async getScheduleById(id: number): Promise<ScheduleEntity> {
    const schedule = await this.scheduleRepository.findOne({ where: { id } });
    if (!schedule) {
      throw new NotFoundException("Schedule not found");
    }
    return schedule;
  }

  async getMostRecentSchedules(): Promise<ScheduleEntity[]> {
    const schedules = [];
    const heuristicSchedule = await this.scheduleRepository.find({
      order: { created: "DESC" },
      take: 1,
      where: {
        schedulingAlgorithm: SchedulingAlgorithm.HEURISTIC,
      },
    });
    if (heuristicSchedule.length > 0) schedules.push(heuristicSchedule[0]);
    const ilpSchedule = await this.scheduleRepository.find({
      order: { created: "DESC" },
      take: 1,
      where: {
        schedulingAlgorithm: SchedulingAlgorithm.ILP,
      },
    });
    if (ilpSchedule.length > 0) schedules.push(ilpSchedule[0]);

    if (!schedules || schedules.length === 0) {
      throw new NotFoundException("No schedules found");
    }
    return schedules;
  }

  // WAS Unable to complete this in time
  async getScheduleRequirements(): Promise<any> {
    // TODO: Complete the implementation of this method
    // Schedule requirements can be hard-coded
    // Requirements must indicate the number of nurses required for each shift type on each day of a week
    // Create the requirements as JSON and make it available via this method
    throw new NotImplementedException();
  }
}
