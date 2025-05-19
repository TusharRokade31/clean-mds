// Step7Images.jsx
"use client"
import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updatePropertyStep7 } from '../../redux/features/property/propertySlice';

const Step7Images = ({ propertyData, nextStep, handleBack }) => {
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector(state => state.property);
  const fileInputCoverRef = useRef(null);
  const fileInputAdditionalRef = useRef(null);
  
  const [coverImage, setCoverImage] = useState(propertyData.images?.cover || null);
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [additionalImages, setAdditionalImages] = useState(propertyData.images?.additional || []);
  const [additionalImageFiles, setAdditionalImageFiles] = useState([]);
  const [errors, setErrors] = useState({});
  
  const handleCoverImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverImageFile(file);
      setCoverImage(URL.createObjectURL(file));
      
      // Clear error for this field
      if (errors.coverImage) {
        setErrors(prev => ({ ...prev, coverImage: '' }));
      }
    }
  };
  
  const handleAdditionalImagesChange = (e) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const newImageFiles = [...additionalImageFiles, ...files];
      setAdditionalImageFiles(newImageFiles);
      
      const newImagePreviews = files.map(file => URL.createObjectURL(file));
      setAdditionalImages(prev => [...prev, ...newImagePreviews]);
      
      // Clear error for this field
      if (errors.additionalImages) {
        setErrors(prev => ({ ...prev, additionalImages: '' }));
      }
    }
  };
  
  const removeAdditionalImage = (index) => {
    const newAdditionalImages = [...additionalImages];
    newAdditionalImages.splice(index, 1);
    setAdditionalImages(newAdditionalImages);
    
    // If it's a newly added image, also remove from files array
    if (index >= propertyData.images?.additional?.length || 0) {
      const newAdditionalImageFiles = [...additionalImageFiles];
      newAdditionalImageFiles.splice(index - (propertyData.images?.additional?.length || 0), 1);
      setAdditionalImageFiles(newAdditionalImageFiles);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const newErrors = {};
    if (!coverImage && !coverImageFile) {
      newErrors.coverImage = 'Cover image is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Create form data for file upload
    const formData = new FormData();
    if (coverImageFile) {
      formData.append('cover', coverImageFile);
    }
    
    additionalImageFiles.forEach(file => {
      formData.append('additional', file);
    });
    
    const resultAction = await dispatch(updatePropertyStep7({
      id: propertyData._id,
      formData
    }));
    
    if (!resultAction.error) {
      nextStep();
    }
  };
  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Add property photos</h2>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-6">
          <p>{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-8">
          <label className="block text-gray-700 mb-2 font-medium">Cover photo</label>
          <div 
            className={`border-2 border-dashed ${errors.coverImage ? 'border-red-500' : 'border-gray-300'} rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50`}
            onClick={() => fileInputCoverRef.current.click()}
          >
            {coverImage ? (
              <div className="relative w-full">
                <img 
                  // src={coverImage} 
                    src={`http://localhost:5000/${coverImage || ''}`}
                  alt="Cover preview" 
                  className="mx-auto max-h-64 object-contain"
                />
                <button
                  type="button"
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCoverImage(null);
                    setCoverImageFile(null);
                  }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <>
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <p className="mt-2 text-sm text-gray-500">Click to upload your cover photo</p>
              </>
            )}
            <input
              ref={fileInputCoverRef}
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleCoverImageChange}
            />
          </div>
          {errors.coverImage && (
            <p className="mt-1 text-sm text-red-600">{errors.coverImage}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            This will be the main photo shown in search results
          </p>
        </div>
        
        <div className="mb-8">
          <label className="block text-gray-700 mb-2 font-medium">Additional photos</label>
          <div 
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50"
            onClick={() => fileInputAdditionalRef.current.click()}
          >
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <p className="mt-2 text-sm text-gray-500">Click to upload additional photos</p>
            <input
              ref={fileInputAdditionalRef}
              type="file"
              className="hidden"
              accept="image/*"
              multiple
              onChange={handleAdditionalImagesChange}
            />
          </div>
          
          {additionalImages.length > 0 && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {additionalImages.map((image, index) => (
                <div key={index} className="relative">
                  <img 
                    // src={image} 
                    src={`http://localhost:5000/${image || ''}`}
                    alt={`Additional ${index + 1}`} 
                    className="h-32 w-full object-cover rounded-md"
                  />
                  <button
                    type="button"
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    onClick={() => removeAdditionalImage(index)}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <p className="mt-1 text-sm text-gray-500">
            Add multiple photos to show different aspects of your property
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
            {isLoading ? 'Uploading...' : 'Continue'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Step7Images;