// Step9Availability.jsx
"use client"
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updatePropertyStep9 } from '../../redux/features/property/propertySlice';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

const Step9Availability = ({ propertyData, nextStep, handleBack }) => {
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector(state => state.property);
  
  const [formData, setFormData] = useState({
    minNights: propertyData.availability?.minNights || 1,
    maxNights: propertyData.availability?.maxNights || 30,
    blockedDates: propertyData.availability?.blockedDates || []
  });
  
  const [errors, setErrors] = useState({});
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'minNights' || name === 'maxNights' ? parseInt(value, 10) : value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const handleDateSelect = (selectedDates) => {
    // Update blocked dates with the entire array of selected dates
    setFormData(prev => ({
      ...prev,
      blockedDates: selectedDates || []
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const newErrors = {};
    if (formData.minNights < 1) {
      newErrors.minNights = 'Minimum nights must be at least 1';
    }
    
    if (formData.maxNights < formData.minNights) {
      newErrors.maxNights = 'Maximum nights must be greater than or equal to minimum nights';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Dispatch update action
    const resultAction = await dispatch(updatePropertyStep9({
      id: propertyData._id,
      data: formData
    }));
    
    // If successful, move to next step
    if (!resultAction.error) {
      nextStep();
    }
  };
  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Set availability and booking rules</h2>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-6">
          <p>{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="block text-gray-700 mb-2 font-medium">Minimum stay nights</label>
          <input
            type="number"
            name="minNights"
            value={formData.minNights}
            onChange={handleChange}
            min="1"
            className={`w-full px-4 py-2 border ${errors.minNights ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
          />
          {errors.minNights && (
            <p className="mt-1 text-sm text-red-600">{errors.minNights}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            The minimum number of nights guests must book
          </p>
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 mb-2 font-medium">Maximum stay nights</label>
          <input
            type="number"
            name="maxNights"
            value={formData.maxNights}
            onChange={handleChange}
            min={formData.minNights}
            className={`w-full px-4 py-2 border ${errors.maxNights ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
          />
          {errors.maxNights && (
            <p className="mt-1 text-sm text-red-600">{errors.maxNights}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            The maximum number of nights guests can book
          </p>
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 mb-2 font-medium">Block specific dates</label>
          <p className="mb-2 text-sm text-gray-500">
            Select dates when your property is unavailable for booking
          </p>
          <div className="border border-gray-300 rounded-md p-4">
            <DayPicker
              mode="multiple"
              selected={formData.blockedDates}
              onSelect={handleDateSelect}
              className="availability-calendar"
              fromMonth={new Date()}
            />
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
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Continue'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Step9Availability;