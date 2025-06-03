import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDayOfWeekToShifts1748917619909 implements MigrationInterface {
  name = "AddDayOfWeekToShifts1748917619909";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`shifts\` ADD \`dayOfWeek\` enum ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday') NOT NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`shifts\` DROP COLUMN \`dayOfWeek\``);
  }
}
