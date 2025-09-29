import { MigrationInterface, QueryRunner } from "typeorm";

export class InitProducts1759159749054 implements MigrationInterface {
    name = 'InitProducts1759159749054'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."UQ_products_name_lower_active"`);
        await queryRunner.query(`DROP INDEX "public"."UQ_products_sku_lower_active"`);
        await queryRunner.query(`DROP INDEX "public"."UQ_products_barcode_active"`);
        await queryRunner.query(`ALTER TABLE "products" ADD "unit" character varying(8)`);
        await queryRunner.query(`ALTER TABLE "products" ADD "cost" numeric(12,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "products" ADD "vat" numeric(4,1) NOT NULL DEFAULT '21'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "vat"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "cost"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "unit"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_products_barcode_active" ON "products" ("barcode") WHERE ((deleted_at IS NULL) AND (barcode IS NOT NULL))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_products_sku_lower_active" ON "products" ("skuLower") WHERE (deleted_at IS NULL)`);
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_products_name_lower_active" ON "products" ("nameLower") WHERE (deleted_at IS NULL)`);
    }

}
