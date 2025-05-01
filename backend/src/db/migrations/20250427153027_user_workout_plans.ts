import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("adopted_plans", (table) => {
    table.increments("id").primary();
    table.integer("user_id").unsigned().notNullable()
      .references("id").inTable("users").onDelete("CASCADE");
    table.integer("workout_plan_id").unsigned().notNullable()
      .references("id").inTable("workout_plans").onDelete("RESTRICT");
    table.boolean("is_main").defaultTo(false);
    table.timestamp("adopted_at").defaultTo(knex.fn.now());
    table.unique(["user_id", "workout_plan_id"]);
  });

  await knex.schema.alterTable("workout_plans", (table) => {
    table.integer("created_by").unsigned()
      .references("id").inTable("users").onDelete("SET NULL");
    table.boolean("is_deleted").defaultTo(false);
  });

  const existingPlans = await knex("workout_plans").select("id", "user_id", "created_at");
  for (const plan of existingPlans) {
    await knex("adopted_plans").insert({
      user_id: plan.user_id,
      workout_plan_id: plan.id,
      is_main: false,
      adopted_at: plan.created_at,
    });
  }
  for (const plan of existingPlans) {
    await knex("workout_plans").where({ id: plan.id }).update({
      created_by: plan.user_id,
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("adopted_plans");

  const cols = await knex("information_schema.columns")
    .where({ table_name: "workout_plans" })
    .pluck("column_name");

  if (cols.includes("created_by")) {
    await knex.schema.alterTable("workout_plans", (table) => {
      table.dropColumn("created_by");
    });
  }

  if (cols.includes("is_deleted")) {
    await knex.schema.alterTable("workout_plans", (table) => {
      table.dropColumn("is_deleted");
    });
  }
}
