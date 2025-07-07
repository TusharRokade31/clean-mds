// components/FinanceLegalForm.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormControlLabel,
  RadioGroup,
  Radio,
  Button,
  Paper,
  Grid,
  Alert,
  CircularProgress,
  Chip,
  FormLabel,
  Card,
  CardContent,
  Divider,
  styled
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  AccountBalance as BankIcon,
  Business as BusinessIcon,
  CheckCircle as CheckCircleIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import {
  completeFinanceLegalStep,
  getFinanceLegal,
  updateFinanceDetails,
  updateLegalDetails,
  uploadRegistrationDocument
} from '@/redux/features/property/propertySlice';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const UploadArea = styled(Box)(({ theme }) => ({
  border: `2px dashed ${theme.palette.primary.main}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(4),
  textAlign: 'center',
  backgroundColor: theme.palette.action.hover,
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: theme.palette.action.selected,
  },
}));

const FinanceLegalForm = ({ propertyId, onComplete }) => {
  const dispatch = useDispatch();
  const { currentFinanceLegal, isLoading, error } = useSelector(state => state.property);
  
  const [activeTab, setActiveTab] = useState(0);
  const [financeData, setFinanceData] = useState({
    bankDetails: {
      accountNumber: '',
      reenterAccountNumber: '',
      ifscCode: '',
      bankName: ''
    },
    taxDetails: {
      hasGSTIN: false,
      gstin: '',
      pan: '',
      hasTAN: false,
      tan: ''
    }
  });
  
  const [legalData, setLegalData] = useState({
    ownershipDetails: {
      ownershipType: '',
      propertyAddress: ''
    }
  });
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [accountNumberError, setAccountNumberError] = useState('');

  useEffect(() => {
    if (propertyId) {
      dispatch(getFinanceLegal(propertyId));
    }
  }, [dispatch, propertyId]);

  useEffect(() => {
  console.log('Current finance legal data:', currentFinanceLegal);
  console.log('Error:', error);
  // ... rest of your useEffect
}, [currentFinanceLegal, error]);

  useEffect(() => {
    if (currentFinanceLegal) {
      setFinanceData({
        bankDetails: currentFinanceLegal.finance?.bankDetails || financeData.bankDetails,
        taxDetails: currentFinanceLegal.finance?.taxDetails || financeData.taxDetails
      });
      setLegalData({
        ownershipDetails: currentFinanceLegal.legal?.ownershipDetails || legalData.ownershipDetails
      });
    }
  }, [currentFinanceLegal]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleFinanceChange = (section, field, value) => {
    setFinanceData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));

    // Clear account number error when user types
    if (field === 'accountNumber' || field === 'reenterAccountNumber') {
      setAccountNumberError('');
    }
  };

  const handleLegalChange = (section, field, value) => {
    setLegalData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleFinanceSubmit = async (e) => {
    e.preventDefault();
    if (financeData.bankDetails.accountNumber !== financeData.bankDetails.reenterAccountNumber) {
      setAccountNumberError('Account numbers do not match');
      return;
    }
    
    await dispatch(updateFinanceDetails({ 
      propertyId, 
      data: financeData 
    }));
  };

  const handleLegalSubmit = async (e) => {
    e.preventDefault();
    await dispatch(updateLegalDetails({ 
      propertyId, 
      data: legalData 
    }));
  };

const handleFileUpload = async (e) => {
  e.preventDefault();
  if (!selectedFile) {
    return;
  }
  
  const formData = new FormData();
  formData.append('registrationDocument', selectedFile); // Make sure field name matches
  
  await dispatch(uploadRegistrationDocument({ 
    propertyId, 
    formData 
  }));
  
  setSelectedFile(null);
};

  // completion handlers:
  const handleCompleteStep = async () => {
  try {
    await dispatch(completeFinanceLegalStep(propertyId)).unwrap();
    onComplete?.();
    alert('Finance & Legal step completed successfully!');
  } catch (error) {
    alert(`Validation errors:\n${error.errors?.join('\n') || error.message}`);
  }
  };

  const handleFileSelect = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Error: {error}
      </Alert>
    );
  }

  return (
    <Paper elevation={2} sx={{ p: 3,  mx: 'auto', mt: 2 }}>
      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
         <Tab 
          icon={<BusinessIcon />} 
          label="Ownership Details" 
          iconPosition="start"
        />
        <Tab 
          icon={<BankIcon />} 
          label="Banking Details" 
          iconPosition="start"
        />
      </Tabs>

      {activeTab === 1 && (
        <Box>
          <Typography variant="h5" gutterBottom>
            Banking Details
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Enter Bank, PAN & GST Details
          </Typography>
          
          <Box component="form" onSubmit={handleFinanceSubmit}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Bank Details
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Account Number"
                      placeholder="Enter Account Number"
                      value={financeData.bankDetails.accountNumber}
                      onChange={(e) => handleFinanceChange('bankDetails', 'accountNumber', e.target.value)}
                      required
                      error={!!accountNumberError}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Re-enter Account Number"
                      placeholder="Enter Account Number"
                      value={financeData.bankDetails.reenterAccountNumber}
                      onChange={(e) => handleFinanceChange('bankDetails', 'reenterAccountNumber', e.target.value)}
                      required
                      error={!!accountNumberError}
                      helperText={accountNumberError}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="IFSC Code"
                      placeholder="Enter IFSC Code"
                      value={financeData.bankDetails.ifscCode}
                      onChange={(e) => handleFinanceChange('bankDetails', 'ifscCode', e.target.value.toUpperCase())}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth required>
                      <InputLabel>Bank Name</InputLabel>
                      <Select
                        value={financeData.bankDetails.bankName}
                        label="Bank Name"
                        onChange={(e) => handleFinanceChange('bankDetails', 'bankName', e.target.value)}
                      >
                        <MenuItem value="State Bank of India">State Bank of India</MenuItem>
                        <MenuItem value="HDFC Bank">HDFC Bank</MenuItem>
                        <MenuItem value="ICICI Bank">ICICI Bank</MenuItem>
                        <MenuItem value="Axis Bank">Axis Bank</MenuItem>
                        <MenuItem value="Punjab National Bank">Punjab National Bank</MenuItem>
                        <MenuItem value="Bank of Baroda">Bank of Baroda</MenuItem>
                        <MenuItem value="Canara Bank">Canara Bank</MenuItem>
                        <MenuItem value="Union Bank of India">Union Bank of India</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Tax Details
                </Typography>
                
                <FormControl component="fieldset" sx={{ mb: 2 }}>
                  <FormLabel component="legend">Do you have a GSTIN?</FormLabel>
                  <RadioGroup
                    row
                    value={financeData.taxDetails.hasGSTIN}
                    onChange={(e) => handleFinanceChange('taxDetails', 'hasGSTIN', e.target.value === 'true')}
                  >
                    <FormControlLabel value={false} control={<Radio />} label="No" />
                    <FormControlLabel value={true} control={<Radio />} label="Yes" />
                  </RadioGroup>
                </FormControl>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Enter GSTIN"
                      placeholder="Enter the 15-digit GSTIN"
                      value={financeData.taxDetails.gstin}
                      onChange={(e) => handleFinanceChange('taxDetails', 'gstin', e.target.value.toUpperCase())}
                      disabled={!financeData.taxDetails.hasGSTIN}
                      required={financeData.taxDetails.hasGSTIN}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Enter PAN"
                      placeholder="Your PAN will be filled in automatically"
                      value={financeData.taxDetails.pan}
                      onChange={(e) => handleFinanceChange('taxDetails', 'pan', e.target.value.toUpperCase())}
                      required
                    />
                  </Grid>
                </Grid>

                <FormControl component="fieldset" sx={{ mt: 2, mb: 2 }}>
                  <FormLabel component="legend">Do you have a TAN?</FormLabel>
                  <RadioGroup
                    row
                    value={financeData.taxDetails.hasTAN}
                    onChange={(e) => handleFinanceChange('taxDetails', 'hasTAN', e.target.value === 'true')}
                  >
                    <FormControlLabel value={false} control={<Radio />} label="No" />
                    <FormControlLabel value={true} control={<Radio />} label="Yes" />
                  </RadioGroup>
                </FormControl>

                {financeData.taxDetails.hasTAN && (
                  <TextField
                    fullWidth
                    label="Enter TAN"
                    placeholder="Enter 10-digit TAN"
                    value={financeData.taxDetails.tan}
                    onChange={(e) => handleFinanceChange('taxDetails', 'tan', e.target.value.toUpperCase())}
                    required={financeData.taxDetails.hasTAN}
                    sx={{ mt: 2 }}
                  />
                )}
              </CardContent>
            </Card>

            <Button 
              type="submit" 
              variant="contained" 
              size="large"
              disabled={isLoading}
              sx={{ mt: 2 }}
            >
              Save Banking Details
            </Button>
          </Box>
        </Box>
      )}

      {activeTab === 0 && (
        <Box>
          <Typography variant="h5" gutterBottom>
            Ownership Details
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Provide documents that prove your ownership
          </Typography>
          
          <Box component="form" onSubmit={handleLegalSubmit}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <FormControl fullWidth required sx={{ mb: 3 }}>
                  <InputLabel>Type of ownership does the property have?</InputLabel>
                  <Select
                    value={legalData.ownershipDetails.ownershipType}
                    label="Type of ownership does the property have?"
                    onChange={(e) => handleLegalChange('ownershipDetails', 'ownershipType', e.target.value)}
                  >
                    <MenuItem value="My Own property">My Own property</MenuItem>
                    <MenuItem value="Leased property">Leased property</MenuItem>
                    <MenuItem value="Family property">Family property</MenuItem>
                    <MenuItem value="Partnership">Partnership</MenuItem>
                    <MenuItem value="Trust property">Trust property</MenuItem>
                  </Select>
                </FormControl>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" gutterBottom>
                  Upload Registration Document
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  The address on the registration document should match with the property address
                </Typography>

                {currentFinanceLegal?.legal?.ownershipDetails?.propertyAddress && (
                  <Alert severity="info" icon={<LocationIcon />} sx={{ mb: 2 }}>
                    Your property address: {currentFinanceLegal.legal.ownershipDetails.propertyAddress}
                  </Alert>
                )}

                <UploadArea>
                  <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Drag & Drop the Registration Document
                  </Typography>
                  <Typography variant="body2" paragraph>
                    or
                  </Typography>
                  <Button
                    component="label"
                    variant="contained"
                    startIcon={<CloudUploadIcon />}
                  >
                    Click here to upload
                    <VisuallyHiddenInput
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={handleFileSelect}
                    />
                  </Button>
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    (Upload PDF/PNG/JPG/JPEG files of up to 15 MB)
                  </Typography>
                </UploadArea>

                {selectedFile && (
                  <Box sx={{ mt: 2 }}>
                    <Alert severity="success" sx={{ mb: 2 }}>
                      Selected: {selectedFile.name}
                    </Alert>
                    <Button 
                      variant="outlined" 
                      onClick={handleFileUpload} 
                      disabled={isLoading}
                      startIcon={<CloudUploadIcon />}
                    >
                      Upload Document
                    </Button>
                  </Box>
                )}

                {currentFinanceLegal?.legal?.ownershipDetails?.registrationDocument?.url && (
                  <Alert severity="success" sx={{ mt: 2 }}>
                    <Box>
                      <Typography variant="body2">
                        ✅ Document uploaded: {currentFinanceLegal.legal.ownershipDetails.registrationDocument.originalName}
                      </Typography>
                      <Typography variant="caption">
                        Uploaded on: {new Date(currentFinanceLegal.legal.ownershipDetails.registrationDocument.uploadedAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Alert>
                )}
              </CardContent>
            </Card>

            <Button 
              type="submit" 
              variant="contained" 
              size="large"
              disabled={isLoading}
              sx={{ mt: 2 }}
            >
              Save Ownership Details
            </Button>
          </Box>
        </Box>
      )}

      <Box sx={{ mt: 4, display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'space-between' }}>
  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
    {currentFinanceLegal?.financeCompleted && (
      <Chip 
        icon={<CheckCircleIcon />} 
        label="Finance Section Completed" 
        color="success" 
        variant="outlined"
      />
    )}
    {currentFinanceLegal?.legalCompleted && (
      <Chip 
        icon={<CheckCircleIcon />} 
        label="Legal Section Completed" 
        color="success" 
        variant="outlined"
      />
    )}
  </Box>
  
  <Button 
    variant="contained" 
    // color="success"
    size="large"
    onClick={handleCompleteStep}
    disabled={isLoading}
    sx={{ minWidth: '200px' }}
  >
    Complete Finance Legal
  </Button>
</Box>
    </Paper>
  );
};

export default FinanceLegalForm;