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
import { db } from '#/database/db'
import { usersTable } from '#/database/schema'
import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { createServerFn, useServerFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'
import { XCircleIcon } from 'lucide-react'
import type React from 'react'
import { useState } from 'react'
import z from 'zod'
import bcrypt from 'bcryptjs'
import { useAppSession } from '#/lib/session'

const SignupInputSchema = z.object({
  name: z.string().min(1),
  email: z.email(),
  password: z.string().min(8),
})

const signup = createServerFn({ method: 'POST' })
  .inputValidator(SignupInputSchema)
  .handler(async ({ data }) => {
    // Cek email apakah sudah ada?
    const existingEmail = await db.query.usersTable.findFirst({
      where: eq(usersTable.email, data.email),
    })

    // Jika ada, kembalikan error
    if (existingEmail) {
      return {
        error: 'Email already in use',
      }
    }
    // Jika tidak ada, hash password
    const hashedPassword = await bcrypt.hash(data.password, 12)
    // Simpan user ke database
    const [newUser] = await db
      .insert(usersTable)
      .values({
        name: data.name,
        email: data.email,
        password: hashedPassword,
      })
      .returning()
    // Simpan session ke cookie
    const session = await useAppSession()
    await session.update({
      userId: newUser.id,
    })
    // Redirect ke sign-in
    throw redirect({
      to: '/',
    })
  })

export const Route = createFileRoute('/__guess/sign-up')({
  component: RouteComponent,
  head: () => ({
    meta: [
      {
        title: 'Sign Up',
      },
    ],
  }),
})

function RouteComponent() {
  const signupFn = useServerFn(signup)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    setError(null)
    try {
      setLoading(true)
      const signupRes = await signupFn({
        data: {
          name: formData.get('name') as string,
          email: formData.get('email') as string,
          password: formData.get('password') as string,
        },
      })

      if (signupRes.error) {
        setError(signupRes.error)
      }
    } catch (err) {
      setError('Failed to sign up. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="w-full lg:h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-sm sm:max-w-md">
        <CardHeader align="center">
          <CardTitle>Sign up to your account</CardTitle>
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
              <FieldLabel htmlFor="name">Fullname</FieldLabel>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Enter your fullname"
                required
              />
              <FieldError match="valueMissing">Name is required</FieldError>
            </Field>
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
                placeholder="Enter your password"
                autoComplete="off"
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
              Sign Up
            </Button>
            <Text className="text-center">
              Already have an account?{' '}
              <TextLink render={<Link to="/sign-in">Sign In</Link>} />
            </Text>
          </Form>
        </CardBody>
      </Card>
    </main>
  )
}
