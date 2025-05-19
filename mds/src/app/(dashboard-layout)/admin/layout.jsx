"use client"

import { useState } from "react"
import { BarChart3, Users, Home, Settings, Menu, X, Bell, Search, ChevronDown, Calendar, Bookmark, CreditCard, HelpCircle, Building, BedDouble } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import AvatarDropdown from "@/component/AvatarDropdown"

export default function HotelDashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-[#1035ac] text-white transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-2 font-bold text-xl">
            <Building className="h-6 w-6" />
            <span>MDS</span>
          </div>
          <button className="rounded-md p-1 hover:bg-blue-800 lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="h-6 w-6" />
          </button>
        </div>
        <nav className="space-y-1 px-2">
          <NavItem icon={<Home className="h-5 w-5" />} label="Dashboard" />
          <NavItem icon={<Calendar className="h-5 w-5" />} label="Bookings" />
          <NavItem icon={<BedDouble className="h-5 w-5" />} label="Review Property" />
          <NavItem icon={<Users className="h-5 w-5" />} label="Guests" />
          <NavItem icon={<CreditCard className="h-5 w-5" />} label="Payments" />
          <NavItem icon={<BarChart3 className="h-5 w-5" />} label="Reports" />
          <NavItem icon={<Settings className="h-5 w-5" />} label="Settings" />
          <NavItem icon={<HelpCircle className="h-5 w-5" />} label="Help" />
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b bg-white px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <button className="rounded-md p-1 hover:bg-gray-100 lg:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-6 w-6" />
            </button>
            <div className="relative w-64 max-w-xs lg:w-80">
              <input
                type="text"
                placeholder="Search bookings, guests..."
                className="h-9 w-full rounded-md border border-gray-300 pl-9 pr-4 focus:border-[#1035ac] focus:outline-none focus:ring-1 focus:ring-[#1035ac]"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative rounded-full p-1 hover:bg-gray-100">
              <Bell className="h-6 w-6" />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500"></span>
            </button>
            <div className="flex items-center gap-2">
              <AvatarDropdown/>
             
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          {children || (
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
          )}
        </main>

        {/* Footer */}
        <footer className="border-t bg-white p-4 text-center text-sm text-gray-500 lg:p-6">
          © 2025 Hotel Management System. All rights reserved.
        </footer>
      </div>
    </div>
  )
}

function NavItem({ icon, label, active}) {
  return (
    <Link
      href={`/admin/${label.toLowerCase()}`}
      className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${
        active ? "bg-blue-800" : "hover:bg-blue-800"
      }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
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