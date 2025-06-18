// models/FinanceLegal.js
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const BankDetailsSchema = new Schema({
  accountNumber: {
    type: String,
    required: [true, 'Account number is required']
  },
  reenterAccountNumber: {
    type: String,
    required: [true, 'Please re-enter account number'],
    validate: {
      validator: function(value) {
        return value === this.accountNumber;
      },
      message: 'Account numbers do not match'
    }
  },
  ifscCode: {
    type: String,
    required: [true, 'IFSC code is required'],
    match: [/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Please enter a valid IFSC code']
  },
  bankName: {
    type: String,
    required: [true, 'Bank name is required']
  }
});

const TaxDetailsSchema = new Schema({
  hasGSTIN: {
    type: Boolean,
    default: false
  },
  gstin: {
    type: String,
    validate: {
      validator: function(value) {
        if (this.hasGSTIN && !value) {
          return false;
        }
        if (value && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(value)) {
          return false;
        }
        return true;
      },
      message: 'Please enter a valid GSTIN'
    }
  },
  pan: {
    type: String,
    required: [true, 'PAN is required'],
    match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Please enter a valid PAN number']
  },
  hasTAN: {
    type: Boolean,
    default: false
  },
  tan: {
    type: String,
    validate: {
      validator: function(value) {
        if (this.hasTAN && !value) {
          return false;
        }
        if (value && !/^[A-Z]{4}[0-9]{5}[A-Z]{1}$/.test(value)) {
          return false;
        }
        return true;
      },
      message: 'Please enter a valid TAN number'
    }
  }
});

const OwnershipDetailsSchema = new Schema({
  ownershipType: {
    type: String,
    required: [true, 'Ownership type is required'],
    enum: ['My Own property', 'Leased property', 'Family property', 'Partnership', 'Trust property']
  },
  registrationDocument: {
    filename: {
      type: String,
      default: ''
    },
    originalName: {
      type: String,
      default: ''
    },
    url: {
      type: String,
      default: ''
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  },
  propertyAddress: {
    type: String,
    required: [true, 'Property address is required']
  }
}, { _id: false });

const FinanceLegalSchema = new Schema({
  property: {
    type: Schema.Types.ObjectId,
    ref: 'Property',
    required: [true, 'Property reference is required'],
    unique: true
  },
  
  // Finance Section
  finance: {
    bankDetails: BankDetailsSchema,
    taxDetails: TaxDetailsSchema
  },
  
  // Legal Section
  legal: {
    ownershipDetails: OwnershipDetailsSchema
  },
  
  // Completion tracking
  financeCompleted: {
    type: Boolean,
    default: false
  },
  legalCompleted: {
    type: Boolean,
    default: false
  },
  
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Owner reference is required']
  }
}, {
  timestamps: true
});

// Index for faster queries
FinanceLegalSchema.index({ property: 1, owner: 1 });

const FinanceLegal = mongoose.model('FinanceLegal', FinanceLegalSchema);

export default FinanceLegal;