// Grid header with project details
import React from 'react'
import { Project } from '@/types/project'

export interface GridHeaderProps {
  project: Project
  taskCount?: number
  completedCount?: number
  className?: string
}

const GridHeader: React.FC<GridHeaderProps> = ({
  project,
  taskCount = 0,
  completedCount = 0,
  className = '',
}) => {
  const completionPercentage = taskCount > 0 ? Math.round((completedCount / taskCount) * 100) : 0

  const statusColors = {
    planning: 'bg-purple-100 text-purple-700 border-purple-300',
    active: 'bg-green-100 text-green-700 border-green-300',
    on_hold: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    completed: 'bg-blue-100 text-blue-700 border-blue-300',
    cancelled: 'bg-red-100 text-red-700 border-red-300',
    archived: 'bg-gray-100 text-gray-700 border-gray-300',
  }

  return (
    <div className={`border-b border-gray-200 bg-white px-6 py-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-900">{project.name}</h2>
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusColors[project.status]}`}
            >
              {project.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>
          {project.description && (
            <p className="mb-3 text-sm text-gray-600">{project.description}</p>
          )}
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <span className="font-medium">Team:</span>
              <span>{project.teamName}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Owner:</span>
              <span>{project.ownerName}</span>
            </div>
            {project.startDate && (
              <div className="flex items-center gap-2">
                <span className="font-medium">Start:</span>
                <span>{new Date(project.startDate).toLocaleDateString()}</span>
              </div>
            )}
            {project.endDate && (
              <div className="flex items-center gap-2">
                <span className="font-medium">End:</span>
                <span>{new Date(project.endDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm text-gray-500">Progress</div>
            <div className="text-2xl font-bold text-gray-900">{completionPercentage}%</div>
            <div className="text-xs text-gray-500">
              {completedCount} of {taskCount} tasks
            </div>
          </div>
          <div className="w-32">
            <div className="h-2 overflow-hidden rounded-full bg-gray-200">
              <div
                className={`h-full transition-all duration-300 ${
                  completionPercentage === 100 ? 'bg-green-500' : 'bg-blue-500'
                }`}
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GridHeader
