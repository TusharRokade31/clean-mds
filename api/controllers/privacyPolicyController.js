// controllers/privacyPolicyController.js
import PrivacyPolicy from '../models/PrivacyPolicy.js';
import Property from '../models/Property.js';
import { validationResult } from 'express-validator';

// Get privacy policy for a property
export const getPrivacyPolicy = async (req, res) => {
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
    
    let privacyPolicy = await PrivacyPolicy.findOne({ 
      property: propertyId, 
      isActive: true 
    }).populate('property', 'placeName propertyType');
    
    // If no privacy policy exists, create one with default values
    if (!privacyPolicy) {
      const defaultPolicy = {
        property: propertyId,
        checkInCheckOut: {
          checkInTime: '12:00 pm (noon)',
          checkOutTime: '12:00 pm (noon)',
          has24HourCheckIn: false
        },
        cancellationPolicy: 'free_cancellation_checkin',
        propertyRules: {
          guestProfile: {
            allowUnmarriedCouples: false,
            allowGuestsBelow18: false,
            allowOnlyMaleGuests: false
          },
          acceptableIdentityProofs: [],
        },
        propertyRestrictions: {
          nonVegetarianFood: {
            allowed: true,
            restrictions: ''
          },
          alcoholSmoking: {
            alcoholAllowed: false,
            smokingAllowed: false,
            smokingAreas: 'not_allowed',
            restrictions: ''
          },
          noiseRestrictions: {
            quietHours: {
              enabled: true,
              startTime: '10:00 PM',
              endTime: '7:00 AM'
            },
            musicAllowed: true,
            partyAllowed: false,
            restrictions: ''
          }
        },
        petPolicy: {
          petsAllowed: false,
          petTypes: [],
          petDeposit: {
            required: false,
            amount: 0
          },
          petRules: ''
        },
        customPolicies: [],
        mealPrices: {
          breakfast: {
            available: false,
            price: 0,
            description: ''
          },
          lunch: {
            available: false,
            price: 0,
            description: ''
          },
          dinner: {
            available: false,
            price: 0,
            description: ''
          }
        },
        createdBy: property.owner || req.user?.id,
        isActive: true
      };

      privacyPolicy = new PrivacyPolicy(defaultPolicy);
      await privacyPolicy.save();
      
      // Populate the newly created policy
      privacyPolicy = await PrivacyPolicy.findById(privacyPolicy._id)
        .populate('property', 'placeName propertyType');
    }
    
    res.status(200).json({
      success: true,
      data: privacyPolicy
    });
  } catch (error) {
    console.error('Get privacy policy error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Add custom policy
export const addCustomPolicy = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { title, description } = req.body;
    
    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title and description are required'
      });
    }

    const privacyPolicy = await PrivacyPolicy.findOne({ 
      property: propertyId, 
      isActive: true 
    });
    
    if (!privacyPolicy) {
      return res.status(404).json({
        success: false,
        message: 'Privacy policy not found'
      });
    }
    
    const newCustomPolicy = {
      title,
      description,
      isActive: true,
      createdAt: new Date()
    };
    
    privacyPolicy.customPolicies.push(newCustomPolicy);
    privacyPolicy.lastUpdated = new Date();
    await privacyPolicy.save();
    
    const updatedPolicy = await PrivacyPolicy.findById(privacyPolicy._id)
      .populate('property', 'placeName propertyType');
    
    res.status(200).json({
      success: true,
      message: 'Custom policy added successfully',
      data: updatedPolicy
    });
  } catch (error) {
    console.error('Add custom policy error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Update custom policy
export const updateCustomPolicy = async (req, res) => {
  try {
    const { propertyId, policyId } = req.params;
    const { title, description, isActive } = req.body;
    
    const privacyPolicy = await PrivacyPolicy.findOne({ 
      property: propertyId, 
      isActive: true 
    });
    
    if (!privacyPolicy) {
      return res.status(404).json({
        success: false,
        message: 'Privacy policy not found'
      });
    }
    
    const customPolicy = privacyPolicy.customPolicies.id(policyId);
    if (!customPolicy) {
      return res.status(404).json({
        success: false,
        message: 'Custom policy not found'
      });
    }
    
    if (title) customPolicy.title = title;
    if (description) customPolicy.description = description;
    if (typeof isActive === 'boolean') customPolicy.isActive = isActive;
    
    privacyPolicy.lastUpdated = new Date();
    await privacyPolicy.save();
    
    const updatedPolicy = await PrivacyPolicy.findById(privacyPolicy._id)
      .populate('property', 'placeName propertyType');
    
    res.status(200).json({
      success: true,
      message: 'Custom policy updated successfully',
      data: updatedPolicy
    });
  } catch (error) {
    console.error('Update custom policy error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Delete custom policy
export const deleteCustomPolicy = async (req, res) => {
  try {
    const { propertyId, policyId } = req.params;
    
    const privacyPolicy = await PrivacyPolicy.findOne({ 
      property: propertyId, 
      isActive: true 
    });
    
    if (!privacyPolicy) {
      return res.status(404).json({
        success: false,
        message: 'Privacy policy not found'
      });
    }
    
    privacyPolicy.customPolicies.pull(policyId);
    privacyPolicy.lastUpdated = new Date();
    await privacyPolicy.save();
    
    const updatedPolicy = await PrivacyPolicy.findById(privacyPolicy._id)
      .populate('property', 'placeName propertyType');
    
    res.status(200).json({
      success: true,
      message: 'Custom policy deleted successfully',
      data: updatedPolicy
    });
  } catch (error) {
    console.error('Delete custom policy error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Create or update privacy policy for a property
export const createOrUpdatePrivacyPolicy = async (req, res) => {
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
    const policyData = req.body;
    
    // Check if property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }
    
    // Deactivate existing policy
    await PrivacyPolicy.updateMany(
      { property: propertyId },
      { isActive: false }
    );
    
    // Create new policy
    const newPrivacyPolicy = new PrivacyPolicy({
      ...policyData,
      property: propertyId,
      createdBy: req.user?.id || property.owner,
      isActive: true,
      version: 1,
      effectiveDate: new Date()
    });
    
    await newPrivacyPolicy.save();
    
    // Populate the response
    const populatedPolicy = await PrivacyPolicy.findById(newPrivacyPolicy._id)
      .populate('property', 'placeName propertyType')
      .populate('createdBy', 'name email');
    
    res.status(201).json({
      success: true,
      message: 'Privacy policy created/updated successfully',
      data: populatedPolicy
    });
  } catch (error) {
    console.error('Create/Update privacy policy error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};


// Complete step 6 - Privacy Policy
export const completePrivacyPolicyStep = async (req, res) => {
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

    // Get privacy policy
    const privacyPolicy = await PrivacyPolicy.findOne({ 
      property: propertyId, 
      isActive: true 
    });

    if (!privacyPolicy) {
      return res.status(404).json({
        success: false,
        message: 'Privacy policy not found'
      });
    }

    // Validate required fields for step completion
    const validationErrors = [];

    // Check check-in/check-out times
    if (!privacyPolicy.checkInCheckOut.checkInTime || !privacyPolicy.checkInCheckOut.checkOutTime) {
      validationErrors.push('Check-in and check-out times are required');
    }

    // Check cancellation policy
    if (!privacyPolicy.cancellationPolicy) {
      validationErrors.push('Cancellation policy is required');
    }

    // Check guest profile settings
    const guestProfile = privacyPolicy.propertyRules.guestProfile;
    if (guestProfile.allowUnmarriedCouples === undefined || 
        guestProfile.allowGuestsBelow18 === undefined || 
        guestProfile.allowOnlyMaleGuests === undefined) {
      validationErrors.push('Guest profile preferences must be set');
    }

    // Check identity proofs
    if (!privacyPolicy.propertyRules.acceptableIdentityProofs || 
        privacyPolicy.propertyRules.acceptableIdentityProofs.length === 0) {
      validationErrors.push('At least one acceptable identity proof must be selected');
    }

    // Check property restrictions
    const restrictions = privacyPolicy.propertyRestrictions;
    if (restrictions.nonVegetarianFood.allowed === undefined) {
      validationErrors.push('Non-vegetarian food policy must be set');
    }

    if (restrictions.alcoholSmoking.alcoholAllowed === undefined || 
        restrictions.alcoholSmoking.smokingAllowed === undefined) {
      validationErrors.push('Alcohol and smoking policies must be set');
    }

    if (restrictions.noiseRestrictions.quietHours.enabled === undefined) {
      validationErrors.push('Quiet hours policy must be set');
    }

    // Check pet policy
    if (privacyPolicy.petPolicy.petsAllowed === undefined) {
      validationErrors.push('Pet policy must be set');
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Privacy policy is incomplete',
        errors: validationErrors
      });
    }

    // Update property step completion
    property.formProgress.step6Completed = true;
    await property.save();

    res.status(200).json({
      success: true,
      message: 'Privacy policy step completed successfully',
      data: {
        propertyId: property._id,
        step6Completed: true,
        privacyPolicy: privacyPolicy
      }
    });

  } catch (error) {
    console.error('Complete privacy policy step error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
// Update specific sections of privacy policy
export const updatePrivacyPolicySection = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { section, data } = req.body;
    
    const privacyPolicy = await PrivacyPolicy.findOne({ 
      property: propertyId, 
      isActive: true 
    });
    
    if (!privacyPolicy) {
      return res.status(404).json({
        success: false,
        message: 'Privacy policy not found'
      });
    }
    
    // Handle cancellation policy specially
    if (section === 'cancellationPolicy') {
      privacyPolicy.cancellationPolicy = data;
    } else if (privacyPolicy[section]) {
      // Update other sections
      privacyPolicy[section] = { ...privacyPolicy[section], ...data };
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid section name'
      });
    }
    
    privacyPolicy.lastUpdated = new Date();
    await privacyPolicy.save();
    
    const updatedPolicy = await PrivacyPolicy.findById(privacyPolicy._id)
      .populate('property', 'placeName propertyType');
    
    res.status(200).json({
      success: true,
      message: 'Privacy policy section updated successfully',
      data: updatedPolicy
    });
  } catch (error) {
    console.error('Update privacy policy section error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get privacy policy history for a property
export const getPrivacyPolicyHistory = async (req, res) => {
  try {
    const { propertyId } = req.params;
    
    const policies = await PrivacyPolicy.find({ property: propertyId })
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email')
      .select('version effectiveDate lastUpdated isActive createdAt');
    
    res.status(200).json({
      success: true,
      data: policies
    });
  } catch (error) {
    console.error('Get privacy policy history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Delete privacy policy (soft delete)
export const deletePrivacyPolicy = async (req, res) => {
  try {
    const { propertyId } = req.params;
    
    const privacyPolicy = await PrivacyPolicy.findOne({ 
      property: propertyId, 
      isActive: true 
    });
    
    if (!privacyPolicy) {
      return res.status(404).json({
        success: false,
        message: 'Privacy policy not found'
      });
    }
    
    privacyPolicy.isActive = false;
    await privacyPolicy.save();
    
    res.status(200).json({
      success: true,
      message: 'Privacy policy deleted successfully'
    });
  } catch (error) {
    console.error('Delete privacy policy error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get privacy policy template/defaults
export const getPrivacyPolicyTemplate = async (req, res) => {
  try {
    const template = {
      checkInCheckOut: {
        checkInTime: '12:00 pm (noon)',
        checkOutTime: '12:00 pm (noon)',
        has24HourCheckIn: false
      },
      cancellationPolicy: 'free_cancellation_checkin',
      propertyRules: {
        guestProfile: {
          allowUnmarriedCouples: false,
          allowGuestsBelow18: false,
          allowOnlyMaleGuests: false
        },
        acceptableIdentityProofs: ['passport', 'drivers_license', 'national_id'],
      },
      propertyRestrictions: {
        nonVegetarianFood: {
          allowed: true,
          restrictions: ''
        },
        alcoholSmoking: {
          alcoholAllowed: false,
          smokingAllowed: false,
          smokingAreas: 'not_allowed',
          restrictions: ''
        },
        noiseRestrictions: {
          quietHours: {
            enabled: true,
            startTime: '10:00 PM',
            endTime: '7:00 AM'
          },
          musicAllowed: true,
          partyAllowed: false,
          restrictions: ''
        }
      },
      petPolicy: {
        petsAllowed: false,
        petTypes: [],
        petDeposit: {
          required: false,
          amount: 0
        },
        petRules: ''
      },
      customPolicies: [],
      mealPrices: {
        breakfast: {
          available: false,
          price: 0,
          description: ''
        },
        lunch: {
          available: false,
          price: 0,
          description: ''
        },
        dinner: {
          available: false,
          price: 0,
          description: ''
        }
      },
      dataCollection: {
        personalDataCollection: true,
        dataTypes: ['name', 'email', 'phone', 'identity_proof'],
        dataRetentionPeriod: 24,
        shareDataWithThirdParties: false
      }
    };
    
    res.status(200).json({
      success: true,
      data: template
    });
  } catch (error) {
    console.error('Get privacy policy template error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};