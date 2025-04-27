import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("conversations", (table) => {
    table.dropForeign(["workout_plan_id"]);
  });

  await knex.schema.alterTable("conversations", (table) => {
    table.foreign("workout_plan_id").references("workout_plans.id").onDelete("SET NULL");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("conversations", (table) => {
    table.dropForeign(["workout_plan_id"]);
  });

  await knex.schema.alterTable("conversations", (table) => {
    table.foreign("workout_plan_id").references("workout_plans.id");
  });
}
