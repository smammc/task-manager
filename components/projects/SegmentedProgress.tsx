interface SegmentedProgressProps {
  completed: number
  total: number
}

export function SegmentedProgress({ completed, total }: SegmentedProgressProps) {
  // Ensure completed and total are always numbers
  const safeCompleted = typeof completed === 'number' && !isNaN(completed) ? completed : 0
  const safeTotal = typeof total === 'number' && !isNaN(total) ? total : 0

  // No rendering if no subtasks (handled by parent)
  if (!safeTotal || safeTotal === 0) {
    return null
  }

  const percent = Math.round((safeCompleted / safeTotal) * 100)

  return (
    <div className="flex items-center gap-2">
      {/* Bar with segments */}
      <div className="flex flex-1">
        {Array.from({ length: safeTotal }).map((_, idx) => {
          const isCompleted = idx < safeCompleted
          return (
            <div
              key={idx}
              className={`mx-[1px] h-2 flex-1 rounded-sm transition-colors ${
                isCompleted ? 'bg-green-500' : 'bg-gray-200'
              }`}
            ></div>
          )
        })}
      </div>
      {/* Percentage */}
      <span className="text-xs text-gray-600">{percent}%</span>
    </div>
  )
}
