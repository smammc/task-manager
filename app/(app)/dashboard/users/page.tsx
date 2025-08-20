import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export default function UsersPage() {
  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold text-gray-900">User Management</h1>
      <p className="mb-8 text-gray-600">Manage your application users.</p>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Users List</h2>
          <Button className="text-sm">Add User</Button>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded bg-gray-50 p-3">
            <div>
              <p className="font-medium">John Doe</p>
              <p className="text-sm text-gray-600">john@example.com</p>
            </div>
            <span className="rounded bg-green-100 px-2 py-1 text-sm text-green-800">Active</span>
          </div>
          <div className="flex items-center justify-between rounded bg-gray-50 p-3">
            <div>
              <p className="font-medium">Jane Smith</p>
              <p className="text-sm text-gray-600">jane@example.com</p>
            </div>
            <span className="rounded bg-green-100 px-2 py-1 text-sm text-green-800">Active</span>
          </div>
        </div>
      </Card>
    </div>
  )
}
