"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from 'react-redux'
import { getAllProperties, getDraftProperties, deleteProperty, resetCurrentProperty, changePropertyStatus } from '@/redux/features/property/propertySlice'
import { useRouter } from 'next/navigation'
import Link from "next/link"
import { Edit, Trash2, Plus, Check, X, Search } from "lucide-react"

export default function Listing() {
  const dispatch = useDispatch()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('published')
  const [deleteLoading, setDeleteLoading] = useState(null)
  const [statusLoading, setStatusLoading] = useState(null)
  const [reviewLoading, setReviewLoading] = useState(null)
  const [showReviewPopup, setShowReviewPopup] = useState(false)
  const [selectedProperty, setSelectedProperty] = useState(null)
  const [reviewAction, setReviewAction] = useState('')
  
  // 1. Add Search State
  const [searchQuery, setSearchQuery] = useState('')
  
  const { properties, isLoading, error, user } = useSelector((state) => ({
    properties: state.property.properties,
    draftProperties: state.property.draftProperties,
    isLoading: state.property.isLoading,
    error: state.property.error,
    user: state.auth.user
  }))

  const isAdmin = user?.role === 'admin'

  useEffect(() => {
    dispatch(getAllProperties())
    dispatch(getDraftProperties())
  }, [dispatch])

  const publishedProperties = properties?.filter(p => p.status === 'published') || []
  const draftProperties_filtered = properties?.filter(p => p.status === 'draft') || []
  const pendingProperties = properties?.filter(p => p.status === 'pending') || []
  const rejectedProperties = properties?.filter(p => p.status === 'rejected') || []
  const pendingChangesProperties = properties?.filter(p => p.status === 'pending_changes') || []

  const handleCreateNew = () => {
    dispatch(resetCurrentProperty());
    sessionStorage.setItem('createNew', 'true');
    router.push('/host/onboarding/new');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      try {
        setDeleteLoading(id)
        await dispatch(deleteProperty(id)).unwrap()
        dispatch(getAllProperties())
        dispatch(getDraftProperties())
        alert('Property deleted successfully!')
      } catch (error) {
        console.error('Delete failed:', error)
        alert('Failed to delete property: ' + (error.message || 'Unknown error'))
      } finally {
        setDeleteLoading(null)
      }
    }
  }

  const handleReviewClick = (property, action) => {
    setSelectedProperty(property)
    setReviewAction(action)
    setShowReviewPopup(true)
  }

  const handleReviewConfirm = async () => {
    if (!selectedProperty || !reviewAction) return
    try {
      setReviewLoading(selectedProperty._id)
      const newStatus = reviewAction === 'approve' ? 'published' : 'rejected'
      await dispatch(changePropertyStatus({ id: selectedProperty._id, status: newStatus })).unwrap()
      dispatch(getAllProperties())
      dispatch(getDraftProperties())
      alert(`Property ${reviewAction === 'approve' ? 'approved' : 'rejected'} successfully!`)
    } catch (error) {
      console.error('Review failed:', error)
      alert(`Failed to ${reviewAction} property: ` + (error.message || 'Unknown error'))
    } finally {
      setReviewLoading(null)
      setShowReviewPopup(false)
      setSelectedProperty(null)
      setReviewAction('')
    }
  }

  const handleReviewCancel = () => {
    setShowReviewPopup(false)
    setSelectedProperty(null)
    setReviewAction('')
  }

  const statusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'pending', label: 'Pending' },
    { value: 'published', label: 'Published' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'pending_changes', label: 'Pending Changes' },
  ]

  const canChangeStatus = (property) => {
    if (isAdmin) return true
    const ownerId = property.owner?._id || property.owner
    return ownerId === user?._id
  }

  const handleStatusChange = async (property, newStatus) => {
    if (!property || !newStatus) return
    const confirmed = window.confirm(`Change status of "${property.placeName}" to "${newStatus}"?`)
    if (!confirmed) return
    try {
      setStatusLoading(property._id)
      await dispatch(changePropertyStatus({ id: property._id, status: newStatus })).unwrap()
      dispatch(getAllProperties())
      dispatch(getDraftProperties())
      alert('Status updated successfully!')
    } catch (error) {
      console.error('Status update failed:', error)
      alert('Failed to update status: ' + (error.message || 'Unknown error'))
    } finally {
      setStatusLoading(null)
    }
  }

  const tabs = [
    { key: 'published', label: 'Published', count: publishedProperties.length },
    { key: 'draft', label: 'Draft', count: draftProperties_filtered.length },
    { key: 'pending', label: 'Pending Review', count: pendingProperties.length },
    { key: 'rejected', label: 'Rejected', count: rejectedProperties.length },
    { key: 'pending_changes', label: 'Pending Changes', count: pendingChangesProperties.length }
  ]

  const getCurrentProperties = () => {
    switch (activeTab) {
      case 'published': return publishedProperties
      case 'draft': return draftProperties_filtered
      case 'pending': return pendingProperties
      case 'rejected': return rejectedProperties
      case 'pending_changes': return pendingChangesProperties
      default: return []
    }
  }

  // 2. Logic to filter properties based on search query
  const getFilteredProperties = () => {
    const currentList = getCurrentProperties()
    if (!searchQuery) return currentList

    return currentList.filter(property => {
      const query = searchQuery.toLowerCase()
      const name = property.placeName?.toLowerCase() || ''
      const type = property.propertyType?.toLowerCase() || ''
      const city = property.location?.city?.toLowerCase() || ''
      const state = property.location?.state?.toLowerCase() || ''

      return name.includes(query) || type.includes(query) || city.includes(query) || state.includes(query)
    })
  }

  const getEmptyMessage = () => {
    if (searchQuery) return 'No properties match your search.'
    switch (activeTab) {
      case 'published': return 'No published properties found.'
      case 'draft': return 'No draft properties found.'
      case 'pending': return 'No properties pending review.'
      case 'rejected': return 'No rejected properties found.'
      default: return 'No properties found.'
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
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status Update</th>
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
              <td className="whitespace-nowrap px-6 py-4 text-sm flex space-x-2">
                <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                  property.status === 'published' ? 'bg-green-100 text-green-800' : 
                  property.status === 'draft' ? 'bg-yellow-100 text-yellow-800' : 
                  property.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                  property.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {property.status}
                </span>

                {isAdmin && property.status === 'pending' && (
                  <>
                    <button 
                      className="text-green-600 hover:text-green-900 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Approve Property"
                      onClick={() => handleReviewClick(property, 'approve')}
                      disabled={reviewLoading === property._id}
                    >
                      {reviewLoading === property._id ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-green-600"></div>
                      ) : <Check className="h-5 w-5" />}
                    </button>
                    <button 
                      className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Reject Property"
                      onClick={() => handleReviewClick(property, 'reject')}
                      disabled={reviewLoading === property._id}
                    >
                      {reviewLoading === property._id ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-red-600"></div>
                      ) : <X className="h-5 w-5" />}
                    </button>
                  </>
                )}
                
                {(isAdmin || property.status !== 'published') && (
                  <button 
                    className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Delete Property"
                    onClick={() => handleDelete(property._id)}
                    disabled={deleteLoading === property._id}
                  >
                    {deleteLoading === property._id ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-red-600"></div>
                    ) : <Trash2 className="h-5 w-5" />}
                  </button>
                )}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm space-x-2">
                {canChangeStatus(property) && (
                  <div>
                    <select
                      value={property.status}
                      onChange={(e) => handleStatusChange(property, e.target.value)}
                      disabled={statusLoading === property._id || reviewLoading === property._id}
                      className="ml-2 rounded-md border px-2 py-1 text-sm"
                      title="Change status"
                    >
                      {statusOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    {statusLoading === property._id && (
                      <span className="ml-2 inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2"></span>
                    )}
                  </div>
                )}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm space-x-2">
                <Link 
                  href={`/host/onboarding/${property._id}`} 
                  className="text-green-600 hover:text-green-900"
                  title="Edit Property"
                >
                  <Edit className="h-5 w-5" />
                </Link> 
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

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        {/* Tabs */}
        <div className="flex space-x-2 flex-wrap">
          {tabs.map(tab => (
            <button 
              key={tab.key}
              className={`rounded-md px-3 py-1.5 text-sm mb-2 ${
                activeTab === tab.key 
                  ? 'bg-[#1035ac] text-white' 
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
              onClick={() => {
                setActiveTab(tab.key)
                setSearchQuery('') // Clear search when switching tabs
              }}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* 3. Search Input UI */}
        <div className="relative w-full sm:w-64">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:border-[#1035ac] focus:outline-none focus:ring-1 focus:ring-[#1035ac]"
            placeholder="Search properties..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-lg border bg-white p-4 shadow-sm lg:p-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#1035ac]"></div>
          </div>
        ) : error ? (
          <p className="text-red-500">Error: {error}</p>
        ) : getFilteredProperties().length > 0 ? (
          // 4. Use the filtered properties here
          renderPropertyTable(getFilteredProperties())
        ) : (
          <div className="text-center text-gray-500 py-8">
            <p>{getEmptyMessage()}</p>
            {activeTab === 'draft' && !searchQuery && (
              <Link 
                href="/host/onboarding"
                className="inline-flex items-center gap-2 mt-4 rounded-md bg-[#1035ac] px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
              >
                <Plus className="h-4 w-4" />
                Create Your First Property
              </Link>
            )}
          </div>
        )}
      </div>

      {showReviewPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {reviewAction === 'approve' ? 'Approve Property' : 'Reject Property'}
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to {reviewAction} the property "{selectedProperty?.placeName}"?
              {reviewAction === 'reject' && ' This will move it to rejected status.'}
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleReviewCancel}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                disabled={reviewLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleReviewConfirm}
                className={`px-4 py-2 text-white rounded-md disabled:opacity-50 ${
                  reviewAction === 'approve' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
                disabled={reviewLoading}
              >
                {reviewLoading ? 'Processing...' : 
                  (reviewAction === 'approve' ? 'Approve' : 'Reject')
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}