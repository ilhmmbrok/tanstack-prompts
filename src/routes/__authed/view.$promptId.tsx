import Header from '#/components/Header'
import { Button } from '#/components/selia/button'
import { Heading } from '#/components/selia/heading'
import { Separator } from '#/components/selia/separator'
import { Text } from '#/components/selia/text'
import { db } from '#/database/db'
import { promptsTable } from '#/database/schema'
import { authMiddleware } from '#/middlewares/auth-middleware'
import { useDeleteStore } from '#/stores/DeleteStore'
import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { and, eq } from 'drizzle-orm'
import { ArrowLeftIcon } from 'lucide-react'
import z from 'zod'

const GetPromptInputSchema = z.object({
  promptId: z.uuid(),
})

const getPrompt = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .inputValidator(GetPromptInputSchema)
  .handler(async ({ data, context }) => {
    const { user } = context
    const prompt = await db.query.promptsTable.findFirst({
      where: and(
        eq(promptsTable.id, data.promptId),
        eq(promptsTable.userId, user.id),
      ),
    })
    return prompt
  })

export const Route = createFileRoute('/__authed/view/$promptId')({
  component: RouteComponent,
  loader: async ({ params }) => {
    try {
      const prompt = await getPrompt({ data: { promptId: params.promptId } })
      if (!prompt) {
        throw notFound()
      }
      return { prompt }
    } catch (error) {
      throw notFound()
    }
  },
  notFoundComponent: () => (
    <div className="h-screen w-full left-0 fixed top-0 z-50 flex flex-col items-center justify-center gap-4">
      <Heading>Prompt not found</Heading>
      <div className="space-y-4 text-center">
        <Button
          className=""
          variant="outline"
          nativeButton={false}
          render={
            <Link to="/">
              <ArrowLeftIcon />
              Back to home
            </Link>
          }
        />
      </div>
    </div>
  ),
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData?.prompt.title,
      },
    ],
  }),
})

function RouteComponent() {
  const params = Route.useParams()
  const { prompt } = Route.useLoaderData()
  const setBeingDeleted = useDeleteStore((state) => state.setBeingDeleted)
  return (
    <>
      <Header>
        <Heading>Prompt Detail</Heading>
        <Button
          variant="tertiary"
          nativeButton={false}
          render={
            <Link to="/">
              <ArrowLeftIcon />
              Back
            </Link>
          }
        />
      </Header>
      <Separator className="my-6" />
      <div className="space-y-5">
        <div>
          <Heading size="sm" level={2} className="text-dimmed">
            Prompt Title
          </Heading>
          <Text className="text-2xl font-semibold">{prompt.title}</Text>
        </div>
        <div>
          <Heading size="sm" level={2} className="text-dimmed">
            Prompt Content
          </Heading>
          <Text className="text-lg">{prompt.content}</Text>
        </div>
        <div>
          <Heading size="sm" level={2} className="text-dimmed">
            Created At
          </Heading>
          <Text className="text-sm">
            {prompt.createdAt.toLocaleDateString()}
          </Text>
        </div>
        <div>
          <Heading size="sm" level={2} className="text-dimmed">
            Updated At
          </Heading>
          <Text className="text-sm">
            {prompt.updatedAt.toLocaleDateString()}
          </Text>
        </div>
        <Separator />
        <footer className="flex gap-2">
          <Button
            variant="outline"
            nativeButton={false}
            block
            render={
              <Link to="/edit/$promptId" params={{ promptId: params.promptId }}>
                Edit
              </Link>
            }
          />
          <Button
            variant="danger"
            block
            onClick={() =>
              setBeingDeleted({
                id: params.promptId,
                title: 'Create',
              })
            }
          >
            Delete
          </Button>
        </footer>
      </div>
    </>
  )
}
