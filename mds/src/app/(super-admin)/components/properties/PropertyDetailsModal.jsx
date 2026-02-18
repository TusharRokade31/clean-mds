"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  X, MapPin, Phone, Mail, User, CheckCircle, 
  FileText, Check, X as XIcon, Landmark, 
  Scale, CreditCard, Users, Download, FileEdit
} from "lucide-react";
// Admin Slice Actions
import { fetchUserById, clearSelectedUser } from "@/redux/features/admin/adminSlice"; 
// Property Slice Actions
import { reviewProperty, getAllProperties, getFinanceLegal } from "@/redux/features/property/propertySlice";
import toast from "react-hot-toast";

const PropertyDetailsModal = ({ property, isOpen, onClose }) => {
  const dispatch = useDispatch();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [showReviewPopup, setShowReviewPopup] = useState(false);
  const [reviewAction, setReviewAction] = useState("");

  const { selectedUser, isUserLoading } = useSelector((state) => ({
    selectedUser: state.admin.selectedUser,
    isUserLoading: state.admin.isLoading,
  }));

  const { currentFinanceLegal } = useSelector((state) => ({
    currentFinanceLegal: state.property.currentFinanceLegal,
  }));

  const { user: authUser } = useSelector((state) => ({
    user: state.auth.user,
  }));

  const isAdmin = authUser?.role === "admin";

  useEffect(() => {
    if (isOpen && property?.owner) {
      dispatch(fetchUserById(property.owner));
      dispatch(getFinanceLegal(property._id));
    }
    return () => {
      dispatch(clearSelectedUser());
    };
  }, [isOpen, property?.owner, property?._id, dispatch]);

  if (!isOpen || !property) return null;

  const getStatusIndex = () => {
    switch (property.status?.toLowerCase()) {
      case "draft": return 0;
      case "pending": return 1;
      case "published": return 3;
      default: return 2;
    }
  };

  const statusIndex = getStatusIndex();
  const verificationSteps = [
    { label: "Draft" },
    { label: "Approved" },
    { label: "published" }
  ];

  const availableAmenities = property.amenities?.basicFacilities 
    ? Object.keys(property.amenities.basicFacilities).filter(
        (key) => property.amenities.basicFacilities[key].available
      )
    : [];

  const primaryRoom = property.rooms?.[0] || {};

  const handleReviewConfirm = async () => {
    if (!property || !reviewAction) return;
    try {
      setReviewLoading(true);
      
      // Map actions to statuses
      let newStatus = "pending";
      if (reviewAction === "approve") newStatus = "published";
      if (reviewAction === "reject") newStatus = "rejected";
      if (reviewAction === "draft") newStatus = "draft";

      await dispatch(reviewProperty({ id: property._id, status: { status: newStatus } })).unwrap();
      dispatch(getAllProperties());
      toast.success(`Property status updated to ${newStatus} successfully!`);
      onClose();
    } catch (error) {
      toast.error(`Error: ${error.message || "Action failed"}`);
    } finally {
      setReviewLoading(false);
      setShowReviewPopup(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-60 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl">
          
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b bg-white">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{property.placeName}</h2>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-medium">{property.propertyType}</span>
                <span>•</span>
                <span>Built: {property.propertyBuilt}</span>
                <span>•</span>
                <span className="font-mono">ID: {property._id}</span>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-all">
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              <div className="lg:col-span-2 space-y-8">
                {/* 1. Workflow Progress */}
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-6">Verification Workflow</h3>
                  <div className="flex items-center justify-between">
                    {verificationSteps.map((step, index) => (
                      <div key={index} className="flex flex-1 items-center last:flex-none">
                        <div className="flex flex-col items-center gap-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                            index <= statusIndex ? "bg-green-600 text-white" : "bg-gray-200 text-gray-500"
                          }`}>
                            {index < statusIndex ? <Check className="w-4 h-4" /> : index + 1}
                          </div>
                          <span className={`text-xs font-medium ${index <= statusIndex ? "text-green-700" : "text-gray-400"}`}>{step.label}</span>
                        </div>
                        {index < verificationSteps.length - 1 && (
                          <div className={`flex-1 h-0.5 mx-4 ${index < statusIndex ? "bg-green-600" : "bg-gray-200"}`}></div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                 {/* 3. Media Gallery */}
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Media & Gallery</h3>
                  <div className="grid grid-cols-5 gap-3 h-64">
                    <div className="col-span-3 h-full rounded-lg overflow-hidden border">
                      <img 
                        src={property.media?.images?.[activeImageIndex]?.url} 
                        alt="Preview" 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div className="col-span-2 grid grid-cols-2 gap-2 overflow-y-auto pr-1">
                      {property.media?.images?.map((img, i) => (
                        <button 
                          key={img._id} 
                          onClick={() => setActiveImageIndex(i)}
                          className={`h-20 rounded-md overflow-hidden border-2 transition-all ${activeImageIndex === i ? "border-blue-600 scale-95" : "border-transparent opacity-70"}`}
                        >
                          <img src={img.url} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 2. Finance & Legal Details (NEW) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {/* Bank Details */}
                   <div className="bg-white p-6 rounded-xl border border-gray-200">
                      <div className="flex items-center gap-2 mb-4 text-blue-600 font-bold">
                        <Landmark className="w-5 h-5" />
                        <h3>Bank Details</h3>
                      </div>
                      {currentFinanceLegal?.finance?.bankDetails ? (
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between border-b pb-2"><span className="text-gray-500">Bank Name</span><span className="font-medium">{currentFinanceLegal.finance.bankDetails.bankName}</span></div>
                          <div className="flex justify-between border-b pb-2"><span className="text-gray-500">Account No.</span><span className="font-mono font-medium">{currentFinanceLegal.finance.bankDetails.accountNumber}</span></div>
                          <div className="flex justify-between border-b pb-2"><span className="text-gray-500">IFSC Code</span><span className="font-mono font-medium">{currentFinanceLegal.finance.bankDetails.ifscCode}</span></div>
                        </div>
                      ) : <p className="text-xs text-gray-400 italic">No bank details provided.</p>}
                   </div>

                   {/* Tax Details */}
                   <div className="bg-white p-6 rounded-xl border border-gray-200">
                      <div className="flex items-center gap-2 mb-4 text-indigo-600 font-bold">
                        <FileText className="w-5 h-5" />
                        <h3>Tax & Documents</h3>
                      </div>
                      {currentFinanceLegal?.finance?.taxDetails ? (
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between border-b pb-2"><span className="text-gray-500">PAN Card</span><span className="font-mono font-medium">{currentFinanceLegal.finance.taxDetails.pan}</span></div>
                          <div className="flex justify-between border-b pb-2"><span className="text-gray-500">GSTIN</span><span className="font-medium">{currentFinanceLegal.finance.taxDetails.gstin || "N/A"}</span></div>
                          <div className="flex justify-between border-b pb-2"><span className="text-gray-500">TAN</span><span className="font-medium">{currentFinanceLegal.finance.taxDetails.tan || "N/A"}</span></div>
                        </div>
                      ) : <p className="text-xs text-gray-400 italic">No tax details provided.</p>}
                   </div>
                </div>

                {/* Legal / Ownership Document */}
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-orange-600 font-bold">
                      <Scale className="w-5 h-5" />
                      <h3>Legal & Ownership</h3>
                    </div>
                    {currentFinanceLegal?.legal?.ownershipDetails?.registrationDocument?.url && (
                      <a 
                        href={currentFinanceLegal.legal.ownershipDetails.registrationDocument.url} 
                        target="_blank" 
                        className="flex items-center gap-1 text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" /> View Document
                      </a>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 text-xs mb-1">Ownership Type</p>
                      <p className="font-medium bg-gray-50 p-2 rounded">{currentFinanceLegal?.legal?.ownershipDetails?.ownershipType || "Not Specified"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs mb-1">Registered Address</p>
                      <p className="font-medium bg-gray-50 p-2 rounded">{currentFinanceLegal?.legal?.ownershipDetails?.propertyAddress || "Not Specified"}</p>
                    </div>
                  </div>
                </div>

               

                {/* 4. Amenities */}
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Amenities & Basic Facilities</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {availableAmenities.map((name) => (
                      <div key={name} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-medium text-gray-700">{name.replace(/([A-Z])/g, ' $1').trim()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4">Location</h3>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-red-500 mt-1" />
                    <div>
                      <p className="font-bold text-gray-900">{property.location?.houseName}</p>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {property.location?.street}, {property.location?.city},<br />
                        {property.location?.state} - {property.location?.postalCode}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-600 p-6 rounded-xl text-white shadow-lg">
                  <h3 className="text-xs font-bold uppercase tracking-widest opacity-70 mb-4">Registered Partner</h3>
                  {isUserLoading ? (
                    <div className="animate-pulse space-y-3">
                      <div className="w-12 h-12 bg-blue-400 rounded-full"></div>
                      <div className="h-4 bg-blue-400 rounded w-3/4"></div>
                    </div>
                  ) : selectedUser ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-600">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold">{selectedUser.name}</p>
                          <p className="text-[10px] opacity-70">UID: {selectedUser._id}</p>
                        </div>
                      </div>
                      <div className="space-y-2 border-t border-blue-400 pt-4 text-sm">
                        <div className="flex items-center gap-2"><Mail className="w-4 h-4 opacity-70" /> {selectedUser.email}</div>
                        <div className="flex items-center gap-2"><Phone className="w-4 h-4 opacity-70" /> {selectedUser.phoneNumber || property.mobileNumber}</div>
                      </div>
                    </div>
                  ) : <p className="text-xs italic opacity-60">Owner info unavailable.</p>}
                </div>

                {/* Admin Actions */}
                {/* Admin Actions */}
{isAdmin && (
  <div className="space-y-3">
    {property.status?.toLowerCase() === 'published' ? (
      // Actions for Published Properties
      <>
        <button 
          onClick={() => { setReviewAction("pending"); setShowReviewPopup(true); }}
          className="w-full bg-white border-2 border-orange-500 text-orange-600 hover:bg-orange-50 py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
        >
          <FileEdit className="w-5 h-5" /> Unpublish & Move to Draft
        </button>
        <button 
          onClick={() => { setReviewAction("reject"); setShowReviewPopup(true); }}
          className="w-full bg-white border-2 border-red-500 text-red-500 hover:bg-red-50 py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
        >
          <XIcon className="w-5 h-5" /> Reject Property
        </button>
      </>
    ) : property.status?.toLowerCase() === 'rejected' ? (
      // Actions for Rejected Properties
      <>
        <button 
          onClick={() => { setReviewAction("approve"); setShowReviewPopup(true); }}
          className="w-full bg-green-500 hover:bg-green-600 text-white py-3.5 rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2"
        >
          <Check className="w-5 h-5" /> Approve & Publish
        </button>
        <button 
          onClick={() => { setReviewAction("draft"); setShowReviewPopup(true); }}
          className="w-full bg-white border-2 border-gray-400 text-gray-600 hover:bg-gray-50 py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
        >
          <FileEdit className="w-5 h-5" /> Move to Draft
        </button>
      </>
    ) : (
      // Actions for Pending/Draft Properties
      <>
        <button 
          onClick={() => { setReviewAction("approve"); setShowReviewPopup(true); }}
          className="w-full bg-green-500 hover:bg-green-600 text-white py-3.5 rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2"
        >
          <Check className="w-5 h-5" /> Approve & Publish
        </button>
        <button 
          onClick={() => { setReviewAction("reject"); setShowReviewPopup(true); }}
          className="w-full bg-white border-2 border-red-500 text-red-500 hover:bg-red-50 py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
        >
          <XIcon className="w-5 h-5" /> Reject Property
        </button>
        <button 
          onClick={() => { setReviewAction("draft"); setShowReviewPopup(true); }}
          className="w-full bg-white border-2 border-gray-400 text-gray-600 hover:bg-gray-50 py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
        >
          <FileEdit className="w-5 h-5" /> Move to Draft
        </button>
      </>
    )}
  </div>
)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Confirmation Popup */}
      {showReviewPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
              reviewAction === 'approve' ? 'bg-green-100 text-green-600' : 
              reviewAction === 'reject' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
            }`}>
              {reviewAction === 'approve' ? <Check className="w-8 h-8" /> : 
               reviewAction === 'reject' ? <XIcon className="w-8 h-8" /> : <FileEdit className="w-8 h-8" />}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Confirm {reviewAction.charAt(0).toUpperCase() + reviewAction.slice(1)}</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to {reviewAction} "{property.placeName}"?
              {reviewAction === 'draft' && " This will allow the host to edit the property details again."}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowReviewPopup(false)} className="flex-1 py-3 border border-gray-300 rounded-lg font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
              <button 
                onClick={handleReviewConfirm}
                disabled={reviewLoading}
                className={`flex-1 py-3 text-white rounded-lg font-bold ${
                  reviewAction === 'approve' ? 'bg-green-600' : 
                  reviewAction === 'reject' ? 'bg-red-600' : 'bg-gray-600'
                }`}
              >
                {reviewLoading ? "Processing..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PropertyDetailsModal;