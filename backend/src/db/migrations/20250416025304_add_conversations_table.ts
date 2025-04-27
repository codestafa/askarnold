import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("conversations", (table) => {
    table.increments("id").primary();
    table.integer("user_id").unsigned().notNullable().references("id").inTable("users").onDelete("CASCADE");
    table.jsonb("messages").notNullable().defaultTo("[]"); // [{role, content, timestamp}]
    table.integer("workout_plan_id").unsigned().nullable().references("id").inTable("workout_plans");
    table.timestamp("created_at").defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("conversations");
}
