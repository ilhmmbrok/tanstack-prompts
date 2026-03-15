import Header from '#/components/Header'
import { PromptForm } from '#/components/PromptForm'
import { Alert, AlertDescription, AlertTitle } from '#/components/selia/alert'
import { Button } from '#/components/selia/button'
import { Heading } from '#/components/selia/heading'
import { Separator } from '#/components/selia/separator'
import { db } from '#/database/db'
import { promptsTable } from '#/database/schema'
import { authMiddleware } from '#/middlewares/auth-middleware'
import {
  createFileRoute,
  Link,
  notFound,
  redirect,
} from '@tanstack/react-router'
import { createServerFn, useServerFn } from '@tanstack/react-start'
import { and, eq } from 'drizzle-orm'
import { ArrowLeftIcon, XCircleIcon } from 'lucide-react'
import { useState } from 'react'
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
        eq(promptsTable.userId, user.id),
        eq(promptsTable.id, data.promptId),
      ),
    })
    return prompt
  })

const UpdatePromptInputSchema = z.object({
  promptId: z.uuid(),
  title: z.string().min(1).max(100),
  content: z.string().min(1),
})

const updatePrompt = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(UpdatePromptInputSchema)
  .handler(async ({ data, context }) => {
    const { user } = context

    await db
      .update(promptsTable)
      .set({
        title: data.title,
        content: data.content,
      })
      .where(
        and(
          eq(promptsTable.id, data.promptId),
          eq(promptsTable.userId, user.id),
        ),
      )

    throw redirect({
      to: '/view/$promptId',
      params: {
        promptId: data.promptId,
      },
    })
  })

export const Route = createFileRoute('/__authed/edit/$promptId')({
  component: RouteComponent,
  loader: async ({ params }) => {
    const prompt = await getPrompt({ data: { promptId: params.promptId } })
    if (!prompt) {
      throw notFound()
    }
    return { prompt }
  },
  staleTime: 30000,
  notFoundComponent: () => (
    <div className="h-screen w-full left-0 fixed top-0 z-50 flex flex-col items-center justify-center gap-4">
      <Heading>Prompt not found</Heading>
      <div className="space-y-4 text-center">
        <Button
          className=""
          variant="secondary"
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
        title: `Edit: ${loaderData?.prompt.title}`,
      },
    ],
  }),
})

function RouteComponent() {
  const { prompt } = Route.useLoaderData()
  const params = Route.useParams()
  const updatePromptFn = useServerFn(updatePrompt)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    setLoading(true)
    try {
      await updatePromptFn({
        data: {
          promptId: params.promptId,
          title: formData.get('title') as string,
          content: formData.get('content') as string,
        },
      })
    } catch {
      setError('Failed to update prompt. Please try again')
    } finally {
      setLoading(false)
    }
  }
  return (
    <>
      <Header>
        <Heading>Edit Prompt</Heading>
        <Button
          variant="outline"
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
      {error && (
        <Alert variant="danger" className="mb-6">
          <XCircleIcon />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <PromptForm
        onSubmit={handleSubmit}
        loading={loading}
        data={{
          title: prompt.title,
          content: prompt.content,
        }}
      />
    </>
  )
}
