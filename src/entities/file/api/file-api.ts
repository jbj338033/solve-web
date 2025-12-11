import { api } from '@/shared/api'

export type FileType = 'PROFILE' | 'BANNER' | 'PROBLEM_IMAGE'

export const fileApi = {
  getPresignedUrl: (data: { type: FileType; contentType: string; size: number }) =>
    api.post<{ uploadUrl: string; fileUrl: string; expiresIn: number }>('/files/presigned', data),

  upload: async (file: File, type: FileType): Promise<string> => {
    const { uploadUrl, fileUrl } = await fileApi.getPresignedUrl({
      type,
      contentType: file.type,
      size: file.size,
    })

    await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': file.type },
    })

    return fileUrl
  },
}
