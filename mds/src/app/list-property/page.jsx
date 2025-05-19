"use client"
import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  initializeProperty, 
  getProperty, 
  resetCurrentProperty,
  getDraftProperties
} from '../../redux/features/property/propertySlice';

// Step components (will be defined below)
import Step1PropertyType from '@/component/steps/Step1PropertyType';
import Step2Location from '@/component/steps/Step2Location';
import Step3Size from '@/component/steps/Step3Size';
import Step4Amenities from '@/component/steps/Step4Amenities';
import Step5Rules from '@/component/steps/Step5Rules';
import Step6Description from '@/component/steps/Step6Description';
import Step7Images from '@/component/steps/Step7Images';
import Step8Pricing from '@/component/steps/Step8Pricing';
import Step9Availability from '@/component/steps/Step9Availability';
import FinalReview from '@/component/steps/FinalReview';
import { useParams, useRouter } from 'next/navigation';
import Congratulations from '@/component/steps/Congratulations';



// Progress indicator component
const ProgressIndicator = ({ currentStep, totalSteps }) => {
  return (
    <div className="w-full mt-14 mb-5">
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium">Step {currentStep} of {totalSteps}</span>
        <span className="text-sm font-medium">{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300 ease-in-out" 
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        ></div>
      </div>
    </div>
  );
};

const PropertyForm = () => {
  const { id } = useParams();
  const navigate = useRouter();
  const dispatch = useDispatch();
  
  const { currentProperty, isLoading, error, draftProperties } = useSelector(state => state.property);
  const [currentStep, setCurrentStep] = useState(1);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const totalSteps = 10;
  
  // Create a ref outside of useEffect
  const hasInitializedRef = useRef(false)

  // Separate initialization status into a dedicated effect
  useEffect(() => {
    // Create a variable to track if we're already initializing
    let isInitializing = false;
    
    // This effect only runs once when component mounts
    if (!hasInitializedRef.current && !isInitializing) {
      isInitializing = true;
      hasInitializedRef.current = true;
      
      // Slight timeout to ensure any potential double-mount has settled
      const timer = setTimeout(() => {
        if (id) {
          dispatch(getProperty(id));
        } else {
          dispatch(getDraftProperties()).then(result => {
            if (result.payload && result.payload.length > 0) {
              setShowDraftModal(true);
            } else {
              dispatch(initializeProperty());
            }
          }).catch(err => {
            console.error("Error fetching draft properties:", err);
            dispatch(initializeProperty());
          });
        }
      }, 10);
      
      return () => {
        clearTimeout(timer);
      };
    }
  }, [dispatch, id]);
  
  // Handle unmount separately
  useEffect(() => {
    return () => {
      dispatch(resetCurrentProperty());
      hasInitializedRef.current = false;
    };
  }, [dispatch]);

  // Update current step based on property data
  // useEffect(() => {
  //   if (currentProperty && currentProperty.currentStep && currentStep === 1) {
  //     setCurrentStep(currentProperty.currentStep);
  //   }
  // }, [currentProperty, currentStep]);

  console.log(currentStep)
  
  const handleNext = () => {
      setCurrentStep(prev => prev + 1);
      window.scrollTo(0, 0);
  };

const handleBack = () => {
  if (currentStep > 1) {
    setCurrentStep(prev => prev - 1);
    window.scrollTo(0, 0);
  
    
  } else {
    navigate.push('/'); // Go back to previous page
  }
};

const handleFinish = () => {
    setFormSubmitted(true);
    setShowCongratulations(true);
  };

   const selectDraftProperty = (propertyId) => {
    dispatch(getProperty(propertyId));
    setShowDraftModal(false);
  };

  const createNewProperty = () => {
    dispatch(initializeProperty());
    setShowDraftModal(false);
  };

  // Draft selection modal
const DraftPropertyModal = () => {
    if (!showDraftModal) return null;
    
    return (
      <div className="fixed inset-0 backdrop-blur-sm  bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 shadow-2xl max-w-md w-full">
          <h2 className="text-xl font-bold mb-4">Continue your listing</h2>
          <p className="mb-4">You have unfinished property listings. Would you like to continue working on one of them?</p>
          
          <div className="max-h-60 overflow-y-auto mb-4">
            {draftProperties.map(property => (
              <div 
                key={property._id} 
                className="p-3 border border-gray-200 rounded-md mb-2 hover:bg-gray-50 cursor-pointer"
                onClick={() => selectDraftProperty(property._id)}
              >
                <h3 className="font-medium">{property.propertyType || `Draft property (Step ${property.currentStep})`}</h3>
                <p className="text-sm text-gray-500">Last updated: {new Date(property.updatedAt).toLocaleString()}</p>
              </div>
            ))}
          </div>
          
          <div className="flex justify-between">
            <button 
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              onClick={createNewProperty}
            >
              Create new listing
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading && !currentProperty) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }



  // Render current step
  const renderStep = () => {
    if (!currentProperty) return null;

    if (showCongratulations) {
      return <Congratulations propertyData={currentProperty} />;
    }


    switch (currentStep) {
      case 1:
        return <Step1PropertyType propertyData={currentProperty} nextStep={handleNext} handleBack={handleBack} />;
      case 2:
        return <Step2Location propertyData={currentProperty} nextStep={handleNext} handleBack={handleBack}  />;
      case 3:
        return <Step3Size propertyData={currentProperty} nextStep={handleNext} handleBack={handleBack}  />;
      case 4:
        return <Step4Amenities propertyData={currentProperty} nextStep={handleNext} handleBack={handleBack} />;
      case 5:
        return <Step5Rules propertyData={currentProperty} nextStep={handleNext} handleBack={handleBack} />;
      case 6:
        return <Step6Description propertyData={currentProperty} nextStep={handleNext} handleBack={handleBack} />;
      case 7:
        return <Step7Images propertyData={currentProperty} nextStep={handleNext} handleBack={handleBack} />;
      case 8:
        return <Step8Pricing propertyData={currentProperty} nextStep={handleNext} handleBack={handleBack} />;
      case 9:
        return <Step9Availability propertyData={currentProperty} nextStep={handleNext} handleBack={handleBack} />;
      case 10:
        return <FinalReview propertyData={currentProperty} formSubmitted={formSubmitted} onComplete={handleFinish} />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
       <DraftPropertyModal />
       
       {!showCongratulations && (
        <ProgressIndicator currentStep={currentStep} totalSteps={totalSteps} />
      )}
      
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-lg shadow-md p-6"
        >
          
          {renderStep()}
        </motion.div>
      </AnimatePresence>
      
      <div className="flex justify-between mt-8">
        {/* <button
          onClick={handleBack}
          className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Go back
        </button> */}
        
        {/* {currentStep < totalSteps && (
          <button
            onClick={handleNext}
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Continue'}
          </button>
        )} */}
      </div>
    </div>
  );
};

export default PropertyForm;