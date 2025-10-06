'use client'

import { TaskGrid } from '@/components/grid'
import { Task } from '@/types/task'
import { Project } from '@/types/project'
import { useState } from 'react'

export default function GridTestPage() {
  // Mock project data
  const mockProject: Project = {
    id: '1',
    teamId: 'team-1',
    teamName: 'Development Team',
    ownerId: 'user-1',
    ownerName: 'John Doe',
    name: 'Task Manager Redesign',
    description: 'Redesigning the task management system with a new grid interface',
    status: 'active',
    startDate: '2025-10-01',
    endDate: '2025-12-31',
  }

  // Mock tasks data with main tasks and subtasks
  const mockTasks: Task[] = [
    {
      id: 'task-1',
      projectId: '1',
      name: 'Design Phase',
      status: 'Completed',
      description: 'Complete UI/UX design',
      parentTaskId: null,
      categoryId: 'High',
      createdAt: '2025-10-01',
      updatedAt: '2025-10-05',
      totalCount: 3,
      completedCount: 3,
      deadline: '2025-10-15',
    },
    {
      id: 'task-1-1',
      projectId: '1',
      name: 'Create wireframes',
      status: 'Completed',
      parentTaskId: 'task-1',
      categoryId: 'Medium',
      createdAt: '2025-10-01',
      updatedAt: '2025-10-03',
      deadline: '2025-10-05',
    },
    {
      id: 'task-1-2',
      projectId: '1',
      name: 'Design mockups',
      status: 'Completed',
      parentTaskId: 'task-1',
      categoryId: 'High',
      createdAt: '2025-10-02',
      updatedAt: '2025-10-04',
      deadline: '2025-10-08',
    },
    {
      id: 'task-1-3',
      projectId: '1',
      name: 'User testing',
      status: 'Completed',
      parentTaskId: 'task-1',
      categoryId: 'Critical',
      createdAt: '2025-10-03',
      updatedAt: '2025-10-05',
      deadline: '2025-10-12',
    },
    {
      id: 'task-2',
      projectId: '1',
      name: 'Development Phase',
      status: 'In Progress',
      description: 'Implement the grid system',
      parentTaskId: null,
      categoryId: 'Critical',
      createdAt: '2025-10-05',
      updatedAt: '2025-10-06',
      totalCount: 4,
      completedCount: 2,
      deadline: '2025-11-15',
    },
    {
      id: 'task-2-1',
      projectId: '1',
      name: 'Setup base components',
      status: 'Completed',
      parentTaskId: 'task-2',
      categoryId: 'High',
      createdAt: '2025-10-05',
      updatedAt: '2025-10-06',
      deadline: '2025-10-10',
    },
    {
      id: 'task-2-2',
      projectId: '1',
      name: 'Build cell components',
      status: 'Completed',
      parentTaskId: 'task-2',
      categoryId: 'High',
      createdAt: '2025-10-06',
      updatedAt: '2025-10-06',
      deadline: '2025-10-12',
    },
    {
      id: 'task-2-3',
      projectId: '1',
      name: 'Create composite rows',
      status: 'In Progress',
      parentTaskId: 'task-2',
      categoryId: 'Medium',
      createdAt: '2025-10-06',
      updatedAt: '2025-10-06',
      deadline: '2025-10-14',
    },
    {
      id: 'task-2-4',
      projectId: '1',
      name: 'Integrate with API',
      status: 'Not Started',
      parentTaskId: 'task-2',
      categoryId: 'Critical',
      createdAt: '2025-10-06',
      updatedAt: '2025-10-06',
      deadline: '2025-10-20',
    },
    {
      id: 'task-3',
      projectId: '1',
      name: 'Testing & QA',
      status: 'Not Started',
      description: 'Quality assurance and bug fixes',
      parentTaskId: null,
      categoryId: 'High',
      createdAt: '2025-10-06',
      updatedAt: '2025-10-06',
      totalCount: 2,
      completedCount: 0,
      deadline: '2025-12-01',
    },
    {
      id: 'task-3-1',
      projectId: '1',
      name: 'Unit testing',
      status: 'Not Started',
      parentTaskId: 'task-3',
      categoryId: 'Medium',
      createdAt: '2025-10-06',
      updatedAt: '2025-10-06',
      deadline: '2025-11-25',
    },
    {
      id: 'task-3-2',
      projectId: '1',
      name: 'Integration testing',
      status: 'Not Started',
      parentTaskId: 'task-3',
      categoryId: 'High',
      createdAt: '2025-10-06',
      updatedAt: '2025-10-06',
      deadline: '2025-11-30',
    },
    {
      id: 'task-4',
      projectId: '1',
      name: 'Documentation',
      status: 'In Progress',
      description: 'Write comprehensive documentation',
      parentTaskId: null,
      categoryId: 'Low',
      createdAt: '2025-10-06',
      updatedAt: '2025-10-06',
      totalCount: 1,
      completedCount: 0,
      deadline: null,
    },
  ]

  const [tasks, setTasks] = useState<Task[]>(mockTasks)

  const handleEditTask = (taskId: string) => {
    console.log('Edit task:', taskId)
    alert(`Edit task: ${tasks.find((t) => t.id === taskId)?.name}`)
  }

  const handleDeleteTask = (taskId: string) => {
    console.log('Delete task:', taskId)
    if (confirm(`Are you sure you want to delete "${tasks.find((t) => t.id === taskId)?.name}"?`)) {
      setTasks(tasks.filter((t) => t.id !== taskId && t.parentTaskId !== taskId))
    }
  }

  const handleStartTimer = (taskId: string) => {
    console.log('Start timer for task:', taskId)
    alert(`Timer started for: ${tasks.find((t) => t.id === taskId)?.name}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Grid System Test Page</h1>
          <p className="mt-2 text-gray-600">Testing the new task grid component with mock data</p>
        </div>

        <TaskGrid
          project={mockProject}
          tasks={tasks}
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
          onStartTimer={handleStartTimer}
        />

        <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Features Demonstrated</h2>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>
              ✅ <strong>Project Header:</strong> Shows project details, status, team, owner, and
              progress
            </li>
            <li>
              ✅ <strong>Main Tasks with Subtasks:</strong> Click chevron to expand/collapse
              subtasks
            </li>
            <li>
              ✅ <strong>Progress Tracking:</strong> Visual progress bars with color coding
            </li>
            <li>
              ✅ <strong>Status Badges:</strong> Color-coded status indicators
            </li>
            <li>
              ✅ <strong>Due Dates:</strong> Smart date formatting with overdue warnings
            </li>
            <li>
              ✅ <strong>Priority Indicators:</strong> Visual priority levels with colored dots
            </li>
            <li>
              ✅ <strong>Action Buttons:</strong> Hover over rows to see edit, delete, and timer
              actions
            </li>
            <li>
              ✅ <strong>Sorting:</strong> Click column headers to sort (where enabled)
            </li>
            <li>
              ✅ <strong>Responsive Design:</strong> Tailwind CSS with hover effects and transitions
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
