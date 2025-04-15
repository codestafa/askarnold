import knex from 'knex'
import config from './knexfile'

const db = knex(config.development)

export { db }

export async function saveOrFetchUser(profile: any) {
  const existingUser = await db('users')
    .where({ google_id: profile.id })
    .first()

  if (existingUser) return existingUser

  const [newUser] = await db('users')
  .insert({
    google_id: profile.id,
    name: profile.displayName,
    email: profile.email,
    picture: profile.photos?.[0]?.value || null,
    username: profile.displayName?.toLowerCase().replace(/\s+/g, '') || null,
  })
  .returning('*');

  return newUser
}