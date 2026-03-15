import { createServerOnlyFn } from '@tanstack/react-start'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

const createDatabase = createServerOnlyFn(() =>
  drizzle(process.env.DATABASE_URL!, {
    schema,
  }),
)

export const db = createDatabase()
