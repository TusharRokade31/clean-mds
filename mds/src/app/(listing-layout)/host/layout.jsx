// layout.jsx
"use client"
import { useState, useEffect } from "react"
import { BarChart3, Users, Home, Settings, Menu, X, Bell, Search, ChevronDown, Calendar, Bookmark, CreditCard, HelpCircle, Building, BedDouble } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import AvatarDropdown from "@/component/AvatarDropdown"
import { usePathname, useRouter } from "next/navigation"
import { useDispatch, useSelector } from 'react-redux'
import { getAllProperties } from "@/redux/features/property/propertySlice"


export default function HotelDashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [bookingDropdownOpen, setBookingDropdownOpen] = useState(false)
  const [selectedProperty, setSelectedProperty] = useState(null)

  const pathname = usePathname()
  const dispatch = useDispatch()
  
  const { properties, isLoading } = useSelector(state => state.property)
  const router = useRouter()

  useEffect(() => {
    dispatch(getAllProperties())
    // Load selected property from localStorage on mount
    const saved = localStorage.getItem('selectedProperty')
    if (saved) {
      setSelectedProperty(JSON.parse(saved))
    }
  }, [dispatch])

  const handlePropertySelect = (property) => {
    setSelectedProperty(property)
    setBookingDropdownOpen(false)
    localStorage.setItem('selectedProperty', JSON.stringify(property))
    // Trigger property change event for child components
    window.dispatchEvent(new CustomEvent('propertyChanged', { detail: property }))
    router.push('/host/bookings ')

  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-[#1035ac] text-white transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        <Link href='/host'> <div className="flex items-center gap-2 font-bold text-xl">
            <Building className="h-6 w-6" />
            <span>MDS</span>
        </div></Link>
          <button className="rounded-md p-1 hover:bg-blue-800 lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <nav className="space-y-1 px-2">
          <NavItem icon={<Home className="h-5 w-5" />} label="Properties" />
          <NavItem icon={<Calendar className="h-5 w-5" />} label="onboarding" />
          <NavItem icon={<Calendar className="h-5 w-5" />} label="add-blog" />
          <NavItem icon={<Calendar className="h-5 w-5" />} label="bloglist" />
          <NavItem icon={<Calendar className="h-5 w-5" />} label="categories" />
          
          {/* Booking Dropdown */}
          <div className="relative">
            <button
              onClick={() => setBookingDropdownOpen(!bookingDropdownOpen)}
              className={`flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-blue-800 ${pathname.includes('/bookings') ? 'bg-blue-800' : ''}`}
            >
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5" />
                <span>Bookings</span>
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform ${bookingDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {bookingDropdownOpen && (
              <div className="mt-1 ml-4 space-y-1">
                <div className="text-xs text-blue-200 px-3 py-1">Select Property:</div>
                {isLoading ? (
                  <div className="px-3 py-2 text-xs text-blue-200">Loading...</div>
                ) : properties.length === 0 ? (
                  <div className="px-3 py-2 text-xs text-blue-200">No properties found</div>
                ) : (
                  properties.filter(property =>  property.status === 'published').map((property) => (
                    <button
                      key={property._id}
                      onClick={() => handlePropertySelect(property)}
                      className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                        selectedProperty?._id === property._id 
                          ? 'bg-blue-700 text-white' 
                          : 'text-blue-200 hover:bg-blue-700 hover:text-white'
                      }`}
                    >
                      <div className="truncate">{property.placeName}</div>
                      <div className="text-xs text-blue-300 truncate">
                        {property.location?.city}, {property.location?.state}
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </nav>

        {/* Selected Property Display */}
        {selectedProperty && (
          <div className="absolute bottom-16 left-0 right-0 px-4">
            <div className="bg-blue-800 rounded-lg p-3">
              <div className="text-xs text-blue-200">Active Property:</div>
              <div className="font-medium text-sm truncate">{selectedProperty.placeName}</div>
              <div className="text-xs text-blue-300 truncate">
                {selectedProperty.location?.city}
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b bg-white px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <button className="rounded-md p-1 hover:bg-gray-100 lg:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-6 w-6" />
            </button>
            {pathname.includes('/bookings') && (
              <div className="relative w-64 max-w-xs lg:w-80">
                <input
                  type="text"
                  placeholder="Search bookings, guests..."
                  className="h-9 w-full rounded-md border border-gray-300 pl-9 pr-4 focus:border-[#1035ac] focus:outline-none focus:ring-1 focus:ring-[#1035ac]"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button className="relative rounded-full p-1 hover:bg-gray-100">
              <Bell className="h-6 w-6" />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500"></span>
            </button>
            <div className="flex items-center gap-2">
              <AvatarDropdown />
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t bg-white p-4 text-center text-sm text-gray-500 lg:p-4">
          © 2025 Hotel Management System. All rights reserved.
        </footer>
      </div>
    </div>
  )
}

function NavItem({ icon, label, active }) {
  return (
    <Link
      href={`/host/${label.toLowerCase()}`}
      className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${active ? "bg-blue-800" : "hover:bg-blue-800"}`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  )
}