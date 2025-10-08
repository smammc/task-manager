'use client'

import { useProjects } from '@/hooks/useProjects'
import React, { useState } from 'react'
import { ProjectGrid } from '@/components/grid/ProjectGrid'
import { CreateProjectModal } from '@/components/projects/CreateProjectModal'
import { Plus } from 'lucide-react'
import { useUser } from '@/hooks/useUser'

export default function ProjectsPage() {
  const { data: projects, isLoading, isError, error, createProject, deleteProject } = useProjects()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { user } = useUser()

  const handleSuccess = async () => {}
  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold text-gray-900">Ongoing Projects</h1>
      <p className="mb-8 text-gray-600">View and manage your ongoing projects.</p>

      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Projects List</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-700"
        >
          <Plus className="h-4 w-4" />
          New Project
        </button>
      </div>

      {isLoading ? (
        <div className="text-sm text-gray-400">Loading projects...</div>
      ) : isError ? (
        <div className="text-sm text-red-500">{error?.message || 'Failed to load projects'}</div>
      ) : projects && projects.length > 0 ? (
        projects.map((project) => (
          <div key={project.id} className="mb-8">
            <ProjectGrid project={project} deleteProject={deleteProject} />
          </div>
        ))
      ) : (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <p className="mb-4 text-sm text-gray-500">No ongoing projects found.</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
          >
            <Plus className="h-4 w-4" />
            Create your first project
          </button>
        </div>
      )}

      <CreateProjectModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
        createProject={createProject}
        userId={user ? user.id : ''}
      />
    </div>
  )
}
