import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface EditorStore {
  language: string
  setLanguage: (language: string) => void
}

export const useEditorStore = create<EditorStore>()(
  persist(
    (set) => ({
      language: 'cpp',
      setLanguage: (language) => set({ language }),
    }),
    { name: 'editor-storage' }
  )
)
