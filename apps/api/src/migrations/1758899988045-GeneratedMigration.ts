import { MigrationInterface, QueryRunner } from "typeorm";

export class SoftDeleteUniqueIndexes1758999988045 implements MigrationInterface {
  public readonly transaction = false;

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "products"
      ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP NULL
    `);

    await queryRunner.query(`DROP INDEX IF EXISTS "UQ_products_name_lower_active"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "UQ_products_sku_lower_active"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "UQ_products_barcode_active"`);

    await queryRunner.query(`
      CREATE UNIQUE INDEX CONCURRENTLY "UQ_products_name_lower_active"
      ON "products" ("nameLower")
      WHERE "deleted_at" IS NULL
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX CONCURRENTLY "UQ_products_sku_lower_active"
      ON "products" ("skuLower")
      WHERE "deleted_at" IS NULL
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX CONCURRENTLY "UQ_products_barcode_active"
      ON "products" ("barcode")
      WHERE "deleted_at" IS NULL AND "barcode" IS NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "UQ_products_barcode_active"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "UQ_products_sku_lower_active"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "UQ_products_name_lower_active"`);
  }
}
