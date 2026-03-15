import { createServerFn, createServerOnlyFn } from '@tanstack/react-start'
import { redirect } from '@tanstack/react-router'
import { useAppSession } from './session'
import { db } from '../database/db'
import { eq } from 'drizzle-orm'
import { usersTable } from '../database/schema'
import bcrypt from 'bcryptjs'

export const getCurrentUser = createServerFn({ method: 'GET' }).handler(
  async () => {
    const session = await useAppSession()
    const userId = session.data.userId

    if (!userId) {
      return null
    }
    const user = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, userId),
    })

    return user
  },
)

export const authenticate = createServerOnlyFn(
  async (email: string, password: string) => {
    const user = await db.query.usersTable.findFirst({
      where: eq(usersTable.email, email),
    })

    if (!user) {
      return null
    }

    const isValidPassword = await bcrypt.compare(password, user.password)
    return isValidPassword ? user : null
  },
)

export const signOut = createServerFn({ method: 'POST' }).handler(async () => {
  const session = useAppSession()
  ;(await session).clear()
  throw redirect({ to: '/sign-in' })
})
