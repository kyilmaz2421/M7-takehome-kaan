import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ShiftRequirementEntity } from "./shift-requirement.entity";
import { ShiftRequirementController } from "./shift-requirement.controller";
import { ShiftRequirementService } from "./shift-requirement.service";

@Module({
  imports: [TypeOrmModule.forFeature([ShiftRequirementEntity])],
  controllers: [ShiftRequirementController],
  providers: [ShiftRequirementService],
  exports: [ShiftRequirementService],
})
export class ShiftRequirementModule {}
