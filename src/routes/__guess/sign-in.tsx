import { authenticate } from '#/lib/auth'
import { Alert, AlertDescription, AlertTitle } from '#/components/selia/alert'
import { Button } from '#/components/selia/button'
import {
  Card,
  CardBody,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/selia/card'
import { Field, FieldError, FieldLabel } from '#/components/selia/field'
import { Form } from '#/components/selia/form'
import { Input } from '#/components/selia/input'
import { Text, TextLink } from '#/components/selia/text'
import { useAppSession } from '#/lib/session'
import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { createServerFn, useServerFn } from '@tanstack/react-start'
import { XCircleIcon } from 'lucide-react'
import type React from 'react'
import { useState } from 'react'
import z from 'zod'

const SignInInputSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
})

const signIn = createServerFn({ method: 'POST' })
  .inputValidator(SignInInputSchema)
  .handler(async ({ data }) => {
    const authUser = await authenticate(data.email, data.password)

    if (!authUser) {
      return {
        error: 'Invalid credentials',
      }
    }
    const session = await useAppSession()
    await session.update({
      userId: authUser.id,
    })

    throw redirect({
      to: '/',
    })
  })

export const Route = createFileRoute('/__guess/sign-in')({
  component: RouteComponent,
  head: () => ({
    meta: [
      {
        title: 'Sign In',
      },
    ],
  }),
})

function RouteComponent() {
  const signInFn = useServerFn(signIn)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const formaData = new FormData(form)

    setError(null)
    try {
      setLoading(true)
      const signInRes = await signInFn({
        data: {
          email: formaData.get('email') as string,
          password: formaData.get('password') as string,
        },
      })
      if (signInRes.error) {
        setError(signInRes.error)
      }
    } catch {
      setError('Failed to sign in. Please try again')
    } finally {
      setLoading(false)
    }
  }
  return (
    <main className="w-full lg:h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-sm sm:max-w-md">
        <CardHeader align="center">
          <CardTitle>Sign in to your account</CardTitle>
          <CardDescription>Enter your email and password below</CardDescription>
        </CardHeader>
        <CardBody className="flex flex-col gap-5">
          {error && (
            <Alert variant="danger" className="mb-6">
              <XCircleIcon />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Form onSubmit={handleSubmit}>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                required
              />
              <FieldError match="valueMissing">Email is required</FieldError>
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="off"
                placeholder="Enter your password"
                required
              />
              <FieldError match="valueMissing">Password is required</FieldError>
            </Field>
            <Button
              variant="primary"
              type="submit"
              block
              size="lg"
              progress={loading}
            >
              Sign In
            </Button>
            <Text className="text-center">
              Don't have an account?{' '}
              <TextLink render={<Link to="/sign-up">Sign up</Link>} />
            </Text>
          </Form>
        </CardBody>
      </Card>
    </main>
  )
}
