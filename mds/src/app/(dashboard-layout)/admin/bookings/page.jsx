// /app/dashboard-layout/admin/bookings/page.jsx
"use client"

import { useState } from "react"
import { Calendar, Filter, Plus } from "lucide-react"
import Link from "next/link"

export default function BookingsPage() {
  const [filter, setFilter] = useState("all")
  
  return (
    <>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Bookings</h1>
        <div className="mt-4 sm:mt-0">
          <Link 
            href="/dashboard-layout/admin/bookings/new"
            className="inline-flex items-center gap-2 rounded-md bg-[#1035ac] px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
          >
            <Plus className="h-4 w-4" />
            New Booking
          </Link>
        </div>
      </div>
      
      <div className="mb-6 rounded-lg border bg-white p-4 shadow-sm lg:p-6">
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex space-x-2">
            <button 
              className={`rounded-md px-3 py-1.5 text-sm ${filter === 'all' ? 'bg-[#1035ac] text-white' : 'bg-gray-100'}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button 
              className={`rounded-md px-3 py-1.5 text-sm ${filter === 'upcoming' ? 'bg-[#1035ac] text-white' : 'bg-gray-100'}`}
              onClick={() => setFilter('upcoming')}
            >
              Upcoming
            </button>
            <button 
              className={`rounded-md px-3 py-1.5 text-sm ${filter === 'active' ? 'bg-[#1035ac] text-white' : 'bg-gray-100'}`}
              onClick={() => setFilter('active')}
            >
              Active
            </button>
            <button 
              className={`rounded-md px-3 py-1.5 text-sm ${filter === 'past' ? 'bg-[#1035ac] text-white' : 'bg-gray-100'}`}
              onClick={() => setFilter('past')}
            >
              Past
            </button>
          </div>
          <div className="mt-4 flex items-center gap-2 sm:mt-0">
            <button className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm">
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </button>
            <button className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm">
              <Calendar className="h-4 w-4" />
              <span>Date</span>
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Booking ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Guest</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Room</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Check-in</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Check-out</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                <tr key={item} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                    <Link href={`/dashboard-layout/admin/bookings/${1000 + item}`} className="text-[#1035ac] hover:underline">
                      BK-{1000 + item}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">John Doe</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">Deluxe Room {200 + item}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">May {10 + item}, 2025</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">May {13 + item}, 2025</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                      item % 3 === 0 ? 'bg-yellow-100 text-yellow-800' : 
                      item % 3 === 1 ? 'bg-green-100 text-green-800' : 
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {item % 3 === 0 ? 'Upcoming' : item % 3 === 1 ? 'Active' : 'Completed'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">${150 + (item * 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing 1 to 8 of 24 entries
          </div>
          <div className="flex gap-1">
            <button className="rounded-md border px-3 py-1 text-sm">Previous</button>
            <button className="rounded-md border bg-[#1035ac] px-3 py-1 text-sm text-white">1</button>
            <button className="rounded-md border px-3 py-1 text-sm">2</button>
            <button className="rounded-md border px-3 py-1 text-sm">3</button>
            <button className="rounded-md border px-3 py-1 text-sm">Next</button>
          </div>
        </div>
      </div>
    </>
  )
}