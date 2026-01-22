// components/BookingFlow/steps/PaymentDetails.jsx
import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Alert,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  Payment,
  CreditCard,
  AccountBalance,
  Money,
  QrCode
} from '@mui/icons-material';

const PaymentDetails = ({ bookingData, onBack, onSubmit, isLoading }) => {
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paidAmount, setPaidAmount] = useState(0);
  const [transactionId, setTransactionId] = useState('');
  const [errors, setErrors] = useState({});

  const totalAmount = bookingData.pricing?.totalAmount || 0;
  const pendingAmount = totalAmount - paidAmount;

  const paymentMethods = [
    { value: 'cash', label: 'Cash', icon: <Money /> },
    { value: 'card', label: 'Credit/Debit Card', icon: <CreditCard /> },
    { value: 'upi', label: 'UPI', icon: <QrCode /> },
    { value: 'bank_transfer', label: 'Bank Transfer', icon: <AccountBalance /> }
  ];

  const validateForm = () => {
    const newErrors = {};

    if (paidAmount < 0) {
      newErrors.paidAmount = 'Amount cannot be negative';
    }

    if (paidAmount > totalAmount) {
      newErrors.paidAmount = 'Amount cannot exceed total booking amount';
    }

    if (paymentMethod !== 'cash' && paidAmount > 0 && !transactionId) {
      newErrors.transactionId = 'Transaction ID is required for online payments';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      const paymentData = {
        paymentMethod,
        paidAmount,
        transactionId: paymentMethod === 'cash' ? '' : transactionId,
        payment: {
          method: paymentMethod,
          paidAmount,
          pendingAmount,
          status: paidAmount >= totalAmount ? 'completed' : paidAmount > 0 ? 'partial' : 'pending',
          transactionId: paymentMethod === 'cash' ? '' : transactionId,
          paymentDate: new Date()
        }
      };
      onSubmit(paymentData);
    }
  };

  const handleAmountChange = (e) => {
    const value = parseFloat(e.target.value) || 0;
    setPaidAmount(value);
  };

  const setFullPayment = () => {
    setPaidAmount(totalAmount);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Payment Details
      </Typography>

      <Grid container spacing={3}>
        {/* Payment Form */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Payment sx={{ mr: 1 }} />
                <Typography variant="h6">Payment Information</Typography>
              </Box>

              {/* Payment Method Selection */}
              <FormControl component="fieldset" sx={{ mb: 3 }}>
                <FormLabel component="legend">Payment Method</FormLabel>
                <RadioGroup
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  sx={{ mt: 1 }}
                >
                  {paymentMethods.map((method) => (
                    <FormControlLabel
                      key={method.value}
                      value={method.value}
                      control={<Radio />}
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {method.icon}
                          <Typography sx={{ ml: 1 }}>{method.label}</Typography>
                        </Box>
                      }
                    />
                  ))}
                </RadioGroup>
              </FormControl>

              {/* Payment Amount */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <TextField
                    label="Amount to Pay"
                    type="number"
                    slotProps={{
                      htmlInput: {
                        onWheel: (e) => e.currentTarget.blur(),
                      },
                    }}
                    value={paidAmount}
                    onChange={handleAmountChange}
                    error={!!errors.paidAmount}
                    helperText={errors.paidAmount}
                    InputProps={{
                      startAdornment: <Typography sx={{ mr: 1 }}>₹</Typography>
                    }}
                    sx={{ minWidth: 200 }}
                  />
                  <Button
                    variant="outlined"
                    onClick={setFullPayment}
                    size="small"
                  >
                    Pay Full Amount
                  </Button>
                </Box>

                {pendingAmount > 0 && (
                  <Alert severity="info">
                    Pending amount: ₹{pendingAmount.toLocaleString()}
                  </Alert>
                )}
              </Box>

              {/* Transaction ID for non-cash payments */}
              {paymentMethod !== 'cash' && paidAmount > 0 && (
                <TextField
                  fullWidth
                  label="Transaction ID"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  error={!!errors.transactionId}
                  helperText={errors.transactionId}
                  placeholder="Enter transaction ID"
                  sx={{ mb: 2 }}
                />
              )}

              {/* Payment Instructions */}
              {paymentMethod !== 'cash' && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  {paymentMethod === 'upi' && 'Please complete the UPI payment and enter the transaction ID.'}
                  {paymentMethod === 'card' && 'Please complete the card payment and enter the transaction ID.'}
                  {paymentMethod === 'bank_transfer' && 'Please complete the bank transfer and enter the transaction ID.'}
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Payment Summary */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Payment Summary
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Total Amount</Typography>
                  <Typography variant="body2">₹{totalAmount.toLocaleString()}</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Paying Now</Typography>
                  <Typography variant="body2" color="primary">
                    ₹{paidAmount.toLocaleString()}
                  </Typography>
                </Box>
                
                <Divider sx={{ my: 1 }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" fontWeight="bold">
                    Pending Amount
                  </Typography>
                  <Typography variant="body2" fontWeight="bold" color="error">
                    ₹{pendingAmount.toLocaleString()}
                  </Typography>
                </Box>
              </Box>

              <Alert 
                severity={pendingAmount === 0 ? 'success' : 'warning'} 
                sx={{ mb: 2 }}
              >
                {pendingAmount === 0 
                  ? 'Full payment will be completed' 
                  : 'This will be a partial payment'
                }
              </Alert>

              <Typography variant="body2" color="text.secondary">
                Payment Method: {paymentMethods.find(m => m.value === paymentMethod)?.label}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Navigation Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button
          variant="outlined"
          onClick={onBack}
          size="large"
          disabled={isLoading}
        >
          Back
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          size="large"
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={20} /> : null}
        >
          {isLoading ? 'Processing...' : 'Confirm Booking'}
        </Button>
      </Box>
    </Box>
  );
};

export default PaymentDetails;