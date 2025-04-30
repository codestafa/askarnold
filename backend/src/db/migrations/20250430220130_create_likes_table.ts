import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('likes', (table: Knex.TableBuilder) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable();
    table.integer('post_id').unsigned().notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.unique(['user_id', 'post_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('likes');
}