import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  const hasUsersAdopted = await knex.schema.hasColumn("workout_plans", "users_adopted");
  if (!hasUsersAdopted) {
    await knex.schema.alterTable("workout_plans", (table) => {
      table.integer("users_adopted").notNullable().defaultTo(0);
    });
  } else {
    await knex.raw(`
      ALTER TABLE workout_plans
      ALTER COLUMN users_adopted SET NOT NULL,
      ALTER COLUMN users_adopted SET DEFAULT 0
    `);
  }

  const hasIsDeleted = await knex.schema.hasColumn("workout_plans", "is_deleted");
  if (!hasIsDeleted) {
    await knex.schema.alterTable("workout_plans", (table) => {
      table.boolean("is_deleted").notNullable().defaultTo(false);
    });
  } else {
    await knex.raw(`
      ALTER TABLE workout_plans
      ALTER COLUMN is_deleted SET NOT NULL,
      ALTER COLUMN is_deleted SET DEFAULT false
    `);
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("workout_plans", (table) => {
    table.dropColumn("users_adopted");
    table.dropColumn("is_deleted");
  });
}
