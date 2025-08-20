import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export default function SettingsPage() {
  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold text-gray-900">Settings</h1>
      <p className="mb-8 text-gray-600">Configure your application settings.</p>

      <div className="space-y-6">
        <Card>
          <h2 className="mb-4 text-xl font-semibold">General Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Application Name
              </label>
              <input
                type="text"
                defaultValue="My Dashboard App"
                className="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
              <textarea
                rows={3}
                defaultValue="A modern dashboard application"
                className="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 text-xl font-semibold">Notifications</h2>
          <div className="space-y-3">
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" defaultChecked />
              Email notifications
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              SMS notifications
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" defaultChecked />
              Push notifications
            </label>
          </div>
        </Card>

        <Button className="bg-red-600 hover:bg-red-700">Save Settings</Button>
      </div>
    </div>
  )
}
