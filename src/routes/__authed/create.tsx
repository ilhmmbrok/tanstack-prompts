import Header from '#/components/Header'
import { PromptForm } from '#/components/PromptForm'
import { Alert, AlertDescription, AlertTitle } from '#/components/selia/alert'
import { Button } from '#/components/selia/button'
import { Heading } from '#/components/selia/heading'
import { Separator } from '#/components/selia/separator'
import { db } from '#/database/db'
import { promptsTable } from '#/database/schema'
import { authMiddleware } from '#/middlewares/auth-middleware'
import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { createServerFn, useServerFn } from '@tanstack/react-start'
import { ArrowLeftIcon, XCircleIcon } from 'lucide-react'
import type React from 'react'
import { useState } from 'react'
import { z } from 'zod'

const PromptInputSchema = z.object({
  title: z.string().min(1).max(100),
  content: z.string().min(1),
})

const createPrompt = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(PromptInputSchema)
  .handler(async ({ data, context }) => {
    const { user } = context
    await new Promise((resolve) => setTimeout(resolve, 3000))
    await db.insert(promptsTable).values({
      title: data.title,
      content: data.content,
      userId: user.id,
    })

    throw redirect({
      to: '/',
    })
  })

export const Route = createFileRoute('/__authed/create')({
  component: RouteComponent,
  head: () => ({
    meta: [
      {
        title: 'Create Prompt',
      },
    ],
  }),
})

function RouteComponent() {
  const createPromptFn = useServerFn(createPrompt)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)

    setError(null)

    try {
      setLoading(true)
      await createPromptFn({
        data: {
          title: formData.get('title') as string,
          content: formData.get('content') as string,
        },
      })
    } catch {
      setError('Failed to create prompt. Please try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Header>
        <Heading>Create Prompt</Heading>
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
      <PromptForm onSubmit={handleSubmit} loading={loading} />
    </>
  )
}
