import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1749043986852 implements MigrationInterface {
    name = 'InitialSchema1749043986852'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "username" character varying NOT NULL, "password" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "custom_gost34_types" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "code" character varying(2) NOT NULL, "name" character varying NOT NULL, "creationDate" TIMESTAMP NOT NULL DEFAULT now(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_b5f2e1ee5b731b421bee9baa097" UNIQUE ("code"), CONSTRAINT "PK_920c5ed77df472dfbb82755a567" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_b5f2e1ee5b731b421bee9baa09" ON "custom_gost34_types" ("code") `);
        await queryRunner.query(`CREATE TYPE "public"."products_standard_enum" AS ENUM('ЕСПД', 'ЕСКД', 'ГОСТ 34')`);
        await queryRunner.query(`CREATE TABLE "products" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "productName" character varying NOT NULL, "standard" "public"."products_standard_enum" NOT NULL, "registrationDate" TIMESTAMP NOT NULL DEFAULT now(), "comment" text, "espdClassifier" character varying, "espdProductSequentialPart" character varying, "fullEspdBaseDesignation" character varying, "eskdOrgCode" character varying, "eskdClassChar" character varying, "eskdBaseSerialNum" character varying, "fullEskdBaseDesignation" character varying, "gost34OrgCode" character varying, "gost34ClassCode" character varying, "gost34SystemRegNum" character varying, "fullGost34BaseDesignation" character varying, "bitrixTaskId" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_6fcdef99bbeb2737b1ad169ac1a" UNIQUE ("fullEspdBaseDesignation"), CONSTRAINT "UQ_98fc50ca7d614c4f97b02fada84" UNIQUE ("fullEskdBaseDesignation"), CONSTRAINT "UQ_d62d36a21d04eb45b0aaac4e28d" UNIQUE ("fullGost34BaseDesignation"), CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_28d893e121865ad6682c3b4244" ON "products" ("espdProductSequentialPart") `);
        await queryRunner.query(`CREATE INDEX "IDX_6fcdef99bbeb2737b1ad169ac1" ON "products" ("fullEspdBaseDesignation") `);
        await queryRunner.query(`CREATE INDEX "IDX_2de50b72decf0ddb8457e4d922" ON "products" ("eskdBaseSerialNum") `);
        await queryRunner.query(`CREATE INDEX "IDX_98fc50ca7d614c4f97b02fada8" ON "products" ("fullEskdBaseDesignation") `);
        await queryRunner.query(`CREATE INDEX "IDX_e57e14cfe1910b7dce28f96f19" ON "products" ("gost34SystemRegNum") `);
        await queryRunner.query(`CREATE INDEX "IDX_d62d36a21d04eb45b0aaac4e28" ON "products" ("fullGost34BaseDesignation") `);
        await queryRunner.query(`CREATE TYPE "public"."documents_selectedstandard_enum" AS ENUM('ЕСПД', 'ЕСКД', 'ГОСТ 34')`);
        await queryRunner.query(`CREATE TABLE "documents" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "designation" character varying NOT NULL, "productId" uuid NOT NULL, "productNameSnapshot" character varying NOT NULL, "docTypeCode" character varying NOT NULL, "docTypeName" character varying NOT NULL, "customDocName" character varying, "selectedStandard" "public"."documents_selectedstandard_enum" NOT NULL, "assignmentDate" TIMESTAMP NOT NULL DEFAULT now(), "comment" text, "espdDetails" jsonb, "eskdDetails" jsonb, "gost34Details" jsonb, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_5ce49db1bd1f3a17a79d53bc7db" UNIQUE ("designation"), CONSTRAINT "PK_ac51aa5181ee2036f5ca482857c" PRIMARY KEY ("id")); COMMENT ON COLUMN "documents"."selectedStandard" IS 'Standard of the parent product this document belongs to'`);
        await queryRunner.query(`CREATE INDEX "IDX_fd6dc9087decc400e45b68b439" ON "documents" ("productId") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_5ce49db1bd1f3a17a79d53bc7d" ON "documents" ("designation") `);
        await queryRunner.query(`ALTER TABLE "documents" ADD CONSTRAINT "FK_fd6dc9087decc400e45b68b4397" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "documents" DROP CONSTRAINT "FK_fd6dc9087decc400e45b68b4397"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5ce49db1bd1f3a17a79d53bc7d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_fd6dc9087decc400e45b68b439"`);
        await queryRunner.query(`DROP TABLE "documents"`);
        await queryRunner.query(`DROP TYPE "public"."documents_selectedstandard_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d62d36a21d04eb45b0aaac4e28"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e57e14cfe1910b7dce28f96f19"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_98fc50ca7d614c4f97b02fada8"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2de50b72decf0ddb8457e4d922"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_6fcdef99bbeb2737b1ad169ac1"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_28d893e121865ad6682c3b4244"`);
        await queryRunner.query(`DROP TABLE "products"`);
        await queryRunner.query(`DROP TYPE "public"."products_standard_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b5f2e1ee5b731b421bee9baa09"`);
        await queryRunner.query(`DROP TABLE "custom_gost34_types"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }

}
