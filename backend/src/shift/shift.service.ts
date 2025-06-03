import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ShiftEntity } from "./shift.entity";

@Injectable()
export class ShiftService {
  constructor(
    @InjectRepository(ShiftEntity)
    private readonly shiftRepository: Repository<ShiftEntity>
  ) {}

  async getAllShifts() {
    return this.shiftRepository.find();
  }

  async getShiftsBySchedule(scheduleId: string) {
    return this.shiftRepository.find({
      where: {
        schedule: {
          id: parseInt(scheduleId),
        },
      },
    });
  }
}
