import { MigrationInterface, QueryRunner } from "typeorm";
import {
  getShiftRequirementSeeds,
  convertToDbFormat,
} from "../seeds/shift-requirements.seed";

export class SeedShiftRequirements1748922613270 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const requirements = getShiftRequirementSeeds();

    for (const requirement of requirements) {
      const dbRequirement = convertToDbFormat(requirement);

      await queryRunner.query(
        `INSERT INTO shift_requirements (shift, dayOfWeek, nursesRequired) 
                 VALUES (?, ?, ?)`,
        [
          dbRequirement.shift,
          dbRequirement.dayOfWeek,
          dbRequirement.nursesRequired,
        ]
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove all seeded data
    await queryRunner.query(`DELETE FROM shift_requirements`);
  }
}
