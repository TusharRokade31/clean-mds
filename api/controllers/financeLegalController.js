// controllers/financeLegalController.js
import FinanceLegal from '../models/FinanceLegal.js';
import Property from '../models/Property.js';
import { validationResult } from 'express-validator';

// Get or create finance legal data for a property
export const getFinanceLegal = async (req, res) => {
  try {
    const { propertyId } = req.params;
    
    // Check if property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    let financeLegal = await FinanceLegal.findOne({ 
      property: propertyId 
    }).populate('property', 'placeName propertyType location');

    // Create default structure if doesn't exist
    if (!financeLegal) {
      const defaultFinanceLegal = {
        property: propertyId,
        owner: property.owner || req.user?.id,
        finance: {
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
        },
        legal: {
          ownershipDetails: {
            ownershipType: 'My Own property', // Required field with default
            propertyAddress: `${property.location.street}, ${property.location.city}, ${property.location.state} - ${property.location.postalCode}`,
            registrationDocument: {
              filename: '',
              originalName: '',
              url: ''
            }
          }
        },
        financeCompleted: false,
        legalCompleted: false
      };
      
      // Create without validation for initial setup
      financeLegal = new FinanceLegal(defaultFinanceLegal);
      await financeLegal.save({ validateBeforeSave: false });
      
      // Populate the newly created finance legal data
      financeLegal = await FinanceLegal.findById(financeLegal._id)
        .populate('property', 'placeName propertyType location');
    }

    res.status(200).json({
      success: true,
      data: financeLegal
    });

  } catch (error) {
    console.error('Get finance legal error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Update finance details
export const updateFinanceDetails = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { propertyId } = req.params;
    const { bankDetails, taxDetails } = req.body;

    let financeLegal = await FinanceLegal.findOne({ 
      property: propertyId,
      owner: req.user._id 
    });

    if (!financeLegal) {
      return res.status(404).json({
        success: false,
        message: 'Finance legal data not found'
      });
    }

    // Update finance details
    if (bankDetails) {
      financeLegal.finance.bankDetails = { ...financeLegal.finance.bankDetails, ...bankDetails };
    }
    
    if (taxDetails) {
      financeLegal.finance.taxDetails = { ...financeLegal.finance.taxDetails, ...taxDetails };
    }

    // Check if finance section is completed
    const financeComplete = 
      financeLegal.finance.bankDetails.accountNumber &&
      financeLegal.finance.bankDetails.ifscCode &&
      financeLegal.finance.bankDetails.bankName &&
      financeLegal.finance.taxDetails.pan &&
      (!financeLegal.finance.taxDetails.hasGSTIN || financeLegal.finance.taxDetails.gstin) &&
      (!financeLegal.finance.taxDetails.hasTAN || financeLegal.finance.taxDetails.tan);

    financeLegal.financeCompleted = financeComplete;

    await financeLegal.save();

    res.status(200).json({
      success: true,
      message: 'Finance details updated successfully',
      data: financeLegal
    });

  } catch (error) {
    console.error('Update finance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Update legal details
export const updateLegalDetails = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { propertyId } = req.params;
    const { ownershipDetails } = req.body;

    let financeLegal = await FinanceLegal.findOne({ 
      property: propertyId,
      owner: req.user._id 
    });

    if (!financeLegal) {
      return res.status(404).json({
        success: false,
        message: 'Finance legal data not found'
      });
    }

    // Update legal details
    if (ownershipDetails) {
      financeLegal.legal.ownershipDetails = { 
        ...financeLegal.legal.ownershipDetails.toObject(), 
        ...ownershipDetails 
      };
    }

    // Fix: Check if legal section is completed with proper boolean logic
    const legalComplete = Boolean(
      financeLegal.legal.ownershipDetails.ownershipType &&
      financeLegal.legal.ownershipDetails.propertyAddress &&
      financeLegal.legal.ownershipDetails.registrationDocument?.url
    );

    financeLegal.legalCompleted = legalComplete;

    await financeLegal.save();

    res.status(200).json({
      success: true,
      message: 'Legal details updated successfully',
      data: financeLegal
    });

  } catch (error) {
    console.error('Update legal error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Upload registration document
export const uploadRegistrationDocument = async (req, res) => {
  try {
    const { propertyId } = req.params;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    let financeLegal = await FinanceLegal.findOne({ 
      property: propertyId,
      owner: req.user._id 
    });

    if (!financeLegal) {
      return res.status(404).json({
        success: false,
        message: 'Finance legal data not found'
      });
    }

    // Update registration document with proper file path
    const documentData = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      url: req.file.path.replace(/\\/g, '/'), // Normalize path separators
      uploadedAt: new Date()
    };

    financeLegal.legal.ownershipDetails.registrationDocument = documentData;

    // Check if legal section is completed
    const legalComplete = Boolean(
      financeLegal.legal.ownershipDetails.ownershipType &&
      financeLegal.legal.ownershipDetails.propertyAddress &&
      financeLegal.legal.ownershipDetails.registrationDocument.url
    );

    financeLegal.legalCompleted = legalComplete;

    await financeLegal.save();

    res.status(200).json({
      success: true,
      message: 'Registration document uploaded successfully',
      data: financeLegal
    });

  } catch (error) {
    console.error('Upload document error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
// Delete finance legal data
export const deleteFinanceLegal = async (req, res) => {
  try {
    const { propertyId } = req.params;

    const result = await FinanceLegal.findOneAndDelete({ 
      property: propertyId,
      owner: req.user._id 
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Finance legal data not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Finance legal data deleted successfully'
    });

  } catch (error) {
    console.error('Delete finance legal error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};