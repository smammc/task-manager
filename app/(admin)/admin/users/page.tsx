import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export default function AdminUsersPage() {
  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold text-gray-900">User Management</h1>
      <p className="mb-8 text-gray-600">Advanced user administration and moderation tools.</p>

      <Card>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold">All Users</h2>
          <div className="flex gap-2">
            <Button className="rounded bg-red-600 text-white hover:bg-red-700">Bulk Actions</Button>
            <Button className="text-sm">Export Data</Button>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded border bg-gray-50 p-4">
            <div className="flex items-center gap-3">
              <input type="checkbox" className="rounded" />
              <div>
                <p className="font-medium">John Doe</p>
                <p className="text-sm text-gray-600">john@example.com • Joined 2 months ago</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-green-100 px-2 py-1 text-sm text-green-800">Active</span>
              <Button className="rounded bg-red-100 text-sm text-red-800 hover:bg-red-200">
                Suspend
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-between rounded border bg-gray-50 p-4">
            <div className="flex items-center gap-3">
              <input type="checkbox" className="rounded" />
              <div>
                <p className="font-medium">Jane Smith</p>
                <p className="text-sm text-gray-600">jane@example.com • Joined 1 month ago</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-yellow-100 px-2 py-1 text-sm text-yellow-800">
                Pending
              </span>
              <Button className="rounded bg-green-100 text-sm text-green-800 hover:bg-green-200">
                Approve
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
