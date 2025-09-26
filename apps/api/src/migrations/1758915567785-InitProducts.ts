import { MigrationInterface, QueryRunner } from "typeorm";

export class InitProducts1758915567785 implements MigrationInterface {
    name = 'InitProducts1758915567785'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."products_status_enum" AS ENUM('ACTIVE', 'INACTIVE')`);
        await queryRunner.query(`CREATE TABLE "products" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(120) NOT NULL, "nameLower" character varying(120) NOT NULL, "sku" character varying(32) NOT NULL, "skuLower" character varying(32) NOT NULL, "barcode" character varying(14), "price" numeric(12,2) NOT NULL, "stock" integer NOT NULL DEFAULT '0', "description" text, "category" character varying(40), "status" "public"."products_status_enum" NOT NULL DEFAULT 'ACTIVE', "slug" character varying(140), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "version" integer NOT NULL, CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_d122650e3e40a2c880bdae6ef2" ON "products" ("barcode") WHERE "deleted_at" IS NULL AND "barcode" IS NOT NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_67f6668f8b02602a51e0b00df4" ON "products" ("skuLower") WHERE "deleted_at" IS NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_07a64255846d7fcd1f62eccc55" ON "products" ("nameLower") WHERE "deleted_at" IS NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_07a64255846d7fcd1f62eccc55"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_67f6668f8b02602a51e0b00df4"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d122650e3e40a2c880bdae6ef2"`);
        await queryRunner.query(`DROP TABLE "products"`);
        await queryRunner.query(`DROP TYPE "public"."products_status_enum"`);
    }

}
