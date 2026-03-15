import Header from '#/components/Header'
import { Button } from '#/components/selia/button'
import { Card } from '#/components/selia/card'
import { Heading } from '#/components/selia/heading'
import {
  Item,
  ItemAction,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from '#/components/selia/item'
import { Menu, MenuItem, MenuPopup, MenuTrigger } from '#/components/selia/menu'
import { Separator } from '#/components/selia/separator'
import { Stack } from '#/components/selia/stack'
import { db } from '#/database/db'
import { promptsTable } from '#/database/schema'
import { useDeleteStore } from '#/stores/DeleteStore'
import { createFileRoute, Link } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { and, desc, eq, ilike, or } from 'drizzle-orm'
import {
  EllipsisVerticalIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
} from 'lucide-react'
import z from 'zod'
import { zodValidator } from '@tanstack/zod-adapter'
import { PromptSearch } from '#/components/PromptSearch'
import { authMiddleware } from '#/middlewares/auth-middleware'

const GetInputSchema = z.object({
  query: z.string().optional(),
})

const getPrompts = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .inputValidator(GetInputSchema)
  .handler(async ({ data, context }) => {
    const { user } = context
    const prompts = await db.query.promptsTable.findMany({
      where: and(
        eq(promptsTable.userId, user.id),
        data.query
          ? or(
              ilike(promptsTable.title, `%${data.query}%`),
              ilike(promptsTable.content, `%${data.query}%`),
            )
          : undefined,
      ),
      orderBy: [desc(promptsTable.createdAt)],
    })
    return prompts
  })

const PromptSearchSchema = z.object({
  query: z.string().optional(),
})

export const Route = createFileRoute('/__authed/')({
  component: App,
  validateSearch: zodValidator(PromptSearchSchema),
  loaderDeps: ({ search }) => ({ query: search.query }),
  loader: async ({ deps }) => {
    const prompts = await getPrompts({
      data: {
        query: deps.query,
      },
    })
    return { prompts }
  },
  head: () => ({
    meta: [
      {
        title: 'Prompts',
      },
    ],
  }),
})

function App() {
  const setBeingDeleted = useDeleteStore((state) => state.setBeingDeleted)
  const { prompts } = Route.useLoaderData()

  return (
    <>
      <Header>
        <Heading>Prompt</Heading>
        <div>
          <Button
            nativeButton={false}
            render={
              <Link to="/create">
                <PlusIcon /> Create Prompt
              </Link>
            }
          />
        </div>
      </Header>
      <Separator className="my-6" />
      <PromptSearch />
      {prompts.length > 0 ? (
        <Stack>
          {prompts.map((prompt) => (
            <Item key={prompt.id}>
              <ItemContent>
                <ItemTitle>{prompt.title}</ItemTitle>
                <ItemDescription>
                  {prompt.content.length > 100
                    ? prompt.content.slice(0, 100) + '...'
                    : prompt.content}
                </ItemDescription>
              </ItemContent>
              <ItemAction>
                <Button
                  variant="outline"
                  nativeButton={false}
                  size="sm"
                  render={
                    <Link to="/view/$promptId" params={{ promptId: prompt.id }}>
                      View
                    </Link>
                  }
                />
                <Menu>
                  <MenuTrigger
                    render={
                      <Button variant="outline" size="sm-icon">
                        <EllipsisVerticalIcon />
                      </Button>
                    }
                  />
                  <MenuPopup>
                    <MenuItem
                      render={
                        <Link
                          to="/edit/$promptId"
                          params={{
                            promptId: prompt.id,
                          }}
                        >
                          <PencilIcon />
                          Edit
                        </Link>
                      }
                    />
                    <MenuItem
                      className="text-danger"
                      onClick={() =>
                        setBeingDeleted({
                          id: prompt.id,
                          title: prompt.title,
                        })
                      }
                    >
                      <Trash2Icon className="text-danger" />
                      Delete
                    </MenuItem>
                  </MenuPopup>
                </Menu>
              </ItemAction>
            </Item>
          ))}
        </Stack>
      ) : (
        <Card className="h-40 justify-center items-center flex">
          <Button
            size="lg"
            nativeButton={false}
            variant="outline"
            className="h-30 mx-5 w-full border-dashed border-2 border-black/10 rounded justify-center items-center flex hover:border-black/50 dark:border-white/10 dark:hover:border-white/50"
            render={
              <Link to="/create">
                <PlusIcon />
                Tambah prompt baru
              </Link>
            }
          />
        </Card>
      )}
    </>
  )
}
