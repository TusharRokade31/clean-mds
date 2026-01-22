"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X, Play, MapPin, Phone, Mail, User, CheckCircle, AlertTriangle, Clock, FileText, Check, X as XIcon } from "lucide-react";
import { reviewProperty, getAllProperties } from "@/redux/features/property/propertySlice";

const PropertyDetailsModal = ({ property, isOpen, onClose }) => {
  const dispatch = useDispatch();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [showReviewPopup, setShowReviewPopup] = useState(false);
  const [reviewAction, setReviewAction] = useState("");

  // Get user from Redux store
  const { user } = useSelector((state) => ({
    user: state.auth.user,
  }));

  // Check if user is admin
  const isAdmin = user?.role === "admin";

  if (!isOpen || !property) return null;

  // Sample data structure based on your property object
  const getVerificationStatus = () => {
    const statuses = ["KYC Pending", "Reviewed", "Approved", "Live"];
    const currentStatus = property.status;
    
    switch (currentStatus) {
      case "draft": return 0;
      case "pending": return 1;
      case "published": return 3;
      default: return 2;
    }
  };

  const statusIndex = getVerificationStatus();

  const getStatusColor = (index, current) => {
    if (index < current) return "bg-green-500 text-white";
    if (index === current) return "bg-blue-600 text-white";
    return "bg-gray-300 text-gray-600";
  };

  const verificationSteps = [
    { label: "KYC Pending", color: "green" },
    { label: "Reviewed", color: "green" },
    { label: "Approved", color: "blue" },
    { label: "Live", color: "gray" }
  ];

  // Sample amenities based on your property data
  const amenities = [
    { name: "High-Speed WiFi", icon: "📶", available: property.amenities?.mandatory?.Wifi?.available },
    { name: "Free Parking", icon: "🚗", available: property.amenities?.mandatory?.Parking?.available },
    { name: "Full Kitchen", icon: "🍳", available: true },
    { name: "Mountain View", icon: "🏔️", available: true },
    { name: "Fireplace", icon: "🔥", available: true },
    { name: "Garden Access", icon: "🌿", available: true },
  ];

  // Sample documents
  const documents = [
    {
      name: "PAN Card",
      id: "ABCDE1234F",
      uploadedDate: "Jan 15, 2024",
      status: "verified",
      expiryDate: "Never"
    },
    {
      name: "GST Certificate",
      id: "27ABCDE1234F1Z5",
      uploadedDate: "Feb 10, 2024",
      status: "expiring",
      expiryDate: "Dec 31, 2024",
      daysLeft: 45
    },
    {
      name: "Ownership Proof",
      id: "DH/2024/001234",
      uploadedDate: "Jan 20, 2024",
      status: "verified",
      type: "Registry Document"
    },
    {
      name: "Trust Deed",
      id: "TR/2020/5678",
      uploadedDate: "Jan 25, 2024",
      status: "verified",
      org: "Divine Trust Foundation"
    }
  ];

  // Review functionality
  const handleReviewClick = (action) => {
    setReviewAction(action);
    setShowReviewPopup(true);
  };

  const handleReviewConfirm = async () => {
    if (!property || !reviewAction) return;

    try {
      setReviewLoading(true);
      const newStatus = reviewAction === "approve" ? "published" : "rejected";

      await dispatch(
        reviewProperty({
          id: property._id,
          status: { status: newStatus },
        })
      ).unwrap();

      // Refresh properties list
      dispatch(getAllProperties());

      alert(
        `Property ${
          reviewAction === "approve" ? "approved" : "rejected"
        } successfully!`
      );

      // Close modal after successful review
      onClose();
    } catch (error) {
      console.error("Review failed:", error);
      alert(
        `Failed to ${reviewAction} property: ` +
          (error.message || "Unknown error")
      );
    } finally {
      setReviewLoading(false);
      setShowReviewPopup(false);
      setReviewAction("");
    }
  };

  const handleReviewCancel = () => {
    setShowReviewPopup(false);
    setReviewAction("");
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl max-w-6xl border border-gray-300 w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-2xl font-bold text-gray-900">Property Details</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Section */}
              <div className="lg:col-span-2 space-y-8">
                {/* Verification Workflow */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Verification Workflow</h3>
                  <div className="flex items-center space-x-2">
                    {verificationSteps.map((step, index) => (
                      <div key={index} className="flex items-center">
                        <div
                          className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(index, statusIndex)}`}
                        >
                          {step.label}
                        </div>
                        {index < verificationSteps.length - 1 && (
                          <div className="w-8 h-0.5 bg-gray-300 mx-2"></div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Images & Media */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Images & Media ({property.media?.images?.length || 0} Photos, {property.media?.videos?.length || 0} Videos)
                  </h3>
                  
                  {/* Image Grid */}
                  <div className="grid grid-cols-4 gap-3 mb-4">
                    {property.media?.images?.slice(0, 8).map((image, index) => (
                      <div 
                        key={index}
                        className={`aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                          index === 0 ? 'bg-blue-100 border-blue-300' :
                          index === 1 ? 'bg-green-100 border-green-300' :
                          index === 2 ? 'bg-purple-100 border-purple-300' :
                          index === 3 ? 'bg-red-100 border-red-300' :
                          index === 4 ? 'bg-yellow-100 border-yellow-300' :
                          index === 5 ? 'bg-blue-200 border-blue-400' :
                          index === 6 ? 'bg-pink-100 border-pink-300' :
                          'bg-gray-100 border-gray-300'
                        }`}
                        onClick={() => setActiveImageIndex(index)}
                      >
                        {image.url ? (
                          <img 
                            src={`${image.url}`} 
                            alt={`Property ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            {index === 0 && <span className="text-3xl">🏠</span>}
                            {index === 1 && <span className="text-3xl">🏞️</span>}
                            {index === 2 && <span className="text-3xl">🛏️</span>}
                            {index === 3 && <span className="text-3xl">🎥</span>}
                            {index === 4 && <span className="text-3xl">🏔️</span>}
                            {index === 5 && <span className="text-3xl">🚗</span>}
                            {index === 6 && <span className="text-3xl">🌿</span>}
                            {index === 7 && <span className="text-gray-400">+{(property.media?.images?.length || 0) - 7} more</span>}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex space-x-4">
                    <button className="text-blue-600 hover:text-blue-800 font-medium">
                      View All Photos
                    </button>
                    <button className="text-purple-600 hover:text-purple-800 font-medium flex items-center">
                      <Play className="w-4 h-4 mr-1" />
                      Watch Videos
                    </button>
                  </div>
                </div>

                {/* Amenities & Features */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Amenities & Features</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {amenities.filter(a => a.available).map((amenity, index) => (
                      <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-2xl mr-3">{amenity.icon}</span>
                        <span className="font-medium">{amenity.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pricing Structure */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Pricing Structure</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-gray-600 mb-2">Peak Season</p>
                      <p className="text-2xl font-bold text-blue-600">
                        ₹{property.rooms?.[0]?.pricing?.baseAdultsCharge || 4000}/night
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-2">Monthly Rate</p>
                      <p className="text-2xl font-bold text-blue-600">
                        ₹{((property.rooms?.[0]?.pricing?.baseAdultsCharge || 4000) * 30 * 0.5).toLocaleString()}/month
                      </p>
                    </div>
                  </div>
                </div>

                {/* Legal & KYC Documents */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Legal & KYC Documents</h3>
                  <div className="space-y-3">
                    {documents.map((doc, index) => (
                      <div 
                        key={index}
                        className={`p-4 rounded-lg border ${
                          doc.status === 'verified' ? 'bg-green-50 border-green-200' :
                          doc.status === 'expiring' ? 'bg-yellow-50 border-yellow-200' :
                          'bg-blue-50 border-blue-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <FileText className="w-5 h-5 mr-3 text-gray-600" />
                            <div>
                              <p className="font-medium">{doc.name}</p>
                              <p className="text-sm text-gray-600">
                                {doc.id} • Uploaded: {doc.uploadedDate}
                                {doc.org && ` • ${doc.org}`}
                              </p>
                              {doc.expiryDate && (
                                <p className="text-sm text-gray-600">
                                  Expires: {doc.expiryDate}
                                  {doc.daysLeft && ` (${doc.daysLeft} days left)`}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            {doc.status === 'verified' && (
                              <span className="flex items-center text-green-600 text-sm">
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Verified
                              </span>
                            )}
                            {doc.status === 'expiring' && (
                              <span className="flex items-center text-yellow-600 text-sm">
                                <AlertTriangle className="w-4 h-4 mr-1" />
                                Expiring Soon
                              </span>
                            )}
                            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                              View Document
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Document Verification Status:</p>
                    <div className="flex items-center">
                      <span className="text-green-600 font-semibold mr-2">4/4 Documents Verified</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Sidebar */}
              <div className="space-y-6">
                {/* Property Info */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-xl font-bold mb-4">{property.placeName}</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Location</p>
                      <p className="font-medium flex items-center">
                        <MapPin className="w-4 h-4 mr-1 text-gray-500" />
                        {property.location?.city}, {property.location?.state}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600">Partner</p>
                      <p className="font-medium">Property Owner</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600">Pricing</p>
                      <p className="font-bold text-lg">₹{property.rooms?.[0]?.pricing?.baseAdultsCharge || 2500}/night</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600">Capacity</p>
                      <p className="font-medium">
                        {property.rooms?.[0]?.occupancy?.maximumOccupancy || 4} guests, {property.rooms?.length || 2} bedrooms
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold leading-5 ${
                          property.status === "published"
                            ? "bg-green-100 text-green-800"
                            : property.status === "draft"
                            ? "bg-yellow-100 text-yellow-800"
                            : property.status === "pending"
                            ? "bg-orange-100 text-orange-800"
                            : property.status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {property.status}
                      </span>
                    </div>
                  </div>

                  {/* Relationship Manager */}
                  <div className="mt-6 pt-4 border-t">
                    <p className="text-sm text-gray-600 mb-2">Relationship Manager</p>
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mr-3">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">Sarah Johnson</p>
                        <p className="text-xs text-gray-600">Partner Success Agent</p>
                      </div>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p className="flex items-center text-gray-600">
                        <Phone className="w-4 h-4 mr-2" />
                        {property.mobileNumber}
                      </p>
                      <p className="flex items-center text-gray-600">
                        <Mail className="w-4 h-4 mr-2" />
                        {property.email}
                      </p>
                      <p className="text-gray-600">📊 Managing 23 properties</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  {/* Admin Review Actions - Only for pending properties */}
                  {isAdmin && property.status === "pending" && (
                    <>
                      <button 
                        className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        onClick={() => handleReviewClick("approve")}
                        disabled={reviewLoading}
                      >
                        {reviewLoading && reviewAction === "approve" ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                        ) : (
                          <Check className="w-5 h-5 mr-2" />
                        )}
                        Approve Property
                      </button>
                      <button 
                        className="w-full bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        onClick={() => handleReviewClick("reject")}
                        disabled={reviewLoading}
                      >
                        {reviewLoading && reviewAction === "reject" ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                        ) : (
                          <XIcon className="w-5 h-5 mr-2" />
                        )}
                        Reject Property
                      </button>
                    </>
                  )}
                  
                  {/* Other action buttons - always visible */}
                  <button className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-3 px-4 rounded-lg font-medium transition-colors">
                    Suspend Listing
                  </button>
                  <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg font-medium transition-colors">
                    Assign Manager
                  </button>
                  <button className="w-full bg-purple-500 hover:bg-purple-600 text-white py-3 px-4 rounded-lg font-medium transition-colors">
                    Validate Location
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Review Confirmation Popup */}
      {showReviewPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {reviewAction === "approve"
                ? "Approve Property"
                : "Reject Property"}
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to {reviewAction} the property "
              {property?.placeName}"?
              {reviewAction === "reject" &&
                " This will move it to rejected status."}
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
    </>
  );
};

export default PropertyDetailsModal;