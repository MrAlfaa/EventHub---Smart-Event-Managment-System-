import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string = 'LKR'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'LKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    return 'Invalid date'
  }
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
