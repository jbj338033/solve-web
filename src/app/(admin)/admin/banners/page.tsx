'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { Plus, Loader2, Trash2, Pencil, X, Check, Upload, ImageIcon } from 'lucide-react'
import { adminBannerApi, type AdminBanner } from '@/features/admin'
import { fileApi } from '@/entities/file'

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<AdminBanner[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ name: '', description: '', imageUrl: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const loadBanners = useCallback(async () => {
    try {
      const res = await adminBannerApi.getBanners()
      setBanners(res)
    } catch {
      toast.error('배너 목록을 불러오지 못했습니다')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadBanners()
  }, [loadBanners])

  const resetForm = () => {
    setFormData({ name: '', description: '', imageUrl: '' })
    setShowForm(false)
    setEditingId(null)
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('이미지 파일만 업로드 가능합니다')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('파일 크기는 10MB 이하여야 합니다')
      return
    }

    setIsUploading(true)
    try {
      const imageUrl = await fileApi.upload(file, 'BANNER')
      setFormData((prev) => ({ ...prev, imageUrl }))
    } catch {
      toast.error('이미지 업로드에 실패했습니다')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.description.trim() || !formData.imageUrl.trim()) {
      toast.error('모든 필드를 입력해주세요')
      return
    }

    setIsSubmitting(true)
    try {
      if (editingId) {
        await adminBannerApi.updateBanner(editingId, formData)
        toast.success('배너가 수정되었습니다')
      } else {
        await adminBannerApi.createBanner(formData)
        toast.success('배너가 생성되었습니다')
      }
      resetForm()
      loadBanners()
    } catch {
      toast.error(editingId ? '배너 수정에 실패했습니다' : '배너 생성에 실패했습니다')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (banner: AdminBanner) => {
    setFormData({ name: banner.name, description: banner.description, imageUrl: banner.imageUrl })
    setEditingId(banner.id)
    setShowForm(true)
  }

  const handleDelete = async (bannerId: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return
    try {
      await adminBannerApi.deleteBanner(bannerId)
      setBanners((prev) => prev.filter((b) => b.id !== bannerId))
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
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold">배너 관리</h1>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="size-4" />
            배너 추가
          </button>
        )}
      </div>

      {showForm && (
        <div className="mb-6 rounded-lg border border-border p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-medium">{editingId ? '배너 수정' : '새 배너'}</h2>
            <button onClick={resetForm} className="text-muted-foreground hover:text-foreground">
              <X className="size-4" />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
              {formData.imageUrl ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="group relative cursor-pointer overflow-hidden rounded-lg"
                >
                  <Image
                    src={formData.imageUrl}
                    alt="Preview"
                    width={800}
                    height={200}
                    className="aspect-[4/1] w-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                    {isUploading ? (
                      <Loader2 className="size-6 animate-spin text-white" />
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-white">
                        <Upload className="size-4" />
                        이미지 변경
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="flex aspect-[4/1] w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border text-sm text-muted-foreground hover:border-primary hover:text-foreground disabled:opacity-50"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="size-5 animate-spin" />
                      업로드 중...
                    </>
                  ) : (
                    <>
                      <ImageIcon className="size-5" />
                      이미지 업로드 (4:1 비율 권장)
                    </>
                  )}
                </button>
              )}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <input
                type="text"
                placeholder="이름"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary"
              />
              <input
                type="text"
                placeholder="설명"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={resetForm}
                className="h-9 rounded-lg border border-border px-4 text-sm hover:bg-muted"
              >
                취소
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !formData.imageUrl}
                className="flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                {editingId ? '수정' : '추가'}
              </button>
            </div>
          </div>
        </div>
      )}

      {banners.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
          등록된 배너가 없습니다
        </div>
      ) : (
        <div className="space-y-4">
          {banners.map((banner) => (
            <div
              key={banner.id}
              className="group relative overflow-hidden rounded-lg border border-border"
            >
              <Image
                src={banner.imageUrl}
                alt={banner.name}
                width={1200}
                height={300}
                className="aspect-[4/1] w-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  onClick={() => handleEdit(banner)}
                  className="flex h-9 items-center gap-2 rounded-lg bg-white px-4 text-sm font-medium text-black hover:bg-white/90"
                >
                  <Pencil className="size-4" />
                  수정
                </button>
                <button
                  onClick={() => handleDelete(banner.id)}
                  className="flex h-9 items-center gap-2 rounded-lg bg-red-500 px-4 text-sm font-medium text-white hover:bg-red-600"
                >
                  <Trash2 className="size-4" />
                  삭제
                </button>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <h3 className="font-medium text-white">{banner.name}</h3>
                <p className="text-sm text-white/70">{banner.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
