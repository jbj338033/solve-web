'use client'

import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import { Plus, Loader2, Trash2, Pencil, X, Check } from 'lucide-react'
import { adminTagApi, type AdminTag } from '@/features/admin'
import { formatDateTime } from '@/shared/lib'

export default function AdminTagsPage() {
  const [tags, setTags] = useState<AdminTag[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newTagName, setNewTagName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')

  const loadTags = useCallback(async () => {
    try {
      const res = await adminTagApi.getTags()
      setTags(res)
    } catch {
      toast.error('태그 목록을 불러오지 못했습니다')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadTags()
  }, [loadTags])

  const handleCreate = async () => {
    if (!newTagName.trim()) return
    setIsCreating(true)
    try {
      await adminTagApi.createTag({ name: newTagName.trim() })
      setNewTagName('')
      toast.success('태그가 생성되었습니다')
      loadTags()
    } catch {
      toast.error('태그 생성에 실패했습니다')
    } finally {
      setIsCreating(false)
    }
  }

  const handleUpdate = async (tagId: string) => {
    if (!editingName.trim()) return
    try {
      await adminTagApi.updateTag(tagId, { name: editingName.trim() })
      setEditingId(null)
      toast.success('태그가 수정되었습니다')
      loadTags()
    } catch {
      toast.error('태그 수정에 실패했습니다')
    }
  }

  const handleDelete = async (tagId: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return
    try {
      await adminTagApi.deleteTag(tagId)
      setTags((prev) => prev.filter((t) => t.id !== tagId))
      toast.success('삭제되었습니다')
    } catch {
      toast.error('삭제에 실패했습니다')
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold">태그 관리</h1>
      </div>

      <div className="mb-6 flex gap-2">
        <input
          type="text"
          placeholder="새 태그 이름"
          value={newTagName}
          onChange={(e) => setNewTagName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          className="h-9 flex-1 rounded-lg border border-border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary"
        />
        <button
          onClick={handleCreate}
          disabled={isCreating || !newTagName.trim()}
          className="flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {isCreating ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
          추가
        </button>
      </div>

      {tags.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
          등록된 태그가 없습니다
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">이름</th>
                <th className="w-40 px-4 py-3 text-left text-sm font-medium text-muted-foreground">생성일</th>
                <th className="w-24 px-4 py-3 text-right text-sm font-medium text-muted-foreground">작업</th>
              </tr>
            </thead>
            <tbody>
              {tags.map((tag) => (
                <tr
                  key={tag.id}
                  className="border-b border-border last:border-0 hover:bg-muted/30"
                >
                  <td className="px-4 py-3">
                    {editingId === tag.id ? (
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleUpdate(tag.id)}
                        autoFocus
                        className="h-8 w-full rounded border border-border bg-background px-2 text-sm outline-none focus:border-primary"
                      />
                    ) : (
                      <span className="text-sm">{tag.name}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {formatDateTime(tag.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {editingId === tag.id ? (
                        <>
                          <button
                            onClick={() => handleUpdate(tag.id)}
                            className="rounded p-1.5 text-green-600 hover:bg-green-50"
                          >
                            <Check className="size-4" />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="rounded p-1.5 text-muted-foreground hover:bg-muted"
                          >
                            <X className="size-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setEditingId(tag.id)
                              setEditingName(tag.name)
                            }}
                            className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                          >
                            <Pencil className="size-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(tag.id)}
                            className="rounded p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
