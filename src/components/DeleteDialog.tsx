import { Trash2Icon } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogClose,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogPopup,
  AlertDialogTitle,
} from './selia/alert-dialog'
import { IconBox } from './selia/icon-box'
import { Button } from './selia/button'
import { useDeleteStore } from '#/stores/DeleteStore'
import { createServerFn, useServerFn } from '@tanstack/react-start'
import z from 'zod'
import { useState } from 'react'
import { toastManager } from './selia/toast'
import { db } from '#/database/db'
import { promptsTable } from '#/database/schema'
import { and, eq } from 'drizzle-orm'
import { redirect } from '@tanstack/react-router'
import { authMiddleware } from '#/middlewares/auth-middleware'

const DeletePromptInputSchema = z.object({
  promptId: z.uuid(),
})

export const deletePrompt = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(DeletePromptInputSchema)
  .handler(async ({ data, context }) => {
    const { user } = context
    await db
      .delete(promptsTable)
      .where(
        and(
          eq(promptsTable.id, data.promptId),
          eq(promptsTable.userId, user.id),
        ),
      )
    throw redirect({
      to: '/',
    })
  })

export function DeleteDialog() {
  const beingDeleted = useDeleteStore((state) => state.beingDeleted)
  const setBeingDeleted = useDeleteStore((state) => state.setBeingDeleted)
  const deletePromptFn = useServerFn(deletePrompt)
  const [loading, setLoading] = useState(false)
  // const router = useRouter()

  async function handleDelete() {
    if (!beingDeleted) return
    try {
      setLoading(true)
      await deletePromptFn({ data: { promptId: beingDeleted.id } })
      toastManager.add({
        title: 'Prompt deleted',
        description: 'Prompt deleted successfully',
        type: 'success',
      })
      // router.invalidate()
    } catch (error) {
      console.error('error: ', error)
      toastManager.add({
        title: 'Error',
        description: 'Failed to delete prompt. Please try again',
        type: 'error',
      })
    } finally {
      setLoading(false)
      setBeingDeleted(null)
    }
  }

  return (
    <AlertDialog
      open={!!beingDeleted}
      onOpenChange={() => setBeingDeleted(null)}
    >
      <AlertDialogPopup>
        <AlertDialogHeader>
          <IconBox variant="danger">
            <Trash2Icon />
          </IconBox>
          <AlertDialogTitle>Delete Prompt</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogBody>
          <AlertDialogDescription>
            Do you want to delete "<strong>{beingDeleted?.title}</strong>""
          </AlertDialogDescription>
        </AlertDialogBody>
        <AlertDialogFooter>
          <AlertDialogClose>Cancel</AlertDialogClose>
          <AlertDialogClose
            render={
              <Button
                variant="danger"
                onClick={handleDelete}
                progress={loading}
              >
                Delete Prompt
              </Button>
            }
          />
        </AlertDialogFooter>
      </AlertDialogPopup>
    </AlertDialog>
  )
}
