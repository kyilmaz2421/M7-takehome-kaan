import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ShiftRequirementEntity } from "./shift-requirement.entity";

@Injectable()
export class ShiftRequirementService {
  constructor(
    @InjectRepository(ShiftRequirementEntity)
    private shiftRequirementRepository: Repository<ShiftRequirementEntity>
  ) {}

  async findAll(): Promise<ShiftRequirementEntity[]> {
    console.log("findAll");
    return this.shiftRequirementRepository.find();
  }
}
