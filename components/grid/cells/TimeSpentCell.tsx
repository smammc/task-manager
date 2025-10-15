// components/grid/cells/TimeSpentCell.tsx
import React from 'react'
import { Clock } from 'lucide-react'

export interface TimeSpentCellProps {
  seconds: number
  className?: string
}

function formatTimeSpent(seconds: number): string {
  if (seconds === 0) return '0h'

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
  }
  return `${minutes}m`
}

export const TimeSpentCell: React.FC<TimeSpentCellProps> = ({ seconds, className }) => {
  const formattedTime = formatTimeSpent(seconds)
  const hasTime = seconds > 0

  return (
    <td className={`px-4 py-3 text-center text-sm ${className}`}>
      <div className="flex items-center justify-center gap-2 px-3 py-2">
        <Clock className={`h-4 w-4 ${hasTime ? 'text-blue-500' : 'text-gray-300'}`} />
        <span className={`text-sm ${hasTime ? 'font-medium text-gray-700' : 'text-gray-400'}`}>
          {formattedTime}
        </span>
      </div>
    </td>
  )
}
