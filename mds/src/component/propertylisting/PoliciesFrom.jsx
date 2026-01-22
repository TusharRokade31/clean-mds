import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  TextField,
  MenuItem,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  FormGroup,
  Button,
  Alert,
  CircularProgress,
  Chip,
  Divider,
  Paper,
  Select,
  InputLabel,
  OutlinedInput,
  Switch,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from "@mui/material";
import { Add, Delete, Edit } from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import {
  getPrivacyPolicy,
  getPrivacyPolicyTemplate,
  createOrUpdatePrivacyPolicy,
  updatePrivacyPolicySection,
  addCustomPolicy,
  updateCustomPolicy,
  deleteCustomPolicy,
  completePrivacyPolicyStep,
} from "@/redux/features/privacyPolicy/privacyPolicySlice";

// Styled components for custom styling
const StyledTabs = styled(Tabs)(({ theme }) => ({
  "& .MuiTabs-indicator": {
    backgroundColor: "#3b82f6",
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: "none",
  fontWeight: 500,
  fontSize: "0.875rem",
  "&.Mui-selected": {
    color: "#3b82f6",
  },
}));

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`privacy-tabpanel-${index}`}
      aria-labelledby={`privacy-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const PrivacyPolicyForm = ({ propertyId, onComplete }) => {
  const dispatch = useDispatch();
  const { currentPrivacyPolicy, privacyPolicyTemplate, isLoading, error } =
    useSelector((state) => state.privacyPolicy);

  const [formData, setFormData] = useState({
    checkInCheckOut: {
      checkInTime: "12:00 pm (noon)",
      checkOutTime: "12:00 pm (noon)",
      has24HourCheckIn: false,
    },
    cancellationPolicy: "free_cancellation_checkin",
    propertyRules: {
      guestProfile: {
        allowUnmarriedCouples: false,
        allowGuestsBelow18: false,
        allowOnlyMaleGuests: false,
      },
      acceptableIdentityProofs: [],
    },
    propertyRestrictions: {
      nonVegetarianFood: {
        allowed: true,
        restrictions: "",
      },
      alcoholSmoking: {
        alcoholAllowed: false,
        smokingAllowed: false,
        smokingAreas: "not_allowed",
        restrictions: "",
      },
      noiseRestrictions: {
        quietHours: {
          enabled: true,
          startTime: "10:00 PM",
          endTime: "7:00 AM",
        },
        musicAllowed: true,
        partyAllowed: false,
        restrictions: "",
      },
    },
    petPolicy: {
      petsAllowed: false,
      petTypes: [],
      petDeposit: {
        required: false,
        amount: 0,
      },
      petRules: "",
    },
    customPolicies: [],
    mealPrices: {
      breakfast: {
        available: false,
        price: 0,
        description: "",
      },
      lunch: {
        available: false,
        price: 0,
        description: "",
      },
      dinner: {
        available: false,
        price: 0,
        description: "",
      },
    },
  });

  const [activeTab, setActiveTab] = useState(0);
  const [customPolicyDialog, setCustomPolicyDialog] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [newCustomPolicy, setNewCustomPolicy] = useState({
    title: "",
    description: "",
  });

  useEffect(() => {
    if (propertyId) {
      dispatch(getPrivacyPolicy(propertyId));
    }
    dispatch(getPrivacyPolicyTemplate());
  }, [dispatch, propertyId]);

  useEffect(() => {
    if (currentPrivacyPolicy) {
      setFormData(currentPrivacyPolicy);
    } else if (privacyPolicyTemplate) {
      setFormData(privacyPolicyTemplate);
    }
  }, [currentPrivacyPolicy, privacyPolicyTemplate]);

  const handleInputChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleNestedInputChange = (section, subsection, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: {
          ...prev[section][subsection],
          [field]: value,
        },
      },
    }));
  };

  const handleTripleNestedInputChange = (
    section,
    subsection,
    subsubsection,
    field,
    value
  ) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: {
          ...prev[section][subsection],
          [subsubsection]: {
            ...prev[section][subsection][subsubsection],
            [field]: value,
          },
        },
      },
    }));
  };

  const handleSave = async () => {
    try {
      await dispatch(
        createOrUpdatePrivacyPolicy({
          propertyId,
          data: formData,
        })
      ).unwrap();
      alert("Privacy policy saved successfully!");
    } catch (error) {
      console.error("Save error:", error);
      alert("Failed to save privacy policy");
    }
  };

  const handleSectionUpdate = async (section) => {
    try {
      let sectionData;

      if (section === "cancellationPolicy") {
        // For cancellation policy, send the value directly
        sectionData = formData.cancellationPolicy;
        await dispatch(
          updatePrivacyPolicySection({
            propertyId,
            section,
            data: sectionData,
          })
        ).unwrap();
      } else {
        // For other sections, send the object
        sectionData = formData[section];
        await dispatch(
          updatePrivacyPolicySection({
            propertyId,
            section,
            data: sectionData,
          })
        ).unwrap();
      }

      alert(`${section} updated successfully!`);
    } catch (error) {
      console.error("Section update error:", error);
      alert(`Failed to update ${section}`);
    }
  };

  const handleAddCustomPolicy = async () => {
    try {
      if (!newCustomPolicy.title || !newCustomPolicy.description) {
        alert("Please fill in all fields");
        return;
      }

      if (editingPolicy) {
        // Update existing policy
        await dispatch(
          updateCustomPolicy({
            propertyId,
            policyId: editingPolicy._id,
            title: newCustomPolicy.title,
            description: newCustomPolicy.description,
            isActive: true,
          })
        ).unwrap();
        alert("Custom policy updated successfully!");
      } else {
        // Add new policy
        await dispatch(
          addCustomPolicy({
            propertyId,
            title: newCustomPolicy.title,
            description: newCustomPolicy.description,
          })
        ).unwrap();
        alert("Custom policy added successfully!");
      }

      setCustomPolicyDialog(false);
      setEditingPolicy(null);
      setNewCustomPolicy({ title: "", description: "" });
    } catch (error) {
      console.error("Add/Update custom policy error:", error);
      alert("Failed to save custom policy");
    }
  };

  const handleDeleteCustomPolicy = async (policyId) => {
    try {
      if (window.confirm("Are you sure you want to delete this policy?")) {
        await dispatch(
          deleteCustomPolicy({
            propertyId,
            policyId,
          })
        ).unwrap();
        alert("Custom policy deleted successfully!");
      }
    } catch (error) {
      console.error("Delete custom policy error:", error);
      alert("Failed to delete custom policy");
    }
  };

  // completion handlers:
  const handleCompleteStep = async () => {
    try {
      await dispatch(completePrivacyPolicyStep(propertyId)).unwrap();
      onComplete?.();
      alert("Finance & Legal step completed successfully!");
    } catch (error) {
      alert(`Validation errors:\n${error.errors?.join("\n") || error.message}`);
    }
  };

  const timeOptions = [
    "6:00 am",
    "7:00 am",
    "8:00 am",
    "9:00 am",
    "10:00 am",
    "11:00 am",
    "12:00 pm (noon)",
    "1:00 pm",
    "2:00 pm",
    "3:00 pm",
    "4:00 pm",
    "5:00 pm",
    "6:00 pm",
    "7:00 pm",
    "8:00 pm",
    "9:00 pm",
    "10:00 pm",
    "11:00 pm",
  ];

  const identityProofOptions = [
    { value: "passport", label: "Passport" },
    { value: "drivers_license", label: "Driver's License" },
    { value: "national_id", label: "National ID" },
    { value: "voter_id", label: "Voter ID" },
    { value: "aadhaar_card", label: "Aadhaar Card" },
    { value: "pan_card", label: "PAN Card" },
  ];

  const petTypeOptions = [
    { value: "dogs", label: "Dogs" },
    { value: "cats", label: "Cats" },
    { value: "birds", label: "Birds" },
    { value: "fish", label: "Fish" },
    { value: "small_pets", label: "Small Pets" },
    { value: "others", label: "Others" },
  ];

  const cancellationOptions = [
    {
      value: "free_cancellation_checkin",
      label: "Free Cancellation till check-in",
      description: "Guests can cancel for free until check-in time",
      hour: 100,
    },
    {
      value: "free_cancellation_24h",
      label: "Free Cancellation 24 hours",
      description: "Guests can cancel for free up to 24 hours before check-in",
      hour: 76,
    },
    {
      value: "free_cancellation_48h",
      label: "Free Cancellation 48 hours",
      description: "Guests can cancel for free up to 48 hours before check-in",
      hour: 52,
    },
    {
      value: "free_cancellation_72h",
      label: "Free Cancellation 72 hours",
      description: "Guests can cancel for free up to 72 hours before check-in",
      hour: 28,
    },
    {
      value: "non_refundable",
      label: "Non Refundable",
      description: "Non Refundable",
    },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <CircularProgress />
        <Typography className="ml-4" variant="body1">
          Loading privacy policy...
        </Typography>
      </div>
    );
  }

  if (error) {
    return (
      <Alert severity="error" className="m-4">
        Error: {error}
      </Alert>
    );
  }

  const RefundTimeline = () => (
  <Box sx={{ mt: 2, mb: 4, ml: 4, maxWidth: 500 }}>
    <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mb: 0.5, color: '#666' }}>
      100% Refund
    </Typography>
    {/* Orange Bar with Ticks */}
    <Box sx={{ height: 4, backgroundColor: '#f97316', borderRadius: 1, position: 'relative' }}>
      <Box sx={{ position: 'absolute', left: 0, top: -3, height: 10, width: 2, backgroundColor: '#f97316' }} />
      <Box sx={{ position: 'absolute', right: 0, top: -3, height: 10, width: 2, backgroundColor: '#f97316' }} />
    </Box>
    {/* Timeline Labels */}
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
      <Typography sx={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>Booking Date</Typography>
      <Typography sx={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>Check-in</Typography>
    </Box>
  </Box>
);

const DynamicRefundTimeline = ({ selectedOption, customHours }) => {
  // Determine split percentage based on selection to match the images
  const getSplitConfig = () => {
    switch (selectedOption.value) {
      case "free_cancellation_checkin":
        return { percent: 100, label: "" };
      case "free_cancellation_24h":
        return { percent: 70, label: "24 hours before check-in" };
      case "free_cancellation_48h":
        return { percent: 50, label: "48 hours before check-in" };
      case "free_cancellation_72h":
        return { percent: 30, label: "72 hours before check-in" };
      case "free_cancellation_custom":
        // Logic for custom hours (e.g., mapping 1-168 hours to 90%-10% of the bar)
        const customPercent = Math.max(10, 100 - (customHours / 168) * 100);
        return { percent: customPercent, label: `${customHours} hours before check-in` };
      case "non_refundable":
        return { percent: 0, label: "" };
      default:
        return { percent: 100, label: "" };
    }
  };

  const { percent, label } = getSplitConfig();
  const isNonRefundable = selectedOption.value === "non_refundable";
  const isTillCheckIn = selectedOption.value === "free_cancellation_checkin";

  return (
    <Box sx={{ mt: 1.5, mb: 2, ml: 4, maxWidth: 550, bgcolor: '#f9f9f9', p: 2, borderRadius: '4px' }}>
      {/* Warning for Non-refundable state (Match Image 3) */}
      {isNonRefundable && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <span style={{ fontSize: '14px', color: '#666' }}>🔘</span>
          <Typography variant="caption" sx={{ color: '#666', fontSize: '12px' }}>
            Offer a free cancellation policy as it helps travellers book in advance.
          </Typography>
        </Box>
      )}

      {/* Top Labels: Refundable vs Non-refundable */}
      <Box sx={{ display: 'flex', mb: 0.5, fontSize: '12px', color: '#666' }}>
        {!isNonRefundable && (
          <Box sx={{ flex: percent, textAlign: 'center' }}>100% Refund</Box>
        )}
        {!isTillCheckIn && (
          <Box sx={{ flex: 100 - percent, textAlign: 'center' }}>Non-refundable</Box>
        )}
      </Box>

      {/* The Segmented Bar (Dynamic Colors) */}
      <Box sx={{ height: 6, display: 'flex', alignItems: 'center', position: 'relative' }}>
        {/* Orange Segment */}
        {!isNonRefundable && (
          <Box sx={{ height: 4, width: `${percent}%`, bgcolor: '#f97316', borderLeft: '2px solid #f97316' }} />
        )}
        {/* Grey Segment */}
        {!isTillCheckIn && (
          <Box sx={{ height: 4, width: `${100 - percent}%`, bgcolor: '#d1d5db', borderRight: '2px solid #d1d5db' }} />
        )}
        {/* Split Marker (The vertical tick) */}
        {!isNonRefundable && !isTillCheckIn && (
          <Box sx={{ position: 'absolute', left: `${percent}%`, height: 12, width: 2, bgcolor: '#9ca3af', zIndex: 2 }} />
        )}
      </Box>

      {/* Bottom Labels: Dates and Dynamic Hours */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1, position: 'relative', minHeight: '25px' }}>
        <Typography sx={{ fontSize: '11px', fontWeight: 600, color: '#374151' }}>Booking Date</Typography>
        
        {/* The Dynamic Hour Label (Matches dynamic hour requirement) */}
        {label && (
          <Typography sx={{ 
            fontSize: '11px', 
            color: '#374151', 
            position: 'absolute', 
            left: `${percent}%`, 
            transform: 'translateX(-50%)',
            textAlign: 'center',
            width: '120px',
            lineHeight: 1.2
          }}>
            {label}
          </Typography>
        )}
        
        <Typography sx={{ fontSize: '11px', fontWeight: 600, color: '#374151', textAlign: 'right' }}>Check-in</Typography>
      </Box>
    </Box>
  );
};

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Card className="shadow-lg">
        <CardContent className="p-6">
          {/* Header */}
          <div className="text-center mb-8">
            <Typography
              variant="h4"
              className="font-semibold text-gray-800 mb-2"
            >
              Privacy Policy & Property Rules
            </Typography>
            <Typography variant="body1" className="text-gray-600">
              Configure your property's privacy policy and property rules
            </Typography>
          </div>

          {/* Tab Navigation */}
          <Box className="mb-6">
            <StyledTabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              aria-label="privacy policy tabs"
              variant="scrollable"
              scrollButtons="auto"
            >
              <StyledTab label="Check-in & Check-out" />
              <StyledTab label="Cancellation Policy" />
              <StyledTab label="Property Rules" />
              <StyledTab label="Property Restrictions" />
              <StyledTab label="Pet Policy" />
              <StyledTab label="Custom Policies" />
              <StyledTab label="Meal Prices" />
            </StyledTabs>
          </Box>

          {/* Check-in & Check-out Tab */}
          <TabPanel value={activeTab} index={0}>
            <div className="space-y-6">
              <div>
                <Typography
                  variant="h6"
                  className="font-semibold text-gray-800 mb-2"
                >
                  Check-in & Check-out Time
                </Typography>
                <Typography variant="body2" className="text-gray-600 mb-4">
                  Specify the check-in & check-out time at your property
                </Typography>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormControl
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#2e2e2e",
                      },
                      "&.Mui-focused": {
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#1976d2",
                        },
                      },
                      "& .MuiInputLabel-outlined": {
                        color: "#2e2e2e",
                        "&.Mui-focused": {
                          color: "secondary.main",
                        },
                      },
                    },
                  }}
                  fullWidth
                >
                  <InputLabel>Check-in Time</InputLabel>
                  <Select
                    value={formData.checkInCheckOut?.checkInTime || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "checkInCheckOut",
                        "checkInTime",
                        e.target.value
                      )
                    }
                    input={<OutlinedInput label="Check-in Time" />}
                  >
                    {timeOptions.map((time) => (
                      <MenuItem key={time} value={time}>
                        {time}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#2e2e2e",
                      },
                      "&.Mui-focused": {
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#1976d2",
                        },
                      },
                      "& .MuiInputLabel-outlined": {
                        color: "#2e2e2e",
                        "&.Mui-focused": {
                          color: "secondary.main",
                        },
                      },
                    },
                  }}
                  fullWidth
                >
                  <InputLabel>Check-out Time</InputLabel>
                  <Select
                    value={formData.checkInCheckOut?.checkOutTime || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "checkInCheckOut",
                        "checkOutTime",
                        e.target.value
                      )
                    }
                    input={<OutlinedInput label="Check-out Time" />}
                  >
                    {timeOptions.map((time) => (
                      <MenuItem key={time} value={time}>
                        {time}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <Typography variant="body1" className="text-gray-800">
                  Do you have 24-hour check-in?
                </Typography>
                <Switch
                  checked={formData.checkInCheckOut?.has24HourCheckIn || false}
                  onChange={(e) =>
                    handleInputChange(
                      "checkInCheckOut",
                      "has24HourCheckIn",
                      e.target.checked
                    )
                  }
                  color="primary"
                />
              </div>

              <Button
                variant="outlined"
                color="primary"
                onClick={() => handleSectionUpdate("checkInCheckOut")}
                className="mt-4"
              >
                Save Check-in/Check-out Settings
              </Button>
            </div>
          </TabPanel>

          {/* Cancellation Policy Tab */}
      <TabPanel value={activeTab} index={1}>
  <div className="space-y-4">
    <div>
      <Typography variant="h6" className="font-semibold text-gray-800">
        Cancellation Policy
      </Typography>
      <Typography variant="body2" className="text-gray-400 mb-6">
        Offering a flexible cancellation policy helps traveller book in advance.
      </Typography>
    </div>

    <FormControl component="fieldset" className="w-full">
      <RadioGroup
        value={formData.cancellationPolicy || "free_cancellation_checkin"}
        onChange={(e) => setFormData(prev => ({ ...prev, cancellationPolicy: e.target.value }))}
      >
        {cancellationOptions.map((option) => (
          <div key={option.value}>
            <FormControlLabel
              value={option.value}
              control={<Radio size="small" />}
              label={
                <div className="flex items-center gap-2">
                  <Typography className="text-gray-700 text-[15px] py-1">
                    {option.label}
                  </Typography>
                  {/* Recommended Badge */}
                  {option.value === "free_cancellation_checkin" && (
                    <Box sx={{ 
                      bgcolor: '#f0fdf4', color: '#16a34a', fontSize: '10px', fontWeight: 'bold', 
                      px: 1, py: 0.2, borderRadius: '4px', border: '1px solid #dcfce7', textTransform: 'uppercase'
                    }}>
                      Recommended
                    </Box>
                  )}
                </div>
              }
              className="m-0"
            />

            {/* Render Timeline when selected */}
            {formData.cancellationPolicy === option.value && (
              <>
                {/* Custom Hour Input Logic */}
                {option.value === "free_cancellation_custom" && (
                  <div className="ml-10 mb-2 flex items-center gap-2">
                    <TextField
                      type="number"
                      size="small"
                      placeholder="e.g. 36"
                      value={formData.customCancellationHours || ""}
                      onChange={(e) => setFormData(p => ({ ...p, customCancellationHours: parseInt(e.target.value) || 0 }))}
                      sx={{ width: 100 }}
                    />
                    <Typography variant="caption" className="text-gray-500">hours before check-in</Typography>
                  </div>
                )}
                
                <DynamicRefundTimeline 
                  selectedOption={option} 
                  customHours={formData.customCancellationHours} 
                />
              </>
            )}
          </div>
        ))}
      </RadioGroup>
    </FormControl>

    {/* Blue Info Footer (Exact match to image) */}
    {/* <Paper 
      elevation={0} 
      className="mt-6 p-2 flex items-center gap-2"
      sx={{ bgcolor: '#eff6ff', border: '1px solid #dbeafe', borderRadius: '4px' }}
    >
      <span className="text-blue-500 text-sm">ℹ️</span>
      <Typography sx={{ fontSize: '12px', color: '#1e40af' }}>
        Selected policy would be applicable to <b>2 rateplans</b> created. You can modify this policy after completing the listing.
      </Typography>
    </Paper> */}

    <Button
      variant="outlined"
      disableElevation
      sx={{ mt: 4, textTransform: 'none', px: 4, fontWeight: 500 }}
      onClick={() => handleSectionUpdate("cancellationPolicy")}
    >
      Save Cancellation Policy
    </Button>
  </div>
</TabPanel>

          {/* Property Rules Tab */}
          <TabPanel value={activeTab} index={2}>
            <div className="space-y-6">
              <div>
                <Typography
                  variant="h6"
                  className="font-semibold text-gray-800 mb-2"
                >
                  Property Rules
                </Typography>
                <Typography variant="body2" className="text-gray-600 mb-4">
                  Add property rules based on the requirement of your property
                  listing
                </Typography>
              </div>

              {/* Guest Profile Section */}
              <Paper className="border border-gray-200" elevation={0}>
                <div className="flex justify-between items-center p-4 bg-gray-50 border-b border-gray-200">
                  <Typography
                    variant="subtitle1"
                    className="font-semibold text-gray-800"
                  >
                    Guest Profile
                  </Typography>
                </div>

                <div className="divide-y divide-gray-200">
                  <div className="p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <Typography
                      variant="body2"
                      className="text-gray-800 flex-1"
                    >
                      Do you allow unmarried couples?
                    </Typography>
                    <RadioGroup
                      row
                      value={
                        formData.propertyRules?.guestProfile
                          ?.allowUnmarriedCouples
                      }
                      onChange={(e) =>
                        handleNestedInputChange(
                          "propertyRules",
                          "guestProfile",
                          "allowUnmarriedCouples",
                          e.target.value === "true"
                        )
                      }
                      className="gap-4"
                    >
                      <FormControlLabel
                        value={false}
                        control={<Radio size="small" />}
                        label="No"
                      />
                      <FormControlLabel
                        value={true}
                        control={<Radio size="small" />}
                        label="Yes"
                      />
                    </RadioGroup>
                  </div>

                  <div className="p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <Typography
                      variant="body2"
                      className="text-gray-800 flex-1"
                    >
                      Do you allow guests below 18 years of age at your
                      property?
                    </Typography>
                    <RadioGroup
                      row
                      value={
                        formData.propertyRules?.guestProfile?.allowGuestsBelow18
                      }
                      onChange={(e) =>
                        handleNestedInputChange(
                          "propertyRules",
                          "guestProfile",
                          "allowGuestsBelow18",
                          e.target.value === "true"
                        )
                      }
                      className="gap-4"
                    >
                      <FormControlLabel
                        value={false}
                        control={<Radio size="small" />}
                        label="No"
                      />
                      <FormControlLabel
                        value={true}
                        control={<Radio size="small" />}
                        label="Yes"
                      />
                    </RadioGroup>
                  </div>

                  <div className="p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <Typography
                      variant="body2"
                      className="text-gray-800 flex-1"
                    >
                      Groups with only male guests are allowed at your property?
                    </Typography>
                    <RadioGroup
                      row
                      value={
                        formData.propertyRules?.guestProfile
                          ?.allowOnlyMaleGuests
                      }
                      onChange={(e) =>
                        handleNestedInputChange(
                          "propertyRules",
                          "guestProfile",
                          "allowOnlyMaleGuests",
                          e.target.value === "true"
                        )
                      }
                      className="gap-4"
                    >
                      <FormControlLabel
                        value={false}
                        control={<Radio size="small" />}
                        label="No"
                      />
                      <FormControlLabel
                        value={true}
                        control={<Radio size="small" />}
                        label="Yes"
                      />
                    </RadioGroup>
                  </div>
                </div>
              </Paper>

              {/* Acceptable Identity Proofs */}
              <Paper className="border border-gray-200" elevation={0}>
                <div className="flex justify-between items-center p-4 bg-gray-50 border-b border-gray-200">
                  <Typography
                    variant="subtitle1"
                    className="font-semibold text-gray-800"
                  >
                    Acceptable Identity Proofs
                  </Typography>
                </div>

                <div className="p-4 space-y-4">
                  <FormControl fullWidth>
                    <InputLabel>Acceptable Identity Proofs</InputLabel>
                    <Select
                      multiple
                      value={
                        formData.propertyRules?.acceptableIdentityProofs || []
                      }
                      onChange={(e) =>
                        handleInputChange(
                          "propertyRules",
                          "acceptableIdentityProofs",
                          e.target.value
                        )
                      }
                      input={
                        <OutlinedInput label="Acceptable Identity Proofs" />
                      }
                      renderValue={(selected) => (
                        <Box
                          sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}
                        >
                          {selected.map((value) => {
                            const option = identityProofOptions.find(
                              (opt) => opt.value === value
                            );
                            return (
                              <Chip
                                key={value}
                                label={option?.label}
                                size="small"
                              />
                            );
                          })}
                        </Box>
                      )}
                    >
                      {identityProofOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          <Checkbox
                            checked={
                              (
                                formData.propertyRules
                                  ?.acceptableIdentityProofs || []
                              ).indexOf(option.value) > -1
                            }
                          />
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                    <Typography
                      variant="caption"
                      className="text-gray-500 mt-1"
                    >
                      Select multiple identity proofs that are acceptable
                    </Typography>
                  </FormControl>
                </div>
              </Paper>

              <Button
                variant="outlined"
                color="primary"
                sx={{ mt: 3 }}
                onClick={() => handleSectionUpdate("propertyRules")}
              >
                Save Property Rules
              </Button>
            </div>
          </TabPanel>

          {/* Property Restrictions Tab */}
          <TabPanel value={activeTab} index={3}>
            <div className="space-y-6">
              <div>
                <Typography
                  variant="h6"
                  className="font-semibold text-gray-800 mb-2"
                >
                  Property Restrictions
                </Typography>
                <Typography variant="body2" className="text-gray-600 mb-4">
                  Set restrictions for food, alcohol, smoking, and noise at your
                  property
                </Typography>
              </div>

              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <Typography variant="body2" className="text-gray-800">
                    Allow non-vegetarian food?
                  </Typography>
                  <Switch
                    checked={
                      formData.propertyRestrictions?.nonVegetarianFood
                        ?.allowed || false
                    }
                    onChange={(e) =>
                      handleNestedInputChange(
                        "propertyRestrictions",
                        "nonVegetarianFood",
                        "allowed",
                        e.target.checked
                      )
                    }
                    color="primary"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Typography variant="body2" className="text-gray-800">
                    Allow alcohol?
                  </Typography>
                  <Switch
                    checked={
                      formData.propertyRestrictions?.alcoholSmoking
                        ?.alcoholAllowed || false
                    }
                    onChange={(e) =>
                      handleNestedInputChange(
                        "propertyRestrictions",
                        "alcoholSmoking",
                        "alcoholAllowed",
                        e.target.checked
                      )
                    }
                    color="primary"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Typography variant="body2" className="text-gray-800">
                    Allow smoking?
                  </Typography>
                  <Switch
                    checked={
                      formData.propertyRestrictions?.alcoholSmoking
                        ?.smokingAllowed || false
                    }
                    onChange={(e) =>
                      handleNestedInputChange(
                        "propertyRestrictions",
                        "alcoholSmoking",
                        "smokingAllowed",
                        e.target.checked
                      )
                    }
                    color="primary"
                  />
                </div>
              </div>
              <Button
                variant="outlined"
                color="primary"
                sx={{ mt: 3 }}
                onClick={() => handleSectionUpdate("propertyRestrictions")}
              >
                Save Property Restrictions
              </Button>
            </div>
          </TabPanel>

          {/* Pet Policy Tab */}
          <TabPanel value={activeTab} index={4}>
            <div className="space-y-6">
              <div>
                <Typography
                  variant="h6"
                  className="font-semibold text-gray-800 mb-2"
                >
                  Pet Policy
                </Typography>
                <Typography variant="body2" className="text-gray-600 mb-4">
                  Configure your pet policy and restrictions
                </Typography>
              </div>

              <div className="flex items-center justify-between">
                <Typography variant="body2" className="text-gray-800">
                  Are pets allowed?
                </Typography>
                <Switch
                  checked={formData.petPolicy?.petsAllowed || false}
                  onChange={(e) =>
                    handleInputChange(
                      "petPolicy",
                      "petsAllowed",
                      e.target.checked
                    )
                  }
                  color="primary"
                />
              </div>

              <Button
                variant="outlined"
                color="primary"
                sx={{ mt: 3 }}
                onClick={() => handleSectionUpdate("petPolicy")}
              >
                Save Pet Policy
              </Button>
            </div>
          </TabPanel>

          {/* Custom Policies Tab */}
          <TabPanel value={activeTab} index={5}>
            <div className="space-y-6">
              <div>
                <Typography
                  variant="h6"
                  className="font-semibold text-gray-800 mb-2"
                >
                  Custom Policies
                </Typography>
                <Typography variant="body2" className="text-gray-600 mb-4">
                  Add custom policies specific to your property
                </Typography>
              </div>

              {/* Add Custom Policy Button */}
              <Button
                variant="contained"
                color="primary"
                sx={{ my: 2 }}
                startIcon={<Add />}
                onClick={() => setCustomPolicyDialog(true)}
                className="mb-4"
              >
                Add Custom Policy
              </Button>

              {/* Custom Policies List */}
              <Paper className="border border-gray-200" elevation={0}>
                {formData.customPolicies &&
                formData.customPolicies.length > 0 ? (
                  <List>
                    {formData.customPolicies.map((policy, index) => (
                      <ListItem key={policy._id || index} divider>
                        <ListItemText
                          primary={
                            <Typography
                              variant="subtitle1"
                              className="font-semibold"
                            >
                              {policy.title}
                            </Typography>
                          }
                          secondary={
                            <Typography
                              variant="body2"
                              className="text-gray-600 mt-1"
                            >
                              {policy.description}
                            </Typography>
                          }
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            aria-label="edit"
                            onClick={() => {
                              setEditingPolicy(policy);
                              setNewCustomPolicy({
                                title: policy.title,
                                description: policy.description,
                              });
                              setCustomPolicyDialog(true);
                            }}
                            className="mr-2"
                          >
                            <Edit />
                          </IconButton>
                          <IconButton
                            edge="end"
                            aria-label="delete"
                            onClick={() => handleDeleteCustomPolicy(policy._id)}
                            color="error"
                          >
                            <Delete />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <div className="p-8 text-center">
                    <Typography variant="body1" className="text-gray-500">
                      No custom policies added yet
                    </Typography>
                    <Typography variant="body2" className="text-gray-400 mt-1">
                      Click "Add Custom Policy" to create your first policy
                    </Typography>
                  </div>
                )}
              </Paper>

              <Button
                variant="outlined"
                color="primary"
                sx={{ mt: 3 }}
                onClick={() => handleSectionUpdate("customPolicies")}
              >
                Save Custom Policies
              </Button>
            </div>
          </TabPanel>

          {/* Meal Prices Tab */}
          <TabPanel value={activeTab} index={6}>
            <div className="space-y-6">
              <div>
                <Typography
                  variant="h6"
                  className="font-semibold text-gray-800 mb-2"
                >
                  Meal Prices
                </Typography>
                <Typography variant="body2" className="text-gray-600 mb-4">
                  Set meal prices and availability for your property
                </Typography>
              </div>

              {/* Breakfast */}
              <Paper className="border border-gray-200" elevation={0}>
                <div className="flex justify-between items-center p-4 bg-gray-50 border-b border-gray-200">
                  <Typography
                    variant="subtitle1"
                    className="font-semibold text-gray-800"
                  >
                    Breakfast
                  </Typography>
                  <Switch
                    checked={formData.mealPrices?.breakfast?.available || false}
                    onChange={(e) =>
                      handleNestedInputChange(
                        "mealPrices",
                        "breakfast",
                        "available",
                        e.target.checked
                      )
                    }
                    color="primary"
                  />
                </div>
                {formData.mealPrices?.breakfast?.available && (
                  <div className="p-4 space-y-4">
                    <TextField
                      fullWidth
                      label="Price per person"
                      type="number"
                      slotProps={{
                      htmlInput: {
                        onWheel: (e) => e.currentTarget.blur(),
                      },
                    }}
                      value={formData.mealPrices?.breakfast?.price || 0}
                      onChange={(e) =>
                        handleNestedInputChange(
                          "mealPrices",
                          "breakfast",
                          "price",
                          parseInt(e.target.value) || 0
                        )
                      }
                      InputProps={{
                        startAdornment: <Typography>₹</Typography>,
                      }}
                    />
                  </div>
                )}
              </Paper>

              {/* Lunch */}
              <Paper className="border border-gray-200" elevation={0}>
                <div className="flex justify-between items-center p-4 bg-gray-50 border-b border-gray-200">
                  <Typography
                    variant="subtitle1"
                    className="font-semibold text-gray-800"
                  >
                    Lunch
                  </Typography>
                  <Switch
                    checked={formData.mealPrices?.lunch?.available || false}
                    onChange={(e) =>
                      handleNestedInputChange(
                        "mealPrices",
                        "lunch",
                        "available",
                        e.target.checked
                      )
                    }
                    color="primary"
                  />
                </div>
                {formData.mealPrices?.lunch?.available && (
                  <div className="p-4 space-y-4">
                    <TextField
                      fullWidth
                      label="Price per person"
                      type="number"
                      slotProps={{
                      htmlInput: {
                        onWheel: (e) => e.currentTarget.blur(),
                      },
                    }}
                      value={formData.mealPrices?.lunch?.price || 0}
                      onChange={(e) =>
                        handleNestedInputChange(
                          "mealPrices",
                          "lunch",
                          "price",
                          parseInt(e.target.value) || 0
                        )
                      }
                      InputProps={{
                        startAdornment: <Typography>₹</Typography>,
                      }}
                    />
                  </div>
                )}
              </Paper>

              {/* Dinner */}
              <Paper className="border border-gray-200" elevation={0}>
                <div className="flex justify-between items-center p-4 bg-gray-50 border-b border-gray-200">
                  <Typography
                    variant="subtitle1"
                    className="font-semibold text-gray-800"
                  >
                    Dinner
                  </Typography>
                  <Switch
                    checked={formData.mealPrices?.dinner?.available || false}
                    onChange={(e) =>
                      handleNestedInputChange(
                        "mealPrices",
                        "dinner",
                        "available",
                        e.target.checked
                      )
                    }
                    color="primary"
                  />
                </div>
                {formData.mealPrices?.dinner?.available && (
                  <div className="p-4 space-y-4">
                    <TextField
                      fullWidth
                      label="Price per person"
                      type="number"
                      slotProps={{
                      htmlInput: {
                        onWheel: (e) => e.currentTarget.blur(),
                      },
                    }}
                      value={formData.mealPrices?.dinner?.price || 0}
                      onChange={(e) =>
                        handleNestedInputChange(
                          "mealPrices",
                          "dinner",
                          "price",
                          parseInt(e.target.value) || 0
                        )
                      }
                      InputProps={{
                        startAdornment: <Typography>₹</Typography>,
                      }}
                    />
                  </div>
                )}
              </Paper>

              <Button
                variant="outlined"
                color="primary"
                sx={{ mt: 3 }}
                onClick={() => handleSectionUpdate("mealPrices")}
              >
                Save Meal Prices
              </Button>
            </div>
          </TabPanel>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={handleSave}
          className="px-8 py-3"
        >
          Save All Changes
        </Button>

        <Button
          variant="contained"
          // color="success"
          size="large"
          onClick={handleCompleteStep}
          className="px-8 py-3"
        >
          Complete Policy And Rules
        </Button>
      </div>

      <Dialog
        open={customPolicyDialog}
        onClose={() => {
          setCustomPolicyDialog(false);
          setEditingPolicy(null);
          setNewCustomPolicy({ title: "", description: "" });
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingPolicy ? "Edit Custom Policy" : "Add Custom Policy"}
        </DialogTitle>
        <DialogContent>
          <div className="space-y-4 pt-2">
            <TextField
              fullWidth
              label="Policy Title"
              className="mb-5"
              value={newCustomPolicy.title}
              onChange={(e) =>
                setNewCustomPolicy((prev) => ({
                  ...prev,
                  title: e.target.value,
                }))
              }
              placeholder="e.g., Swimming Pool Rules"
            />
            <TextField
              fullWidth
              label="Policy Description"
              multiline
              rows={4}
              value={newCustomPolicy.description}
              onChange={(e) =>
                setNewCustomPolicy((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Describe the policy in detail..."
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setCustomPolicyDialog(false);
              setEditingPolicy(null);
              setNewCustomPolicy({ title: "", description: "" });
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddCustomPolicy}
            variant="contained"
            color="primary"
          >
            {editingPolicy ? "Update" : "Add"} Policy
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default PrivacyPolicyForm;
