import { Card } from '@/components/ui/Card'

export default function AdminOverviewPage() {
  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold text-gray-900">Admin Overview</h1>
      <p className="mb-8 text-gray-600">System administration and management dashboard.</p>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-red-500">
          <h3 className="mb-2 text-lg font-semibold">Total Users</h3>
          <p className="text-3xl font-bold text-red-600">5,678</p>
          <p className="mt-1 text-sm text-gray-500">+12% from last month</p>
        </Card>
        <Card className="border-l-4 border-orange-500">
          <h3 className="mb-2 text-lg font-semibold">System Load</h3>
          <p className="text-3xl font-bold text-orange-600">67%</p>
          <p className="mt-1 text-sm text-gray-500">Normal range</p>
        </Card>
        <Card className="border-l-4 border-yellow-500">
          <h3 className="mb-2 text-lg font-semibold">Active Sessions</h3>
          <p className="text-3xl font-bold text-yellow-600">234</p>
          <p className="mt-1 text-sm text-gray-500">Peak: 456</p>
        </Card>
        <Card className="border-l-4 border-green-500">
          <h3 className="mb-2 text-lg font-semibold">Uptime</h3>
          <p className="text-3xl font-bold text-green-600">99.9%</p>
          <p className="mt-1 text-sm text-gray-500">Last 30 days</p>
        </Card>
      </div>
    </div>
  )
}
