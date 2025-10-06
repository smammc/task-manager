// Base row with optional expand/collapse support
import React, { useState } from 'react'
import type { ReactNode } from 'react'

export interface RowProps {
  children: ReactNode
  expandable?: boolean
  expandedContent?: ReactNode
  defaultExpanded?: boolean
  className?: string
  onToggle?: (expanded: boolean) => void
}

const Row: React.FC<RowProps> = ({
  children,
  expandable = false,
  expandedContent,
  defaultExpanded = false,
  className = '',
  onToggle,
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded)

  const handleToggle = () => {
    if (expandable) {
      const newExpanded = !expanded
      setExpanded(newExpanded)
      onToggle?.(newExpanded)
    }
  }

  const baseClasses = 'border-b border-gray-200 hover:bg-gray-50 transition-colors'
  const expandableClasses = expandable ? 'cursor-pointer' : ''

  return (
    <>
      <tr className={`${baseClasses} ${expandableClasses} ${className}`} onClick={handleToggle}>
        {children}
      </tr>
      {expandable && expanded && expandedContent && (
        <tr className="border-b border-gray-200 bg-gray-50">
          <td colSpan={100} className="p-0">
            {expandedContent}
          </td>
        </tr>
      )}
    </>
  )
}

export default Row
