import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  NotImplementedException,
  BadRequestException,
} from "@nestjs/common";
import { ScheduleService } from "./services/schedule.service";
import { ShiftRequirements } from "../shift/shift.entity";
import { Preference } from "../shiftPreference/shift-preference.types";
import { ScheduleEntity } from "./schedule.entity";

@Controller("schedules")
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get()
  async getSchedules(): Promise<ScheduleEntity[]> {
    return this.scheduleService.getSchedules();
  }

  @Get("/latest")
  async getMostRecentSchedules(): Promise<ScheduleEntity[]> {
    return this.scheduleService.getMostRecentSchedules();
  }

  @Get("/:id")
  async getSchedule(@Param("id") id: number): Promise<ScheduleEntity> {
    return this.scheduleService.getScheduleById(id);
  }

  @Post("/generate")
  async generateSchedule(
    // FOR NOW WE WILL HARD CODE DATES, BUT IN THE FUTURE WE WILL ALLOW THE USER TO SELECT THE DATES
    @Body("requirements") requirements: ShiftRequirements[],
    @Body("nurseToPreferences")
    nurseToPreferences: { nurseId: number; preferences: Preference[] }[]
  ): Promise<ScheduleEntity[]> {
    const heuristicSchedule =
      await this.scheduleService.generateScheduleHeuristic(
        requirements,
        nurseToPreferences
      );
    const ilpSchedule = await this.scheduleService.generateScheduleILP(
      requirements,
      nurseToPreferences
    );
    return [heuristicSchedule, ilpSchedule];
  }
}
