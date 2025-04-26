import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("messages", (table) => {
    table.boolean("is_workout_plan").defaultTo(false);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("messages", (table) => {
    table.dropColumn("is_workout_plan");
  });
}
