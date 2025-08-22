import { Pencil, Trash } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Calendar } from 'lucide-react'
import { Project } from '@/types/project'
import { StatusBadge } from './StatusBadge'
import { MetaInfo } from './MetaInfo'
import { formatDate } from '@/lib/utils'
import { ProjectTasks } from './ProjectTasks'

interface ProjectCardProps {
  project: Project & {
    mainTasks?: { id: string; name: string }[]
  }
  currentUser?: { id: string } | null
  onEdit?: (project: Project) => void
  onDelete?: (project: Project) => void
}

export function ProjectCard({ project, currentUser, onEdit, onDelete }: ProjectCardProps) {
  const isOwner = currentUser && currentUser.id === project.ownerId

  return (
    <Card className="relative p-5 shadow-sm transition-shadow hover:shadow-md">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold">{project.name}</h3>
        <StatusBadge status={project.status} />
      </div>

      <p className="mb-3 text-sm text-gray-600">{project.description}</p>

      {/* Timeline */}
      <div className="mb-3 flex items-center gap-2 text-xs text-gray-500">
        <Calendar size={14} />
        <span>
          {formatDate(project.startDate ?? '', 'long')} →{' '}
          {project.endDate ? formatDate(project.endDate, 'long') : 'Ongoing'}
        </span>
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex flex-wrap gap-4">
          <MetaInfo icon={<span>👤</span>} label="Owner" value={project.ownerName} />
          <MetaInfo icon={<span>👥</span>} label="Team" value={project.teamName} />
        </div>
        <div className="flex gap-2">
          {isOwner && (
            <>
              <button
                className="rounded p-2 text-blue-600 transition hover:bg-blue-50"
                onClick={() => onEdit && onEdit(project)}
                title="Edit project"
              >
                <Pencil size={18} />
              </button>
              <button
                className="rounded p-2 text-red-600 transition hover:bg-red-50"
                onClick={() => onDelete && onDelete(project)}
                title="Delete project"
              >
                <Trash size={18} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Tasks Section */}
      <ProjectTasks projectId={project.id} isOwner={!!isOwner} />
    </Card>
  )
}
