'use client'
import PropTypes from 'prop-types';
import { useTheme } from '@mui/material/styles';
import { 
  Tabs, Tab, Typography, Box, Button, 
  Paper, Alert, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { 
  initializeProperty, 
  getProperty, 
  resetCurrentProperty,
  getDraftProperties,
  updateBasicInfo,
  updateLocation,
  updateAmenities,
} from '@/redux/features/property/propertySlice';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import BasicInfoForm from '@/component/BasicInfoForm';
import LocationForm from '@/component/LocationForm';
import AmenitiesForm from '@/component/AmenitiesForm';
import RoomsForm from '@/component/RoomsForm';
import MediaForm from '@/component/MediaForm';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`property-tabpanel-${index}`}
      aria-labelledby={`property-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

export default function PropertyForm() {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const { id } = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  
  const { currentProperty, isLoading, error } = useSelector(state => state.property);
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [draftProperties, setDraftProperties] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});

  const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateMobileNumber = (mobile) => {
  // Remove any non-digit characters for validation
  const cleanMobile = mobile.replace(/\D/g, '');
  return cleanMobile.length === 10;
};

const validateLandline = (landline) => {
  if (!landline) return true; // Landline is optional
  const cleanLandline = landline.replace(/\D/g, '');
  return cleanLandline.length >= 10 && cleanLandline.length <= 11;
};



  const [formData, setFormData] = useState({
    basicInfo: {
      propertyType: '', placeName: '', placeRating: '',
      propertyBuilt: '', bookingSince: '', rentalForm: '', email:'', mobileNumber:'', landline:''
    },
    location: {
      houseName:'', country: '', street: '', roomNumber: '', city: '',
      state: '', postalCode: '', coordinates: { lat: null, lng: null }
    },
    amenities: {
      mandatory: {}, basicFacilities: {}, generalServices: {},
      commonArea: {}, foodBeverages: {}, healthWellness: {},
      mediaTechnology: {}, paymentServices: {}, security: {}, safety: {}
    },
    rooms: []
  });

  const propertyId = id?.[0];
  const steps = ['Basic Info', 'Location', 'Amenities', 'Rooms', 'Photos & Videos', 'Policies', 'Finance & Legal'];

  // Initialize property - simplified logic
  useEffect(() => {
    const initialize = async () => {
      if (propertyId && propertyId !== 'new') {
        // Load existing property
        dispatch(getProperty(propertyId));
      } else {
        // Check for drafts first
        const draftsResult = await dispatch(getDraftProperties());
        const drafts = draftsResult.payload || [];
        
        if (drafts.length > 0 && !sessionStorage.getItem('skipDrafts')) {
          setDraftProperties(drafts);
          setShowDraftModal(true);
        } else {
          createNewProperty();
        }
      }
    };

    initialize();
    
    // Cleanup
    return () => {
      dispatch(resetCurrentProperty());
      sessionStorage.removeItem('skipDrafts');
    };
  }, [propertyId]);

  // Create new property
  const createNewProperty = async () => {
    try {
      const result = await dispatch(initializeProperty()).unwrap();
      console.log(result?.property?._id, "creating new property ")
      if (result?.property?._id) {
        setShowDraftModal(false);
        router.push(`/host/onboarding/${result?.property?._id}`);
      }
    } catch (error) {
      console.error('Failed to create property:', error);
      setShowDraftModal(false);
    }
  };

  // Handle draft selection
  const selectDraftProperty = (draftId) => {
    setShowDraftModal(false);
    router.push(`/host/onboarding/${draftId}`);
  };

  // Handle new property creation from modal
  const handleCreateNew = () => {
    sessionStorage.setItem('skipDrafts', 'true');
    createNewProperty();
  };

  // Update form data when property loads
  useEffect(() => {
    if (currentProperty) {
      setFormData({
        basicInfo: {
          propertyType: currentProperty.propertyType || '',
          placeName: currentProperty.placeName || '',
          placeRating: currentProperty.placeRating || '',
          propertyBuilt: currentProperty.propertyBuilt || '',
          bookingSince: currentProperty.bookingSince || '',
          rentalForm: currentProperty.rentalForm || '',
          email: currentProperty.email || '', 
          mobileNumber: currentProperty.mobileNumber || '', 
          landline: currentProperty.landline || ''
        },
        location: {
          houseName: currentProperty.location?.houseName || '',
          country: currentProperty.location?.country || '',
          street: currentProperty.location?.street || '',
          roomNumber: currentProperty.location?.roomNumber || '',
          city: currentProperty.location?.city || '',
          state: currentProperty.location?.state || '',
          postalCode: currentProperty.location?.postalCode || '',
          coordinates: currentProperty.location?.coordinates || { lat: null, lng: null }
        },
        amenities: currentProperty.amenities || {
          mandatory: {}, basicFacilities: {}, generalServices: {},
          commonArea: {}, foodBeverages: {}, healthWellness: {},
          mediaTechnology: {}, paymentServices: {}, security: {}, safety: {}
        },
        rooms: currentProperty.rooms || []
      });

      // Set active tab based on form progress
      const progress = currentProperty.formProgress;
      if (progress) {
        if (!progress.step1Completed) setActiveTab(0);
        else if (!progress.step2Completed) setActiveTab(1);
        else if (!progress.step3Completed) setActiveTab(2);
        else if (!progress.step4Completed) setActiveTab(3);
        else if (!progress.step5Completed) setActiveTab(4);
        else setActiveTab(5);
      }
    }
  }, [currentProperty]);

  // Validation functions
  const validateStep = (stepIndex) => {
    const errors = {};
    
    switch(stepIndex) {
      case 0: // Basic Info
        if (!formData.basicInfo.propertyType) errors.propertyType = 'Property type is required';
        if (!formData.basicInfo.placeName) errors.placeName = 'Place name is required';
        if (!formData.basicInfo.placeRating) errors.placeRating = 'Rating is required';
        if (!formData.basicInfo.propertyBuilt) errors.propertyBuilt = 'Built year is required';
        if (!formData.basicInfo.bookingSince) errors.bookingSince = 'Booking since date is required';
        if (!formData.basicInfo.rentalForm) errors.rentalForm = 'Rental form is required';

         // New validations for email, mobile, landline
      if (!formData.basicInfo.email) {
        errors.email = 'Email is required';
      } else if (!validateEmail(formData.basicInfo.email)) {
        errors.email = 'Please enter a valid email address';
      }
      
      if (!formData.basicInfo.mobileNumber) {
        errors.mobileNumber = 'Mobile number is required';
      } else if (!validateMobileNumber(formData.basicInfo.mobileNumber)) {
        errors.mobileNumber = 'Mobile number must be exactly 10 digits';
      }
      
      if (formData.basicInfo.landline && !validateLandline(formData.basicInfo.landline)) {
        errors.landline = 'Enter a valid number';
      }

        break;
        
      case 1: // Location
        if (!formData.location.houseName) errors.houseName = 'This field is required';
        if (!formData.location.country) errors.country = 'This field is required';
        if (!formData.location.street) errors.street = 'This field is required';
        if (!formData.location.city) errors.city = 'This field is required';
        if (!formData.location.state) errors.state = 'This field is required';
        if (!formData.location.postalCode) errors.postalCode = 'This field is required';
        break;
        
      case 3: // Rooms
        if (formData.rooms.length === 0) errors.rooms = 'Please add at least one room';
        break;
    }
    
    return errors;
  };

  // Handle input changes
  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }));
    
    // Clear validation errors
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Handle tab change - allow free navigation
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setValidationErrors({});
  };

  // Save current step
  const saveCurrentStep = async () => {
    if (!currentProperty?._id) return false;

    const errors = validateStep(activeTab);
    console.log(errors)
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return false;
    }

    try {
      let result;
      
      switch(activeTab) {
        case 0:
          result = await dispatch(updateBasicInfo({
            id: currentProperty._id,
            data: formData.basicInfo
          }));
          break;
        case 1:
          result = await dispatch(updateLocation({
            id: currentProperty._id,
            data: formData.location
          }));
          break;
        case 2:
          result = await dispatch(updateAmenities({
            id: currentProperty._id,
            data: { amenities: formData.amenities }
          }));
          break;
        default:
          return true; // For steps that handle their own saving
      }
      
      return result && result.type.endsWith('/fulfilled');
    } catch (error) {
      console.log(error)
      setValidationErrors({ save: 'Failed to save data' });
      return false;
    }
  };

  // Handle next button
  const handleNext = async () => {
    const success = await saveCurrentStep();
    if (success && activeTab < steps.length - 1) {
      setActiveTab(activeTab + 1);
    }
  };

  // Handle previous button
  const handlePrevious = () => {
    if (activeTab > 0) {
      setActiveTab(activeTab - 1);
      setValidationErrors({});
    }
  };

  // Handle completion
  const handleComplete = async () => {
    const success = await saveCurrentStep();
    if (success) {
      router.push('/host/properties');
    }
  };

  if (isLoading && !currentProperty) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <>
      {/* Draft Properties Modal */}
      <Dialog open={showDraftModal} onClose={() => setShowDraftModal(false)} maxWidth="md">
        <DialogTitle>Continue Your Listing</DialogTitle>
        <DialogContent>
          <Typography className="mb-4">
            You have unfinished property listings. Would you like to continue working on one of them?
          </Typography>
          
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {draftProperties.map(property => (
              <div 
                key={property._id} 
                className="p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer"
                onClick={() => selectDraftProperty(property._id)}
              >
                <h3 className="font-medium">
                  {property.placeName || property.propertyType || 'Draft property'}
                </h3>
                <p className="text-sm text-gray-500">
                  Last updated: {new Date(property.updatedAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCreateNew} variant="contained">
            Create New Listing
          </Button>
        </DialogActions>
      </Dialog>

      <Paper className="max-w-7xl mx-auto my-8 p-4">
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {validationErrors.save && <Alert severity="error" sx={{ mb: 2 }}>{validationErrors.save}</Alert>}
        {validationErrors.rooms && <Alert severity="error" sx={{ mb: 2 }}>{validationErrors.rooms}</Alert>}
        
        <Box sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              textColor="primary"
              indicatorColor="primary"
            >
              {steps.map((step, index) => (
                <Tab key={index} label={step} />
              ))}
            </Tabs>
          </Box>
          
          <TabPanel value={activeTab} index={0}>
            <BasicInfoForm 
              formData={formData.basicInfo}
              onChange={(field, value) => handleInputChange('basicInfo', field, value)}
              errors={validationErrors}
            />
          </TabPanel>
          
          <TabPanel value={activeTab} index={1}>
            <LocationForm 
              formData={formData.location}
              onChange={(field, value) => handleInputChange('location', field, value)}
              errors={validationErrors}
            />
          </TabPanel>
          
          <TabPanel value={activeTab} index={2}>
            <AmenitiesForm 
              formData={formData.amenities}
              onChange={(updatedAmenities) => {
                setFormData(prev => ({ ...prev, amenities: updatedAmenities }));
              }}
              errors={validationErrors}
            />
          </TabPanel>
          
          <TabPanel value={activeTab} index={3}>
            <RoomsForm 
              rooms={formData.rooms}
              propertyId={currentProperty?._id}
              onAddRoom={(updatedRooms) => {
                setFormData(prev => ({ ...prev, rooms: updatedRooms }));
              }}
            />
          </TabPanel>
          
          <TabPanel value={activeTab} index={4}>
            <MediaForm propertyId={currentProperty?._id} />
          </TabPanel>
          
          <TabPanel value={activeTab} index={5}>
            <Typography variant="h6">Policies</Typography>
            <Typography>Configure your property policies here...</Typography>
          </TabPanel>
          
          <TabPanel value={activeTab} index={6}>
            <Typography variant="h6">Finance & Legal</Typography>
            <Typography>Configure finance and legal information here...</Typography>
          </TabPanel>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button
            variant="outlined"
            disabled={activeTab === 0}
            onClick={handlePrevious}
          >
            Previous
          </Button>
          
          {activeTab < steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save & Continue'}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleComplete}
              disabled={isLoading}
            >
              {isLoading ? 'Completing...' : 'Complete Listing'}
            </Button>
          )}
        </Box>
      </Paper>
    </>
  );
}