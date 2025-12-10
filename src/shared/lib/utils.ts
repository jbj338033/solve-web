import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import 'dayjs/locale/ko'

dayjs.extend(utc)
dayjs.locale('ko')

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function parseDate(dateStr: string) {
  return dayjs.utc(dateStr).local()
}

export function formatDateTime(dateStr: string): string {
  return parseDate(dateStr).format('M월 D일 HH:mm')
}

export function formatDateTimeFull(dateStr: string): string {
  return parseDate(dateStr).format('YYYY.MM.DD HH:mm')
}

export function formatDate(dateStr: string): string {
  return parseDate(dateStr).format('YYYY.MM.DD')
}

export function formatDuration(startStr: string, endStr: string): string {
  const diff = parseDate(endStr).diff(parseDate(startStr), 'minute')
  const hours = Math.floor(diff / 60)
  const minutes = diff % 60
  return minutes === 0 ? `${hours}시간` : `${hours}시간 ${minutes}분`
}

export function formatRelativeTime(dateStr: string): string {
  const diff = parseDate(dateStr).diff(dayjs(), 'minute')
  const absDiff = Math.abs(diff)
  const hours = Math.floor(absDiff / 60)
  const minutes = absDiff % 60
  const timeStr = hours > 0 ? `${hours}시간 ${minutes}분` : `${minutes}분`
  return diff > 0 ? `${timeStr} 남음` : `${timeStr} 전`
}
