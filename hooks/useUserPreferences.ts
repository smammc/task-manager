import { useState } from 'react'

export function useUserPreferences(
  _projectId: string,
  initial: 'condensed' | 'kanban' = 'condensed',
) {
  const [viewMode, setViewMode] = useState<'condensed' | 'kanban'>(initial)
  return { viewMode, setViewMode }
}
