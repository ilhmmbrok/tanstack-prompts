import { useSession } from '@tanstack/react-start/server'

type SessionData = {
  userId?: string
}

export function useAppSession() {
  return useSession<SessionData>({
    name: 'prompt-app-session',
    password: process.env.SESSION_SECRET!,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      httpOnly: true,
    },
  })
}
