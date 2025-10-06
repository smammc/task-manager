// Individual column header component
import React from 'react'
import type { ReactNode } from 'react'

export type SortDirection = 'asc' | 'desc' | null

export interface ColumnHeaderProps {
  children: ReactNode
  className?: string
  sortable?: boolean
  sortDirection?: SortDirection
  onSort?: () => void
  align?: 'left' | 'center' | 'right'
}

const ColumnHeader: React.FC<ColumnHeaderProps> = ({
  children,
  className = '',
  sortable = false,
  sortDirection = null,
  onSort,
  align = 'left',
}) => {
  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }

  const baseClasses =
    'px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50'
  const sortableClasses = sortable ? 'cursor-pointer hover:bg-gray-100 select-none' : ''

  const handleClick = () => {
    if (sortable && onSort) {
      onSort()
    }
  }

  return (
    <th
      className={`${baseClasses} ${sortableClasses} ${alignmentClasses[align]} ${className}`}
      onClick={handleClick}
    >
      <div className="flex items-center gap-1">
        {children}
        {sortable && (
          <span className="text-gray-400">
            {sortDirection === 'asc' && '↑'}
            {sortDirection === 'desc' && '↓'}
            {sortDirection === null && '↕'}
          </span>
        )}
      </div>
    </th>
  )
}

export default ColumnHeader
