import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSchedulingAlgorithmType1748895350757
  implements MigrationInterface
{
  name = "AddSchedulingAlgorithmType1748895350757";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`schedules\` ADD \`schedulingAlgorithm\` enum ('heuristic', 'ilp') NOT NULL DEFAULT 'heuristic'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`schedules\` DROP COLUMN \`schedulingAlgorithm\``
    );
  }
}
