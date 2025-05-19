// FinalReview.jsx
"use client"
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { finalizeProperty } from '../../redux/features/property/propertySlice';
import Congratulations from './Congratulations';

const FinalReview = ({ propertyData, onComplete, formSubmitted, handleBack }) => {
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector(state => state.property);
  
  const [submitting, setSubmitting] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Format currency for display
  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD'
    }).format(amount);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate agreement
    if (!agreeTerms) {
      setErrors({ agreement: 'You must agree to the terms and conditions' });
      return;
    }
    
    setSubmitting(true);
    
    // Dispatch finalize action
    const resultAction = await dispatch(finalizeProperty(propertyData._id));
    
    // If successful, call the completion handler
    if (!resultAction.error) {
      onComplete();
    }
    
    setSubmitting(false);
  };

  {formSubmitted && <Congratulations propertyData={propertyData} />}
  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Final Review</h2>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-6">
          <p>{error}</p>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4">{propertyData.placeName}</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Property Type & Rental Form */}
          <div className="border-b pb-4">
            <h4 className="font-medium text-gray-700">Property Type</h4>
            <p>{propertyData.propertyType}</p>
            <h4 className="font-medium text-gray-700 mt-2">Rental Form</h4>
            <p>{propertyData.rentalForm}</p>
          </div>
          
          {/* Location */}
          <div className="border-b pb-4">
            <h4 className="font-medium text-gray-700">Location</h4>
            <p>
              {propertyData.location?.street}{propertyData.location?.roomNumber ? `, Room ${propertyData.location.roomNumber}` : ''}<br />
              {propertyData.location?.city}, {propertyData.location?.state} {propertyData.location?.postalCode}<br />
              {propertyData.location?.country}
            </p>
          </div>
          
          {/* Size */}
          <div className="border-b pb-4">
            <h4 className="font-medium text-gray-700">Capacity & Size</h4>
            <ul className="mt-1">
              <li>Guests: {propertyData.size?.guests}</li>
              <li>Bedrooms: {propertyData.size?.bedrooms}</li>
              <li>Beds: {propertyData.size?.beds}</li>
              <li>Bathrooms: {propertyData.size?.bathrooms}</li>
              <li>Kitchens: {propertyData.size?.kitchens}</li>
              <li>Acreage: {propertyData.size?.acreage}</li>
            </ul>
          </div>
          
          {/* Pricing */}
          <div className="border-b pb-4">
            <h4 className="font-medium text-gray-700">Pricing</h4>
            <ul className="mt-1">
              <li>Weekday: {formatCurrency(propertyData.pricing?.weekdayPrice, propertyData.pricing?.currency)}</li>
              <li>Weekend: {formatCurrency(propertyData.pricing?.weekendPrice, propertyData.pricing?.currency)}</li>
              {propertyData.pricing?.monthlyDiscount && (
                <li>Monthly discount: {propertyData.pricing.monthlyDiscount}%</li>
              )}
            </ul>
          </div>
          
          {/* Availability */}
          <div className="border-b pb-4">
            <h4 className="font-medium text-gray-700">Booking Rules</h4>
            <ul className="mt-1">
              <li>Minimum stay: {propertyData.availability?.minNights || 1} nights</li>
              <li>Maximum stay: {propertyData.availability?.maxNights || 30} nights</li>
              <li>Blocked dates: {propertyData.availability?.blockedDates?.length || 0}</li>
            </ul>
          </div>
          
          {/* House Rules */}
          <div className="border-b pb-4">
            <h4 className="font-medium text-gray-700">House Rules</h4>
            <ul className="mt-1">
              <li>Smoking: {propertyData.rules?.smoking ? 'Allowed' : 'Not allowed'}</li>
              <li>Pets: {propertyData.rules?.pets ? 'Allowed' : 'Not allowed'}</li>
              <li>Parties: {propertyData.rules?.partyOrganizing ? 'Allowed' : 'Not allowed'}</li>
              <li>Cooking: {propertyData.rules?.cooking ? 'Allowed' : 'Not allowed'}</li>
            </ul>
            {propertyData.rules?.additionalRules && (
              <div className="mt-2">
                <h5 className="font-medium text-gray-700">Additional Rules:</h5>
                <p className="text-sm">{propertyData.rules.additionalRules}</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Description */}
        <div className="mt-4">
          <h4 className="font-medium text-gray-700">Description</h4>
          <p className="mt-1 text-gray-600">{propertyData.description}</p>
        </div>
        
        {/* Images Preview */}
        {(propertyData.images?.cover || propertyData.images?.additional?.length > 0) && (
          <div className="mt-6">
            <h4 className="font-medium text-gray-700 mb-2">Images</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {propertyData.images?.cover && (
                <div className="relative aspect-square overflow-hidden rounded-md">
                  <img 
                  src={`http://localhost:5000/${propertyData.images.cover || ''}`}
                    // src={ typeof propertyData.images.cover === 'string' ? propertyData.images.cover : URL.createObjectURL(propertyData.images.cover)}
                    alt="Cover" 
                    className="object-cover w-full h-full"
                  />
                  <div className="absolute top-0 left-0 bg-indigo-500 text-white text-xs px-2 py-1 rounded-br-md">
                    Cover
                  </div>
                </div>
              )}
              
              {propertyData.images?.additional?.map((image, index) => (
                <div key={index} className="aspect-square overflow-hidden rounded-md">
                  <img 
                   src={`http://localhost:5000/${image || ''}`}
                    // src={typeof image === 'string' ? image : URL.createObjectURL(image)}
                    alt={`Property ${index + 1}`} 
                    className="object-cover w-full h-full"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Finalize form */}
      <form onSubmit={handleSubmit} className="mt-6">
        <div className="mb-6">
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="agreeTerms"
                type="checkbox"
                checked={agreeTerms}
                onChange={() => setAgreeTerms(!agreeTerms)}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="agreeTerms" className="font-medium text-gray-700">
                I confirm that all information provided is accurate and I agree to the terms and conditions
              </label>
              {errors.agreement && (
                <p className="text-red-600 mt-1">{errors.agreement}</p>
              )}
            </div>
          </div>
        </div>
        
   <div className="flex justify-between mt-8">
        <button
          type='button'
          onClick={handleBack}
          className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Go back
        </button>
          <button
            type="submit"
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
            disabled={isLoading || submitting}
          >
            {isLoading || submitting ? 'Submitting...' : 'Submit Property for Review'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FinalReview;