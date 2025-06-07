'use client'
import PropTypes from 'prop-types';
import { useTheme } from '@mui/material/styles';
import { 
  Tabs, Tab, Typography, Box, Button, 
  Stepper, Step, StepLabel, Paper, Alert
} from '@mui/material';
import { 
  initializeProperty, 
  getProperty, 
  resetCurrentProperty,
  getDraftProperties,
  updateBasicInfo,
  updateLocation,
  updateAmenities,
  addRooms,
  updateRoom
} from '@/redux/features/property/propertySlice';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import BasicInfoForm from '@/component/BasicInfoForm';
import LocationForm from '@/component/LocationForm';
import AmenitiesForm from '@/component/AmenitiesForm';
import RoomsForm from '@/component/RoomsForm';
import MediaForm from '@/component/MediaForm';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`property-tabpanel-${index}`}
      aria-labelledby={`property-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `property-tab-${index}`,
    'aria-controls': `property-tabpanel-${index}`,
  };
}

export default function PropertyForm() {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const { id } = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  
  const { currentProperty, isLoading, error, draftProperties } = useSelector(state => state.property);
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [formData, setFormData] = useState({
    basicInfo: {
      propertyType: '',
      placeName: '',
      placeRating: '',
      propertyBuilt: '',
      bookingSince: '',
      rentalForm: ''
    },
    location: {
      country: '',
      street: '',
      roomNumber: '',
      city: '',
      state: '',
      postalCode: '',
      coordinates: { lat: null, lng: null }
    },
    amenities: {
      mandatory: {},
      basicFacilities: {},
      generalServices: {},
      commonArea: {},
      foodBeverages: {},
      healthWellness: {},
      mediaTechnology: {},
      paymentServices: {},
      security: {},
      safety: {}
    },
    rooms: []
  });
  const hasInitializedRef = useRef(false);

  const propertyId = id && id.length > 0 ? id[0] : null;

  // Initialize property data
useEffect(() => {
  const initializePropertyData = async () => {
    if (!hasInitializedRef.current && !currentProperty) {
      hasInitializedRef.current = true;
      
      if (propertyId && propertyId !== 'new') {
        dispatch(getProperty(propertyId));
      } else if (propertyId === 'new') {
        try {
          const result = await dispatch(initializeProperty()).unwrap();
          if (result?._id) {
            router.replace(`/host/onboarding/${result._id}`);
          }
        } catch (error) {
          console.error('Failed to initialize property:', error);
        }
      } else {
        const shouldCheckDrafts = !sessionStorage.getItem('createNew');
        
        if (shouldCheckDrafts) {
          dispatch(getDraftProperties()).then(async (result) => {
            if (result.payload && result.payload.length > 0) {
              setShowDraftModal(true);
            } else {
              try {
                const newProperty = await dispatch(initializeProperty()).unwrap();
                if (newProperty?._id) {
                  router.replace(`/host/onboarding/${newProperty._id}`);
                }
              } catch (error) {
                console.error('Failed to initialize property:', error);
              }
            }
          });
        } else {
          sessionStorage.removeItem('createNew');
          try {
            const result = await dispatch(initializeProperty()).unwrap();
            if (result?._id) {
              router.replace(`/host/onboarding/${result._id}`);
            }
          } catch (error) {
            console.error('Failed to initialize property:', error);
          }
        }
      }
    }
  };

  initializePropertyData();
}, [dispatch, propertyId, currentProperty, router]);
  
  // Handle unmount
  useEffect(() => {
    return () => {
      dispatch(resetCurrentProperty());
      hasInitializedRef.current = false;
    };
  }, [dispatch]);

  // Update form data and navigate to correct tab when property is loaded
  useEffect(() => {
    if (currentProperty) {
      const property = currentProperty;
      
      // Update form data
      setFormData({
        basicInfo: {
          propertyType: property.propertyType || '',
          placeName: property.placeName || '',
          placeRating: property.placeRating || '',
          propertyBuilt: property.propertyBuilt || '',
          bookingSince: property.bookingSince || '',
          rentalForm: property.rentalForm || ''
        },
        location: {
          country: property.location?.country || '',
          street: property.location?.street || '',
          roomNumber: property.location?.roomNumber || '',
          city: property.location?.city || '',
          state: property.location?.state || '',
          postalCode: property.location?.postalCode || '',
          coordinates: property.location?.coordinates || { lat: null, lng: null }
        },
        amenities: property.amenities || {
          mandatory: {},
          basicFacilities: {},
          generalServices: {},
          commonArea: {},
          foodBeverages: {},
          healthWellness: {},
          mediaTechnology: {},
          paymentServices: {},
          security: {},
          safety: {}
        },
        rooms: property.rooms || []
      });

      // Navigate to URL with property ID if it's a new property
      if (property._id && (!propertyId || propertyId === 'new')) {
        router.replace(`/host/onboarding/${property._id}`, { shallow: true });
      }
      
      // Set initial tab based on form progress
      if (property.formProgress) {
        if (!property.formProgress.step1Completed) setActiveTab(0);
        else if (!property.formProgress.step2Completed) setActiveTab(1);
        else if (!property.formProgress.step3Completed) setActiveTab(2);
        else if (!property.formProgress.step4Completed) setActiveTab(3);
        else if (!property.formProgress.step5Completed) setActiveTab(4);
        else setActiveTab(5);
      }
    }
  }, [currentProperty, propertyId, router]);

  // Validation functions
  const validateBasicInfo = () => {
    const errors = {};
    if (!formData.basicInfo.propertyType) errors.propertyType = 'Property type is required';
    if (!formData.basicInfo.placeName) errors.placeName = 'Place name is required';
    if (!formData.basicInfo.placeRating) errors.placeRating = 'Rating is required';
    if (!formData.basicInfo.propertyBuilt) errors.propertyBuilt = 'Built year is required';
    if (!formData.basicInfo.bookingSince) errors.bookingSince = 'Booking since date is required';
    if (!formData.basicInfo.rentalForm) errors.rentalForm = 'Rental form is required';
    return errors;
  };

  const validateLocation = () => {
    const errors = {};
    if (!formData.location.country) errors.country = 'Country is required';
    if (!formData.location.street) errors.street = 'Street address is required';
    if (!formData.location.city) errors.city = 'City is required';
    if (!formData.location.state) errors.state = 'State is required';
    if (!formData.location.postalCode) errors.postalCode = 'Postal code is required';
    return errors;
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setValidationErrors({});
  };

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
    
    // Clear validation errors for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSaveAndNext = async (tabIndex) => {
    if (!currentProperty?._id) return;

    let result;
    let validationErrors = {};
    
    switch(tabIndex) {
      case 0: // Basic Info
        validationErrors = validateBasicInfo();
        if (Object.keys(validationErrors).length > 0) {
          setValidationErrors(validationErrors);
          return;
        }
        result = await dispatch(updateBasicInfo({
          id: currentProperty._id,
          data: formData.basicInfo
        }));
        break;
        
      case 1: // Location
        validationErrors = validateLocation();
        if (Object.keys(validationErrors).length > 0) {
          setValidationErrors(validationErrors);
          return;
        }
        result = await dispatch(updateLocation({
          id: currentProperty._id,
          data: formData.location
        }));
        break;
        
      case 2: // Amenities
        result = await dispatch(updateAmenities({
          id: currentProperty._id,
          data: { amenities: formData.amenities }
        }));
        break;

      case 3: // Rooms
        if (formData.rooms.length === 0) {
          setValidationErrors({ rooms: 'Please add at least one room before continuing' });
          return;
        }
        // For rooms, we'll handle the save in the RoomsForm component
        // and just move to next tab here
        if (tabIndex < 6) {
          setActiveTab(tabIndex + 1);
        }
        return;

      case 4: // Media
        // Media form handles its own save, just move to next tab
        if (tabIndex < 6) {
          setActiveTab(tabIndex + 1);
        }
        return;
        
      default:
        return;
    }
    
    // Check if the save was successful
    if (result && result.type.endsWith('/fulfilled')) {
      setValidationErrors({});
      if (tabIndex < 6) {
        setActiveTab(tabIndex + 1);
      } else {
        // Handle completion
        console.log('Property listing completed');
        router.push('/host/properties');
      }
    } else if (result && result.type.endsWith('/rejected')) {
      // Handle save error
      setValidationErrors({ save: result.payload?.message || 'Failed to save data' });
    }
  };

  const handlePrevious = () => {
    if (activeTab > 0) {
      setActiveTab(activeTab - 1);
      setValidationErrors({});
    }
  };

  const selectDraftProperty = (propertyId) => {
    dispatch(getProperty(propertyId));
    setShowDraftModal(false);
    router.replace(`/host/onboarding/${propertyId}`);
  };
  
 const createNewProperty = async () => {
  try {
    const result = await dispatch(initializeProperty()).unwrap();
    console.log(result, "after clicking create new property button")
    if (result?._id) {
      setShowDraftModal(false);
      router.replace(`/host/onboarding/${result._id}`);
    }
  } catch (error) {
    console.error('Failed to create new property:', error);
    setShowDraftModal(false);
  }
};

  const DraftPropertyModal = () => {
    if (!showDraftModal) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 shadow-2xl max-w-md w-full mx-4">
          <h2 className="text-xl font-bold mb-4">Continue your listing</h2>
          <p className="mb-4">You have unfinished property listings. Would you like to continue working on one of them?</p>
          
          <div className="max-h-60 overflow-y-auto mb-4">
            {draftProperties?.map(property => (
              <div 
                key={property._id} 
                className="p-3 border border-gray-200 rounded-md mb-2 hover:bg-gray-50 cursor-pointer"
                onClick={() => selectDraftProperty(property._id)}
              >
                <h3 className="font-medium">{property.placeName || property.propertyType || 'Draft property'}</h3>
                <p className="text-sm text-gray-500">
                  Last updated: {new Date(property.updatedAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
          
          <div className="flex justify-between">
            <Button 
              variant="outlined"
              onClick={createNewProperty}
            >
              Create new listing
            </Button>
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

  const steps = ['Basic Info', 'Location', 'Amenities', 'Rooms', "Photos And Videos", "Policies", "Finance & Legal"];

  return (
    <>
      <DraftPropertyModal />
      <Paper className="max-w-7xl mx-auto my-8 p-4">
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {validationErrors.save && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {validationErrors.save}
          </Alert>
        )}
        
        {validationErrors.rooms && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {validationErrors.rooms}
          </Alert>
        )}
        
        <Box sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              textColor="primary"
              indicatorColor="primary"
              aria-label="property form tabs"
            >
              {steps.map((step, index) => (
                <Tab 
                  key={index}   
                  label={step} 
                  {...a11yProps(index)}
                  disabled={
                    index > 0 && 
                    !currentProperty?.formProgress?.[`step${index}Completed`] &&
                    index > activeTab
                  }
                />
              ))}
            </Tabs>
          </Box>
          
          <TabPanel value={activeTab} index={0} dir={theme.direction}>
            <BasicInfoForm 
              formData={formData.basicInfo}
              onChange={(field, value) => handleInputChange('basicInfo', field, value)}
              errors={validationErrors}
            />
          </TabPanel>
          
          <TabPanel value={activeTab} index={1} dir={theme.direction}>
            <LocationForm 
              formData={formData.location}
              onChange={(field, value) => handleInputChange('location', field, value)}
              errors={validationErrors}
            />
          </TabPanel>
          
          <TabPanel value={activeTab} index={2} dir={theme.direction}>
            <AmenitiesForm 
              formData={formData.amenities}
              onChange={(updatedAmenities) => {
                setFormData(prev => ({
                  ...prev,
                  amenities: updatedAmenities
                }));
              }}
              errors={validationErrors}
            />
          </TabPanel>
          
          <TabPanel value={activeTab} index={3} dir={theme.direction}>
            <RoomsForm 
              rooms={formData.rooms}
              propertyId={currentProperty?._id}
              onAddRoom={(updatedRooms) => {
                setFormData(prev => ({
                  ...prev,
                  rooms: updatedRooms
                }));
              }}
            />
          </TabPanel>
          
          <TabPanel value={activeTab} index={4} dir={theme.direction}>
            <MediaForm
              propertyId={currentProperty?._id}
            />
          </TabPanel>
          
          <TabPanel value={activeTab} index={5} dir={theme.direction}>
            <Typography variant="h6">Policies</Typography>
            <Typography>Configure your property policies here...</Typography>
          </TabPanel>
          
          <TabPanel value={activeTab} index={6} dir={theme.direction}>
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
          
          {activeTab < 6 && (
            <Button
              variant="contained"
              onClick={() => handleSaveAndNext(activeTab)}
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save & Continue'}
            </Button>
          )}
          
          {activeTab === 6 && (
            <Button
              variant="contained"
              onClick={() => handleSaveAndNext(activeTab)}
              disabled={isLoading || formData.rooms.length === 0}
            >
              {isLoading ? 'Completing...' : 'Complete Listing'}
            </Button>
          )}
        </Box>
      </Paper>
    </>
  );
}