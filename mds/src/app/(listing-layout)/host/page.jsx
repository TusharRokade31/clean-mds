    // /app/dashboard-layout/admin/page.jsx
"use client"

import { Bookmark } from "lucide-react"

export default function DashboardPage() {
  return (
    <>
      <h1 className="mb-6 text-2xl font-bold">Hotel Dashboard</h1>

      {/* Stats cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Active Bookings" value="27" />
        <StatCard title="Check-ins Today" value="8" />
        <StatCard title="Check-outs Today" value="5" />
        <StatCard title="Available Rooms" value="14" />
      </div>

      {/* Content sections */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="col-span-2 rounded-lg border bg-white p-4 shadow-sm lg:p-6">
          <h2 className="mb-4 text-lg font-medium">Recent Bookings</h2>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="flex items-center gap-4 border-b pb-4 last:border-0">
                <div className="h-10 w-10 rounded-full bg-[#1035ac]/10 flex items-center justify-center">
                  <Bookmark className="h-5 w-5 text-[#1035ac]" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Booking #BK-{1000 + item}</p>
                  <p className="text-sm text-gray-500">Check-in: May {10 + item}, 2025</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">Room {200 + item}</p>
                  <p className="text-sm text-gray-500">3 nights</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-lg border bg-white p-4 shadow-sm lg:p-6">
          <h2 className="mb-4 text-lg font-medium">Room Status</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Occupancy Rate</span>
                <span className="text-sm font-medium">78%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200">
                <div className="h-2 rounded-full bg-[#1035ac]" style={{ width: "78%" }}></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Reserved Rooms</span>
                <span className="text-sm font-medium">65%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200">
                <div className="h-2 rounded-full bg-[#1035ac]" style={{ width: "65%" }}></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Maintenance Required</span>
                <span className="text-sm font-medium">12%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200">
                <div className="h-2 rounded-full bg-red-500" style={{ width: "12%" }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function StatCard({ title, value }) {
  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="mt-2 text-2xl font-bold text-[#1035ac]">{value}</p>
    </div>
  )
}