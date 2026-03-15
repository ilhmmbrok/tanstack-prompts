import type React from 'react'
import { Button } from './selia/button'
import { Field, FieldControl, FieldError, FieldLabel } from './selia/field'
import { Form } from './selia/form'
import { Input } from './selia/input'
import { Textarea } from './selia/textarea'
import { useEffect, useState } from 'react'

export function PromptForm({
  onSubmit,
  loading,
  data,
}: React.ComponentProps<typeof Form> & {
  loading?: boolean
  data?: {
    title: string
    content: string
  }
}) {
  const [titleValue, setTitleValue] = useState('')
  const [contentValue, setContentValue] = useState('')

  useEffect(() => {
    setTitleValue(data?.title || '')
    setContentValue(data?.content || '')
  }, [data])

  return (
    <Form onSubmit={onSubmit}>
      <Field>
        <FieldLabel htmlFor="title">Title</FieldLabel>
        <Input
          id="title"
          name="title"
          placeholder="Enter the prompt title"
          required
          value={titleValue}
          onChange={(e) => setTitleValue(e.target.value)}
        />
        <FieldError match="valueMissing">Title is required</FieldError>
      </Field>
      <Field>
        <FieldLabel htmlFor="content">Prompt</FieldLabel>
        <FieldControl
          render={
            <Textarea
              id="content"
              name="content"
              placeholder="Enter the prompt content"
              required
              value={contentValue}
              onChange={(e) => setContentValue(e.target.value)}
            />
          }
        />
        <FieldError match="valueMissing">Prompt is required</FieldError>
        <Button type="submit" className="mt-4" progress={loading}>
          {data?.title ? 'Update Prompt' : 'Create Prompt'}
        </Button>
      </Field>
    </Form>
  )
}
