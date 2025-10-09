// Progress cell with progress bar
import React from 'react'
import { z } from 'zod'

const ProgressSchema = z.object({
  completed: z.number().min(0),
  total: z.number().min(0),
})

export interface ProgressCellProps {
  completed: number
  total: number
  className?: string
}

const ProgressCell: React.FC<ProgressCellProps> = ({ completed, total, className = '' }) => {
  // Validate with Zod
  const validatedData = ProgressSchema.parse({ completed, total })

  const percentage =
    validatedData.total > 0 ? Math.round((validatedData.completed / validatedData.total) * 100) : 0

  const getProgressColor = (percentage: number) => {
    if (percentage === 100) return 'bg-green-500'
    if (percentage >= 50) return 'bg-blue-500'
    if (percentage > 0) return 'bg-yellow-500'
    return 'bg-gray-300'
  }

  return (
    <td className={`px-4 py-3 text-center text-sm ${className}`}>
      <div className="flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
          <div
            className={`h-full transition-all duration-300 ${getProgressColor(percentage)}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="min-w-[3rem] text-right text-xs font-medium text-gray-600">
          {completed}/{total}
        </span>
      </div>
    </td>
  )
}

export default ProgressCell
