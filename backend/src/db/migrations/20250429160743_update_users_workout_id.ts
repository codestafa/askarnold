
import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("users", (table) => {
    table
      .integer("main_workout_id")
      .unsigned()
      .references("id")
      .inTable("workout_plans")
      .onDelete("SET NULL")
      .nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("users", (table) => {
    table.dropColumn("main_workout_id");
  });
}
