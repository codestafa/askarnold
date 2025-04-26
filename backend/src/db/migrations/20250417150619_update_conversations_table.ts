import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("conversations", (table) => {
    table.timestamp("ended_at").nullable();
  });

}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("conversations", (table) => {
    table.dropColumn("ended_at");
  });

}

