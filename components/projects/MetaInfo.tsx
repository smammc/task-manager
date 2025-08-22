import React from 'react'

export interface MetaInfoProps {
  icon: React.ReactNode
  label: string
  value: string | number
}

/**
 * Renders a label-value pair with an icon for project meta information.
 */
export function MetaInfo({ icon, label, value }: MetaInfoProps) {
  return (
    <div className="flex items-center gap-1 text-sm text-gray-600">
      {icon}
      <span className="font-medium">{label}:</span> {value}
    </div>
  )
}
