import { Calendar } from "lucide-react"

// components/bookings/BookingStats.jsx
export default function BookingStats({ stats }) {
  if (!stats) return null

  const statCards = [
    {
      title: 'Total Bookings',
      value: stats.totalBookings || 0,
      color: 'bg-blue-500'
    },
    {
      title: 'Checked In',
      value: stats.checkedInBookings || 0,
      color: 'bg-green-500'
    },
    {
      title: 'Confirmed Bookings',
      value: stats.confirmedBookings || 0,
      color: 'bg-yellow-500'
    },
    {
      title: 'Total Revenue',
      value: `₹${(stats.totalRevenue || 0).toLocaleString()}`,
      color: 'bg-purple-500'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, index) => (
        <div key={index} className="bg-white rounded-lg border p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.title}</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
            <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
              <Calendar className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}