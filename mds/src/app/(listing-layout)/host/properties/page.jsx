"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from 'react-redux'
import { getAllProperties, getDraftProperties, deleteProperty, resetCurrentProperty } from '@/redux/features/property/propertySlice'
import { useRouter } from 'next/navigation'
import Link from "next/link"
import { Edit, Trash2, Eye, Plus } from "lucide-react"

export default function Listing() {
  const dispatch = useDispatch()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('published')
  const [deleteLoading, setDeleteLoading] = useState(null) // Track which property is being deleted
  
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

  const handleCreateNew = () => {
    // Clear any existing property state before navigating
    dispatch(resetCurrentProperty());
    sessionStorage.setItem('createNew', 'true');
    router.push('/host/onboarding/new');
  };

  const handleDelete = async (propertyId) => {
    if (window.confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      try {
        setDeleteLoading(propertyId)
        await dispatch(deleteProperty(propertyId)).unwrap()
        
        // Refresh the property lists after successful deletion
        dispatch(getAllProperties())
        dispatch(getDraftProperties())
        
        // Show success message (you can replace this with your preferred notification system)
        alert('Property deleted successfully!')
      } catch (error) {
        console.error('Delete failed:', error)
        alert('Failed to delete property: ' + (error.message || 'Unknown error'))
      } finally {
        setDeleteLoading(null)
      }
    }
  }

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
                {property.location?.city}, {property.location?.state}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm">
                <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                  property.status === 'published' ? 'bg-green-100 text-green-800' : 
                  property.status === 'draft' ? 'bg-yellow-100 text-yellow-800' : 
                  property.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {property.status}
                </span>
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm flex space-x-2">
                <Link 
                  href={`/host/onboarding/${property._id}`} 
                  className="text-green-600 hover:text-green-900"
                  title="Edit Property"
                >
                  <Edit className="h-5 w-5" />
                </Link>
                <button 
                  className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Delete Property"
                  onClick={() => handleDelete(property._id)}
                  disabled={deleteLoading === property._id}
                >
                  {deleteLoading === property._id ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-red-600"></div>
                  ) : (
                    <Trash2 className="h-5 w-5" />
                  )}
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
        <div className="mt-4 sm:mt-0 flex gap-2">
          {/* Create New Property Button */}
          <Link 
            href="/host/onboarding/new"
            className="inline-flex items-center gap-2 rounded-md bg-[#1035ac] px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
            onClick={handleCreateNew}
          >
            <Plus className="h-4 w-4" />
            Create New Property
          </Link>
        </div>
      </div>

      <div className="mb-4 flex space-x-2">
        <button 
          className={`rounded-md px-3 py-1.5 text-sm ${activeTab === 'published' ? 'bg-[#1035ac] text-white' : 'bg-gray-100'}`}
          onClick={() => setActiveTab('published')}
        >
          Published Properties ({properties?.length || 0})
        </button>
        <button 
          className={`rounded-md px-3 py-1.5 text-sm ${activeTab === 'draft' ? 'bg-[#1035ac] text-white' : 'bg-gray-100'}`}
          onClick={() => setActiveTab('draft')}
        >
          Draft Properties ({draftProperties?.length || 0})
        </button>
      </div>

      <div className="rounded-lg border bg-white p-4 shadow-sm lg:p-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#1035ac]"></div>
          </div>
        ) : error ? (
          <p className="text-red-500">Error: {error}</p>
        ) : activeTab === 'published' ? (
          properties?.length > 0 ? renderPropertyTable(properties) : (
            <div className="text-center text-gray-500 py-8">
              <p>No published properties found.</p>
            </div>
          )
        ) : (
          draftProperties?.length > 0 ? renderPropertyTable(draftProperties) : (
            <div className="text-center text-gray-500 py-8">
              <p>No draft properties found.</p>
              <Link 
                href="/host/onboarding"
                className="inline-flex items-center gap-2 mt-4 rounded-md bg-[#1035ac] px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
              >
                <Plus className="h-4 w-4" />
                Create Your First Property
              </Link>
            </div>
          )
        )}
      </div>
    </>
  )
}