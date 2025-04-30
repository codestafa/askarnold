import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  const hasUsersAdopted = await knex.schema.hasColumn("workout_plans", "users_adopted");
  if (!hasUsersAdopted) {
    await knex.schema.alterTable("workout_plans", (table) => {
      table.integer("users_adopted").notNullable().defaultTo(0);
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  const hasUsersAdopted = await knex.schema.hasColumn("workout_plans", "users_adopted");
  if (hasUsersAdopted) {
    await knex.schema.alterTable("workout_plans", (table) => {
      table.dropColumn("users_adopted");
    });
  }

  const hasCreatedBy = await knex.schema.hasColumn("workout_plans", "created_by");
  if (hasCreatedBy) {
    await knex.schema.alterTable("workout_plans", (table) => {
      table.dropColumn("created_by");
    });
  }

  const hasIsDeleted = await knex.schema.hasColumn("workout_plans", "is_deleted");
  if (hasIsDeleted) {
    await knex.schema.alterTable("workout_plans", (table) => {
      table.dropColumn("is_deleted");
    });
  }
}
