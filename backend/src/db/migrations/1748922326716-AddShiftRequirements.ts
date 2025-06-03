import { MigrationInterface, QueryRunner } from "typeorm";

export class AddShiftRequirements1748922326716 implements MigrationInterface {
  name = "AddShiftRequirements1748922326716";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`shift_requirements\` (\`id\` int NOT NULL AUTO_INCREMENT, \`shift\` enum ('day', 'night') NOT NULL, \`dayOfWeek\` enum ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday') NOT NULL, \`nursesRequired\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`shift_requirements\``);
  }
}
