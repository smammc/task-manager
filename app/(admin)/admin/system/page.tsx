import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export default function AdminSystemPage() {
  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold text-gray-900">System Settings</h1>
      <p className="mb-8 text-gray-600">Configure system-wide settings and maintenance options.</p>

      <div className="space-y-6">
        <Card className="border-l-4 border-red-500">
          <h2 className="mb-4 text-xl font-semibold text-red-700">Danger Zone</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Maintenance Mode</h3>
                <p className="text-sm text-gray-600">Put the application in maintenance mode</p>
              </div>
              <Button className="rounded bg-red-600 text-white hover:bg-red-700">Enable</Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Clear Cache</h3>
                <p className="text-sm text-gray-600">Clear all application caches</p>
              </div>
              <Button className="rounded bg-orange-600 text-white hover:bg-orange-700">
                Clear
              </Button>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 text-xl font-semibold">Application Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Site Name</label>
              <input
                type="text"
                defaultValue="MyApp Admin"
                className="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Max Users</label>
              <input
                type="number"
                defaultValue="10000"
                className="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>
            <Button className="bg-red-600 hover:bg-red-700">Save System Settings</Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
