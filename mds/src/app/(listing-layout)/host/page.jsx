    // /app/dashboard-layout/admin/page.jsx
"use client"

import { Bookmark } from "lucide-react"

export default function DashboardPage() {
  return (
   <></>
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