import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("messages", (table) => {
    table.integer("conversation_id").unsigned().nullable();
    table.integer("reply_to_message_id").unsigned().nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("messages", (table) => {
    table.dropColumn("conversation_id");
    table.dropColumn("reply_to_message_id");
  });
}
