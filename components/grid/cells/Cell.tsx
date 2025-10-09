// Generic reusable cell component
import React from 'react'
import type { ReactNode } from 'react'

export interface CellProps {
  children: ReactNode
  className?: string
  align?: 'left' | 'center' | 'right'
}

const Cell: React.FC<CellProps> = ({ children, className = '', align = 'center' }) => {
  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }

  return (
    <td className={`px-4 py-3 text-sm text-gray-700 ${alignmentClasses[align]} ${className}`}>
      {children}
    </td>
  )
}

export default Cell
