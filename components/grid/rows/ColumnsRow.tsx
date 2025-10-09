// Columns header row component
import React from 'react'
import ColumnHeader, { SortDirection } from '../ColumnHeader'

export interface ColumnConfig {
  key: string
  label: string
  sortable?: boolean
  align?: 'left' | 'center' | 'right'
}

export interface ColumnsRowProps {
  columns: ColumnConfig[]
  sortColumn?: string
  sortDirection?: SortDirection
  onSort?: (columnKey: string) => void
  className?: string
}

const ColumnsRow: React.FC<ColumnsRowProps> = ({
  columns,
  sortColumn,
  sortDirection,
  onSort,
  className = '',
}) => {
  const handleSort = (columnKey: string) => {
    if (onSort) {
      onSort(columnKey)
    }
  }

  return (
    <thead className={`bg-gray-50 ${className}`}>
      <tr>
        {columns.map((column) => (
          <ColumnHeader
            key={column.key}
            sortable={column.sortable}
            sortDirection={sortColumn === column.key ? sortDirection : null}
            onSort={() => handleSort(column.key)}
            align={column.align}
          >
            {column.label}
          </ColumnHeader>
        ))}
      </tr>
    </thead>
  )
}

export default ColumnsRow
