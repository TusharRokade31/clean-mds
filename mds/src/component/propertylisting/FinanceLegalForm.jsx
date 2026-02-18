// components/FinanceLegalForm.jsx
import React, { useState, useEffect, useRef } from 'react';
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
  CardMedia,
  Divider,
  styled,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  AccountBalance as BankIcon,
  Business as BusinessIcon,
  CheckCircle as CheckCircleIcon,
  LocationOn as LocationIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Close as CloseIcon,
  ArrowBack,
  ArrowForward,
} from '@mui/icons-material';
import {
  completeFinanceLegalStep,
  getFinanceLegal,
  updateFinanceDetails,
  updateLegalDetails,
  uploadRegistrationDocument,
  deleteRegistrationDocument,
} from '@/redux/features/property/propertySlice';
import toast, { Toaster } from "react-hot-toast";

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
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: theme.palette.action.selected,
    borderColor: theme.palette.primary.dark,
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
  
  const [accountNumberError, setAccountNumberError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(false);
  const [previewDialog, setPreviewDialog] = useState(false);
  const [selectedDocIndex, setSelectedDocIndex] = useState(0);
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (propertyId) {
      dispatch(getFinanceLegal(propertyId));
    }
  }, [dispatch, propertyId]);

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
    
    try {
      await dispatch(updateFinanceDetails({ 
        propertyId, 
        data: financeData 
      })).unwrap();
      
      toast.success('Banking details saved successfully!');
      // Auto switch to next tab after successful save
      setActiveTab(1);
    } catch (error) {
      toast.error(error.message || 'Failed to save banking details');
    }
  };

  const handleLegalSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(updateLegalDetails({ 
        propertyId, 
        data: legalData 
      })).unwrap();
      toast.success('Ownership details saved successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to save ownership details');
    }
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validate file size (15MB limit)
    if (file.size > 15 * 1024 * 1024) {
      toast.error('File size must be less than 15MB');
      return;
    }
    
    // Validate file type
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only PDF, PNG, JPG, and JPEG files are allowed');
      return;
    }
    
    setUploadProgress(true);
    
    const formData = new FormData();
    formData.append('registrationDocument', file);
    
    try {
      await dispatch(uploadRegistrationDocument({ 
        propertyId, 
        formData 
      })).unwrap();
      toast.success('Document uploaded successfully!');
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      toast.error(error.message || 'Failed to upload document');
    } finally {
      setUploadProgress(false);
    }
  };

  const handleDeleteDocument = async (documentId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      await dispatch(deleteRegistrationDocument({ 
        propertyId, 
        documentId 
      })).unwrap();
      toast.success('Document deleted successfully!');
      setPreviewDialog(false);
    } catch (error) {
      toast.error(error.message || 'Failed to delete document');
    }
  };

  const handleCompleteStep = async () => {
    try {
      await dispatch(completeFinanceLegalStep(propertyId)).unwrap();
      onComplete?.();
      toast.success('Finance & Legal step completed successfully!');
    } catch (error) {
      toast.error(`Validation errors:\n${error.errors?.join('\n') || error.message}`);
    }
  };

  const openPreview = (index) => {
    setSelectedDocIndex(index);
    setPreviewDialog(true);
  };

  const nextDocument = () => {
    const docs = currentFinanceLegal?.legal?.ownershipDetails?.registrationDocuments || [];
    if (selectedDocIndex < docs.length - 1) {
      setSelectedDocIndex(selectedDocIndex + 1);
    }
  };

  const previousDocument = () => {
    if (selectedDocIndex > 0) {
      setSelectedDocIndex(selectedDocIndex - 1);
    }
  };

  const documents = currentFinanceLegal?.legal?.ownershipDetails?.registrationDocuments || [];
  const currentDocument = documents[selectedDocIndex];

  if (isLoading && !currentFinanceLegal) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper elevation={2} sx={{ p: 3, mx: 'auto', mt: 2 }}>
      <Toaster position="top-right" />
      
      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab 
          icon={<BankIcon />} 
          label="Banking Details" 
          iconPosition="start"
        />
        <Tab 
          icon={<BusinessIcon />} 
          label="Ownership Details" 
          iconPosition="start"
        />
      </Tabs>

      {/* TAB 0: Banking Details */}
      {activeTab === 0 && (
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
              Save & Continue to Ownership
            </Button>
          </Box>
        </Box>
      )}

      {/* TAB 1: Ownership Details */}
      {activeTab === 1 && (
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
                  Upload Registration Documents
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  The address on the registration document should match with the property address. You can upload multiple documents.
                </Typography>

                {currentFinanceLegal?.legal?.ownershipDetails?.propertyAddress && (
                  <Alert severity="info" icon={<LocationIcon />} sx={{ mb: 2 }}>
                    Your property address: {currentFinanceLegal.legal.ownershipDetails.propertyAddress}
                  </Alert>
                )}

                {/* Document Grid - Similar to MediaForm */}
                {documents.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Uploaded Documents ({documents.length})
                    </Typography>
                    <Grid container spacing={2}>
                      {documents.map((doc, index) => (
                        <Grid item key={doc._id || index}>
                          <Card 
                            sx={{
                              width: 200,
                              height: 150,
                              position: 'relative',
                              cursor: 'pointer',
                              borderRadius: 2,
                              overflow: 'hidden',
                              border: '2px solid',
                              borderColor: 'success.main',
                              '&:hover': {
                                transform: 'scale(1.02)',
                                transition: 'transform 0.2s ease-in-out',
                                boxShadow: 4
                              }
                            }}
                            onClick={() => openPreview(index)}
                          >
                            {doc.originalName?.match(/\.(jpg|jpeg|png)$/i) ? (
                              <CardMedia
                                component="img"
                                image={doc.url}
                                alt={doc.originalName}
                                sx={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'contain',
                                  bgcolor: '#f5f5f5'
                                }}
                              />
                            ) : (
                              <Box
                                sx={{
                                  width: '100%',
                                  height: '100%',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  bgcolor: '#f5f5f5'
                                }}
                              >
                                <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                                <Typography variant="caption" align="center" sx={{ px: 1 }}>
                                  {doc.originalName}
                                </Typography>
                              </Box>
                            )}
                            <Chip
                              label={`Doc ${index + 1}`}
                              color="success"
                              size="small"
                              sx={{ 
                                position: 'absolute', 
                                top: 8, 
                                left: 8,
                                fontSize: '0.7rem',
                                height: 20
                              }}
                            />
                            <IconButton
                              size="small"
                              sx={{
                                position: 'absolute',
                                top: 8,
                                right: 8,
                                bgcolor: 'rgba(255,255,255,0.9)',
                                '&:hover': {
                                  bgcolor: 'rgba(255,255,255,1)',
                                }
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteDocument(doc._id);
                              }}
                            >
                              <DeleteIcon fontSize="small" color="error" />
                            </IconButton>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}

                {/* Upload Area */}
                <UploadArea>
                  {uploadProgress ? (
                    <Box>
                      <CircularProgress sx={{ mb: 2 }} />
                      <Typography variant="h6">Uploading document...</Typography>
                    </Box>
                  ) : (
                    <>
                      <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                      <Typography variant="h6" gutterBottom>
                        Drag & Drop Registration Documents
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
                          ref={fileInputRef}
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg"
                          onChange={handleFileSelect}
                        />
                      </Button>
                      <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                        (Upload PDF/PNG/JPG/JPEG files of up to 15 MB)
                      </Typography>
                    </>
                  )}
                </UploadArea>
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

      {/* Preview Dialog */}
      <Dialog 
        open={previewDialog} 
        onClose={() => setPreviewDialog(false)} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{ sx: { borderRadius: 4, bgcolor: '#fafafa' } }}
      >
        <DialogTitle sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {currentDocument?.originalName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Viewing {selectedDocIndex + 1} of {documents.length}
            </Typography>
          </Box>
          <IconButton onClick={() => setPreviewDialog(false)} sx={{ bgcolor: '#eee' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ p: 0, bgcolor: '#333' }}>
          {currentDocument && (
            <Box sx={{ 
              position: 'relative', 
              height: '70vh', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              overflow: 'hidden'
            }}>
              {currentDocument.originalName?.match(/\.(jpg|jpeg|png)$/i) ? (
                <img
                  src={currentDocument.url}
                  alt={currentDocument.originalName}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain'
                  }}
                />
              ) : (
                <Box sx={{ 
                  width: '100%', 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white'
                }}>
                  <CloudUploadIcon sx={{ fontSize: 64, mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    PDF Document
                  </Typography>
                  <Button
                    variant="contained"
                    href={currentDocument.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ mt: 2 }}
                  >
                    Open PDF
                  </Button>
                </Box>
              )}
              
              {/* Navigation Arrows */}
              <IconButton
                onClick={previousDocument}
                disabled={selectedDocIndex === 0}
                sx={{ 
                  position: 'absolute', 
                  left: 20, 
                  color: 'white', 
                  bgcolor: 'rgba(255,255,255,0.1)', 
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } 
                }}
              >
                <ArrowBack />
              </IconButton>
              
              <IconButton
                onClick={nextDocument}
                disabled={selectedDocIndex === documents.length - 1}
                sx={{ 
                  position: 'absolute', 
                  right: 20, 
                  color: 'white', 
                  bgcolor: 'rgba(255,255,255,0.1)', 
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } 
                }}
              >
                <ArrowForward />
              </IconButton>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 2, bgcolor: 'white' }}>
          <Button
            startIcon={<DeleteIcon />}
            color="error"
            onClick={() => currentDocument && handleDeleteDocument(currentDocument._id)}
          >
            Delete Document
          </Button>
          <Box sx={{ flexGrow: 1 }} />
          <Button
            variant="outlined"
            href={currentDocument?.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            View Full Document
          </Button>
          <Button onClick={() => setPreviewDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Completion Section */}
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
          size="large"
          onClick={handleCompleteStep}
          disabled={isLoading}
          sx={{ minWidth: '200px' }}
        >
          Complete Finance & Legal
        </Button>
      </Box>
    </Paper>
  );
};

export default FinanceLegalForm;