import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function calculateProgress(processed: number, total: number): number {
  if (total === 0) return 0
  return Math.round((processed / total) * 100)
}

export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`
  } else {
    return `${seconds}s`
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'success':
    case 'completed':
      return 'text-green-600 bg-green-50'
    case 'failed':
    case 'error':
      return 'text-red-600 bg-red-50'
    case 'in_progress':
    case 'pending':
      return 'text-blue-600 bg-blue-50'
    case 'duplicate':
      return 'text-yellow-600 bg-yellow-50'
    default:
      return 'text-gray-600 bg-gray-50'
  }
}
