"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from 'react-redux'
import { getAllProperties, getDraftProperties } from '@/redux/features/property/propertySlice'
import Link from "next/link"
import { Edit, Trash2, Eye } from "lucide-react"

export default function Listing() {
  const dispatch = useDispatch()
  const [activeTab, setActiveTab] = useState('published')
  
  const { properties, draftProperties, isLoading, error } = useSelector((state) => ({
    properties: state.property.properties,
    draftProperties: state.property.draftProperties,
    isLoading: state.property.isLoading,
    error: state.property.error
  }))

  useEffect(() => {
    dispatch(getAllProperties())
    dispatch(getDraftProperties())
  }, [dispatch])

  const renderPropertyTable = (propertyList) => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Property Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Type</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Location</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {propertyList.map((property) => (
            <tr key={property._id} className="hover:bg-gray-50">
              <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">{property.placeName}</td>
              <td className="whitespace-nowrap px-6 py-4 text-sm">{property.propertyType}</td>
              <td className="whitespace-nowrap px-6 py-4 text-sm">
                {property.location.city}, {property.location.state}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm">
                <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                  property.status === 'published' ? 'bg-green-100 text-green-800' : 
                  property.status === 'draft' ? 'bg-yellow-100 text-yellow-800' : 
                  'bg-gray-100 text-gray-800'
                }`}>
                  {property.status}
                </span>
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm flex space-x-2">
                <Link 
                  href={`/dashboard-layout/admin/properties/view/${property._id}`} 
                  className="text-blue-600 hover:text-blue-900"
                >
                  <Eye className="h-5 w-5" />
                </Link>
                <Link 
                  href={`/dashboard-layout/admin/properties/edit/${property._id}`} 
                  className="text-green-600 hover:text-green-900"
                >
                  <Edit className="h-5 w-5" />
                </Link>
                <button 
                  className="text-red-600 hover:text-red-900"
                  // onClick={() => handleDelete(property._id)}
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  return (
    <>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Property Management</h1>
        <div className="mt-4 sm:mt-0">
          <Link 
            href="/dashboard-layout/admin/properties/new"
            className="inline-flex items-center gap-2 rounded-md bg-[#1035ac] px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
          >
            Add New Property
          </Link>
        </div>
      </div>

      <div className="mb-4 flex space-x-2">
        <button 
          className={`rounded-md px-3 py-1.5 text-sm ${activeTab === 'published' ? 'bg-[#1035ac] text-white' : 'bg-gray-100'}`}
          onClick={() => setActiveTab('published')}
        >
          Published Properties
        </button>
        <button 
          className={`rounded-md px-3 py-1.5 text-sm ${activeTab === 'draft' ? 'bg-[#1035ac] text-white' : 'bg-gray-100'}`}
          onClick={() => setActiveTab('draft')}
        >
          Draft Properties
        </button>
      </div>

      <div className="rounded-lg border bg-white p-4 shadow-sm lg:p-6">
        {isLoading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-500">Error: {error}</p>
        ) : activeTab === 'published' ? (
          renderPropertyTable(properties)
        ) : (
          renderPropertyTable(draftProperties)
        )}
      </div>
    </>
  )
}