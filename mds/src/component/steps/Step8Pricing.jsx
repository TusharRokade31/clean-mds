// Step8Pricing.jsx
"use client"
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updatePropertyStep8 } from '../../redux/features/property/propertySlice';

const currencies = [
  { code: 'USD', label: 'USD ($)' },
  { code: 'EUR', label: 'EUR (€)' },
  { code: 'GBP', label: 'GBP (£)' },
  { code: 'INR', label: 'INR (₹)' }
];

const Step8Pricing = ({ propertyData, nextStep, handleBack }) => {
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector(state => state.property);
  
  const [formData, setFormData] = useState({
    currency: propertyData.pricing?.currency || 'USD',
    weekdayPrice: propertyData.pricing?.weekdayPrice || '',
    weekendPrice: propertyData.pricing?.weekendPrice || '',
    monthlyDiscount: propertyData.pricing?.monthlyDiscount || 0
  });
  
  const [errors, setErrors] = useState({});
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'monthlyDiscount' ? parseInt(value) : value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const newErrors = {};
    if (!formData.weekdayPrice) {
      newErrors.weekdayPrice = 'Weekday price is required';
    } else if (isNaN(formData.weekdayPrice) || formData.weekdayPrice <= 0) {
      newErrors.weekdayPrice = 'Please enter a valid price';
    }
    
    if (!formData.weekendPrice) {
      newErrors.weekendPrice = 'Weekend price is required';
    } else if (isNaN(formData.weekendPrice) || formData.weekendPrice <= 0) {
      newErrors.weekendPrice = 'Please enter a valid price';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    const resultAction = await dispatch(updatePropertyStep8({
      id: propertyData._id,
      data: {
        ...formData,
        weekdayPrice: parseFloat(formData.weekdayPrice),
        weekendPrice: parseFloat(formData.weekendPrice)
      }
    }));
    
    if (!resultAction.error) {
      nextStep();
    }
  };
  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Set your pricing</h2>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-6">
          <p>{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="block text-gray-700 mb-2 font-medium">Currency</label>
          <div className="relative">
            <select
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {currencies.map(currency => (
                <option key={currency.code} value={currency.code}>{currency.label}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 mb-2 font-medium">Weekday price (per night)</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <span className="text-gray-500">
                {formData.currency === 'USD' ? '$' : 
                 formData.currency === 'EUR' ? '€' : 
                 formData.currency === 'GBP' ? '£' : 
                 formData.currency === 'INR' ? '₹' : '$'}
              </span>
            </div>
            <input
              type="number"
              name="weekdayPrice"
              value={formData.weekdayPrice}
              onChange={handleChange}
              placeholder="0.00"
              min="0"
              step="0.01"
              className={`w-full pl-8 px-4 py-2 border ${errors.weekdayPrice ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            />
          </div>
          {errors.weekdayPrice && (
            <p className="mt-1 text-sm text-red-600">{errors.weekdayPrice}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            This will be your standard rate for Monday through Thursday
          </p>
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 mb-2 font-medium">Weekend price (per night)</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <span className="text-gray-500">
                {formData.currency === 'USD' ? '$' : 
                 formData.currency === 'EUR' ? '€' : 
                 formData.currency === 'GBP' ? '£' : 
                 formData.currency === 'INR' ? '₹' : '$'}
              </span>
            </div>
            <input
              type="number"
              name="weekendPrice"
              value={formData.weekendPrice}
              onChange={handleChange}
              placeholder="0.00"
              min="0"
              step="0.01"
              className={`w-full pl-8 px-4 py-2 border ${errors.weekendPrice ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            />
          </div>
          {errors.weekendPrice && (
            <p className="mt-1 text-sm text-red-600">{errors.weekendPrice}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            This will be your rate for Friday, Saturday and Sunday
          </p>
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 mb-2 font-medium">Monthly discount (%)</label>
          <div className="flex items-center">
            <input
              type="range"
              name="monthlyDiscount"
              value={formData.monthlyDiscount}
              onChange={handleChange}
              min="0"
              max="30"
              step="5"
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <span className="ml-4 text-lg font-medium">{formData.monthlyDiscount}%</span>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Offer a discount for stays longer than 28 nights
          </p>
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
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Continue'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Step8Pricing;