import { create } from 'zustand'

type DeleteData = {
  id: string
  title: string
}

type DeleteStore = {
  beingDeleted: DeleteData | null
  setBeingDeleted: (beingDeleted: DeleteData | null) => void
}

const useDeleteStore = create<DeleteStore>((set) => ({
  beingDeleted: null,
  setBeingDeleted: (beingDeleted) => set({ beingDeleted }),
}))

export type { DeleteData, DeleteStore }
export { useDeleteStore }
