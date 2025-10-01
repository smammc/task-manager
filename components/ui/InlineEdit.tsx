import React, { useState } from 'react'
import { Check, X } from 'lucide-react'

interface InlineEditProps {
  initialValue?: string
  onSubmit: (newValue: string) => Promise<void>
  onCancel: () => void
  placeholder?: string
}

export const InlineEdit: React.FC<InlineEditProps> = ({
  initialValue = '',
  onSubmit,
  onCancel,
  placeholder = 'Enter name...',
}) => {
  const [editValue, setEditValue] = useState(initialValue)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editValue.trim() || editValue === initialValue) {
      onCancel()
      return
    }

    setSaving(true)
    try {
      await onSubmit(editValue.trim())
      onCancel() // Close the edit form after successful save
    } catch (error) {
      console.error('Failed to save:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setEditValue(initialValue)
    onCancel()
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        type="text"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:outline-none"
        placeholder={placeholder}
        disabled={saving}
        autoFocus
        required
        minLength={2}
      />
      <button
        type="submit"
        disabled={saving || !editValue.trim() || editValue === initialValue}
        className="flex h-8 w-8 items-center justify-center rounded bg-blue-500 text-white transition-colors hover:bg-blue-600 disabled:opacity-50"
        title="Save"
      >
        {saving ? (
          <div className="h-3 w-3 animate-spin rounded-full border border-white border-t-transparent"></div>
        ) : (
          <Check className="h-3 w-3" />
        )}
      </button>
      <button
        type="button"
        onClick={handleCancel}
        disabled={saving}
        className="flex h-8 w-8 items-center justify-center rounded border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50"
        title="Cancel"
      >
        <X className="h-3 w-3" />
      </button>
    </form>
  )
}
