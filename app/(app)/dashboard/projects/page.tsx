'use client'

import { useProjects } from '@/hooks/useProjects'
import { Button } from '@/components/ui/Button'
import { ProjectCard } from '@/components/projects/ProjectCard'
import { Card } from '@/components/ui/Card'
import { CreateProjectDrawer } from '@/components/projects/CreateProjectDrawer'
import React, { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Project } from '@/types/project'

export default function ProjectsPage() {
  const { data: projects, isLoading, isError, error, refetch } = useProjects()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editProject, setEditProject] = useState<Project | null>(null as Project | null)
  const { user: currentUser } = useAuth()

  const handleEdit = (project: Project) => {
    setEditProject(project)
    setDrawerOpen(true)
  }

  const handleDelete = async (project: Project) => {
    if (
      !window.confirm('Are you sure you want to delete this project? This action cannot be undone.')
    )
      return
    await fetch(`/api/projects/${project.id}`, { method: 'DELETE' })
    await refetch()
  }

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold text-gray-900">Ongoing Projects</h1>
      <p className="mb-8 text-gray-600">View and manage your ongoing projects.</p>

      <Card>
        <div className="m-2 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Projects List</h2>
          <Button className="text-sm" onClick={() => setDrawerOpen(true)}>
            Add Project
          </Button>
        </div>
        <div className="m-2 space-y-4">
          {isLoading ? (
            <div className="text-sm text-gray-400">Loading projects...</div>
          ) : isError ? (
            <div className="text-sm text-red-500">
              {error?.message || 'Failed to load projects'}
            </div>
          ) : projects && projects.length > 0 ? (
            projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                currentUser={currentUser}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))
          ) : (
            <div className="text-sm text-gray-400">No ongoing projects found.</div>
          )}
        </div>
      </Card>
      <CreateProjectDrawer
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false)
          setEditProject(null)
        }}
        onSuccess={refetch}
        project={editProject}
      />
    </div>
  )
}
