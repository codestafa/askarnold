import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('posts', (table) => {
    table.increments('id').primary();
    table.integer('user_id').notNullable();
    table.text('content').notNullable();
    table.text('image_url');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.integer('likes').defaultTo(0);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('posts');
}

