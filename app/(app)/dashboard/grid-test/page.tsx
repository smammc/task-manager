'use client'

import { useProjects } from '@/hooks/useProjects'
import React from 'react'
import { ProjectGrid } from '@/components/grid/ProjectGrid'

export default function GridPage() {
  const { data: projects, isLoading, isError, error, createProject } = useProjects()

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold text-gray-900">Ongoing Projects</h1>
      <p className="mb-8 text-gray-600">View and manage your ongoing projects.</p>

      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Projects List</h2>
      </div>

      {isLoading ? (
        <div className="text-sm text-gray-400">Loading projects...</div>
      ) : isError ? (
        <div className="text-sm text-red-500">{error?.message || 'Failed to load projects'}</div>
      ) : projects && projects.length > 0 ? (
        projects.map((project) => (
          <div key={project.id} className="mb-8">
            <ProjectGrid project={project} />
          </div>
        ))
      ) : (
        <div className="text-sm text-gray-400">No ongoing projects found.</div>
      )}
    </div>
  )
}
