import { Card } from '@/components/ui/Card'

export default function AdminAnalyticsPage() {
  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
      <p className="mb-8 text-gray-600">Detailed system analytics and performance metrics.</p>

      <div className="space-y-6">
        <Card>
          <h2 className="mb-4 text-xl font-semibold">Traffic Overview</h2>
          <div className="flex h-64 items-center justify-center rounded bg-gray-100">
            <p className="text-gray-500">
              Chart placeholder - integrate with your analytics service
            </p>
          </div>
        </Card>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card>
            <h3 className="mb-4 text-lg font-semibold">Top Pages</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>/dashboard</span>
                <span className="font-medium">2,345 views</span>
              </div>
              <div className="flex justify-between">
                <span>/login</span>
                <span className="font-medium">1,234 views</span>
              </div>
              <div className="flex justify-between">
                <span>/</span>
                <span className="font-medium">987 views</span>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="mb-4 text-lg font-semibold">User Activity</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Daily Active Users</span>
                <span className="font-medium">456</span>
              </div>
              <div className="flex justify-between">
                <span>Weekly Active Users</span>
                <span className="font-medium">1,234</span>
              </div>
              <div className="flex justify-between">
                <span>Monthly Active Users</span>
                <span className="font-medium">3,456</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
