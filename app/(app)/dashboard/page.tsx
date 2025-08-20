import { Card } from '@/components/ui/Card'

export default function DashboardPage() {
  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold text-gray-900">Dashboard Overview</h1>
      <p className="mb-8 text-gray-600">Welcome to your dashboard. Here's what's happening.</p>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <h3 className="mb-2 text-lg font-semibold">Total Users</h3>
          <p className="text-3xl font-bold text-blue-600">1,234</p>
        </Card>
        <Card>
          <h3 className="mb-2 text-lg font-semibold">Active Sessions</h3>
          <p className="text-3xl font-bold text-green-600">89</p>
        </Card>
        <Card>
          <h3 className="mb-2 text-lg font-semibold">Revenue</h3>
          <p className="text-3xl font-bold text-purple-600">$12,345</p>
        </Card>
      </div>
    </div>
  )
}
