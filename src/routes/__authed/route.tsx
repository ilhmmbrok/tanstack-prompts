import { Button } from '#/components/selia/button'
import { Separator } from '#/components/selia/separator'
import { Text } from '#/components/selia/text'
import ThemeToggle from '#/components/ThemeToggle'
import { getCurrentUser, signOut } from '#/lib/auth'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'

export const Route = createFileRoute('/__authed')({
  beforeLoad: async () => {
    const user = await getCurrentUser()

    if (!user) {
      throw redirect({
        to: '/sign-in',
      })
    }
    return { user }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const logoutFn = useServerFn(signOut)
  const { user } = Route.useRouteContext()
  return (
    <div>
      <nav className="flex justify-between items-center">
        <Text className="font-semibold">Hello, {user.name}</Text>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="danger" size="md" onClick={() => logoutFn()}>
            Logout
          </Button>
        </div>
      </nav>
      <Separator className="my-6" />
      <Outlet />
    </div>
  )
}
