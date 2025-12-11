import { api } from './client'

export type FileType = 'PROFILE' | 'BANNER' | 'PROBLEM_IMAGE'

export interface CreatePresignedUrlRequest {
  type: FileType
  contentType: string
  size: number
}

export interface PresignedUrlResponse {
  uploadUrl: string
  fileUrl: string
  expiresIn: number
}

export const fileApi = {
  getPresignedUrl: (data: CreatePresignedUrlRequest) =>
    api.post<PresignedUrlResponse>('/files/presigned', data),

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
