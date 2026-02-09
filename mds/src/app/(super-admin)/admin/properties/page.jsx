"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllProperties,
  getDraftProperties,
  deleteProperty,
  resetCurrentProperty,
  reviewProperty,
} from "@/redux/features/property/propertySlice";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Edit, 
  Trash2, 
  Eye, 
  Plus, 
  Check, 
  X, 
  Search,
  Map,
  Grid3X3,
  List,
  MoreHorizontal,
  Home,
  Trophy,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import PropertyDetailsModal from "../../components/properties/PropertyDetailsModal";
import toast from "react-hot-toast";

export default function Listing() {
  const dispatch = useDispatch();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(null);
  const [showReviewPopup, setShowReviewPopup] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [reviewAction, setReviewAction] = useState("");
  const [showPropertyDetails, setShowPropertyDetails] = useState(false);
  const [selectedPropertyForDetails, setSelectedPropertyForDetails] = useState(null);
  const [viewMode, setViewMode] = useState("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [locationFilter, setLocationFilter] = useState("All Locations");

  const { properties, draftProperties, isLoading, error, user } = useSelector(
    (state) => ({
      properties: state.property.properties,
      draftProperties: state.property.draftProperties,
      isLoading: state.property.isLoading,
      error: state.property.error,
      user: state.auth.user,
    })
  );

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    dispatch(getAllProperties());
    dispatch(getDraftProperties());
  }, [dispatch]);

  // Calculate statistics
  const totalProperties = properties?.length || 0;
  const pendingProperties = properties?.filter((p) => p.status === "pending").length || 0;
  const liveProperties = properties?.filter((p) => p.status === "published").length || 0;
  const docExpiryAlerts = 23; // This would come from your actual data

  // Filter properties based on search and filters
  const getFilteredProperties = () => {
    let filtered = properties || [];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(property =>
        property.placeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.location?.city?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter !== "All Status") {
      filtered = filtered.filter(property => property.status === statusFilter.toLowerCase());
    }
    
    return filtered;
  };

  const handleViewDetails = (property) => {
    setSelectedPropertyForDetails(property);
    setShowPropertyDetails(true);
  };

  const handleCreateNew = () => {
    dispatch(resetCurrentProperty());
    sessionStorage.setItem("createNew", "true");
    router.push("/host/onboarding/new");
  };

  const handleDelete = async (id) => {
    if (
      window.confirm(
        "Are you sure you want to delete this property? This action cannot be undone."
      )
    ) {
      try {
        setDeleteLoading(id);
        const result = await dispatch(deleteProperty(id)).unwrap();
        dispatch(getAllProperties());
        dispatch(getDraftProperties());
        toast.success("Property deleted successfully!");
      } catch (error) {
        console.error("Delete failed:", error);
        toast.error("Failed to delete property: " + (error.message || "Unknown error"));
      } finally {
        setDeleteLoading(null);
      }
    }
  };

  const handleReviewClick = (property, action) => {
    setSelectedProperty(property);
    setReviewAction(action);
    setShowReviewPopup(true);
  };

  const handleReviewConfirm = async () => {
    if (!selectedProperty || !reviewAction) return;

    try {
      setReviewLoading(selectedProperty._id);
      const newStatus = reviewAction === "approve" ? "published" : "rejected";

      await dispatch(
        reviewProperty({
          id: selectedProperty._id,
          status: { status: newStatus },
        })
      ).unwrap();

      dispatch(getAllProperties());
      dispatch(getDraftProperties());

      toast.success(
        `Property ${reviewAction === "approve" ? "approved" : "rejected"} successfully!`
      );
    } catch (error) {
      console.error("Review failed:", error);
      toast.error(
        `Failed to ${reviewAction} property: ` + (error.message || "Unknown error")
      );
    } finally {
      setReviewLoading(null);
      setShowReviewPopup(false);
      setSelectedProperty(null);
      setReviewAction("");
    }
  };

  const handleReviewCancel = () => {
    setShowReviewPopup(false);
    setSelectedProperty(null);
    setReviewAction("");
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "published":
      case "live":
        return "bg-green-100 text-green-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusDisplayText = (status) => {
    switch (status?.toLowerCase()) {
      case "published":
        return "Live";
      case "pending":
        return "Pending";
      case "approved":
        return "Approved";
      case "rejected":
        return "Rejected";
      case "draft":
        return "Draft";
      default:
        return status || "Unknown";
    }
  };

  return (
    <>
      <div className="p-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Property Management</h1>
          <p className="text-gray-600">Manage all Dharamshala listings, verification workflows, and partner relationships.</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-900">{totalProperties.toLocaleString()}</p>
                <p className="text-gray-600 text-sm">Total Properties</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <Home className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-900">{pendingProperties}</p>
                <p className="text-gray-600 text-sm">Pending Approval</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <Trophy className="h-8 w-8 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-900">{liveProperties}</p>
                <p className="text-gray-600 text-sm">Live Properties</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-900">{docExpiryAlerts}</p>
                <p className="text-gray-600 text-sm">Doc Expiry Alerts</p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-300 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search properties..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Status Filter */}
              <select
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option>All Status</option>
                <option>Published</option>
                <option>Pending</option>
                <option>Draft</option>
                <option>Rejected</option>
              </select>

              {/* Location Filter */}
              <select
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
              >
                <option>All Locations</option>
                <option>Mumbai</option>
                <option>Delhi</option>
                <option>Chennai</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              {/* View Mode Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    viewMode === "list"
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    viewMode === "grid"
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("map")}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    viewMode === "map"
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Map className="h-4 w-4" />
                </button>
              </div>

              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                Map View
              </button>

              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                Bulk Actions
              </button>
            </div>
          </div>
        </div>

        {/* Properties List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-300">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Properties List</h2>
              <label className="flex items-center text-sm text-gray-600">
                <input type="checkbox" className="mr-2 rounded" />
                Select All
              </label>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
              </div>
            ) : error ? (
              <p className="text-red-500">Error: {error}</p>
            ) : getFilteredProperties().length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4">
                        <input type="checkbox" className="rounded" />
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 uppercase tracking-wider">
                        Property
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 uppercase tracking-wider">
                        Partner
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 uppercase tracking-wider">
                        Pricing
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 uppercase tracking-wider">
                        Manager
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {getFilteredProperties().map((property) => (
                      <tr key={property._id} className="hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <input type="checkbox" className="rounded" />
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-12 w-12">
                              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                <Home className="h-6 w-6 text-orange-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {property.placeName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {property.propertyType}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-900">
                          {property.owner || "Unassigned"}
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                              property.status
                            )}`}
                          >
                            {getStatusDisplayText(property.status)}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-900">
                          ₹{property.rooms?.[0]?.pricing?.baseAdultsCharge || 'N/A'}/night
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-900">
                          {property.manager || "Unassigned"}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleViewDetails(property)}
                              className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                            >
                              View
                            </button>
                            <button className="text-gray-400 hover:text-gray-600">
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <Home className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-lg">No properties found</p>
                <p className="text-sm">Try adjusting your search or filters</p>
                <Link
                  href="/host/onboarding/new"
                  className="inline-flex items-center gap-2 mt-4 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  onClick={handleCreateNew}
                >
                  <Plus className="h-4 w-4" />
                  Create Your First Property
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Review Confirmation Popup */}
      {showReviewPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {reviewAction === "approve" ? "Approve Property" : "Reject Property"}
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to {reviewAction} the property "
              {selectedProperty?.placeName}"?
              {reviewAction === "reject" && " This will move it to rejected status."}
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
                  reviewAction === "approve"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
                disabled={reviewLoading}
              >
                {reviewLoading
                  ? "Processing..."
                  : reviewAction === "approve"
                  ? "Approve"
                  : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}

      <PropertyDetailsModal
        property={selectedPropertyForDetails}
        isOpen={showPropertyDetails}
        onClose={() => {
          setShowPropertyDetails(false);
          setSelectedPropertyForDetails(null);
        }}
      />
    </>
  );
}