import { Controller, Get, Post, Body } from "@nestjs/common";
import { ShiftRequirementService } from "./shift-requirement.service";
import { ShiftRequirementEntity } from "./shift-requirement.entity";

@Controller("shift-requirements")
export class ShiftRequirementController {
  constructor(
    private readonly shiftRequirementService: ShiftRequirementService
  ) {}

  @Get()
  async findAll(): Promise<ShiftRequirementEntity[]> {
    return this.shiftRequirementService.findAll();
  }
}
