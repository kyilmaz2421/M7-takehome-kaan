import * as fs from "fs";
import * as path from "path";
import { Injectable, NotImplementedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ShiftEntity, ShiftRequirements } from "./shift.entity";

@Injectable()
export class ShiftService {
  constructor(
    @InjectRepository(ShiftEntity)
    private readonly shiftRepository: Repository<ShiftEntity>
  ) {}

  async getAllShifts() {
    return this.shiftRepository.find();
  }

  async getShiftsByNurse(nurseId: string) {
    throw new NotImplementedException();
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

  async getShiftRequirements(): Promise<ShiftRequirements[]> {
    const filePath = path.join(
      process.cwd(),
      "./src/shift/shiftRequirements.json"
    );
    const fileContents = fs.readFileSync(filePath, "utf8");
    const shiftRequirements: ShiftRequirements[] =
      JSON.parse(fileContents)["shiftRequirements"];
    return shiftRequirements;
  }
}
