// scripts/migrateFinanceLegalDocuments.js
import mongoose from 'mongoose';
import FinanceLegal from '../models/FinanceLegal.js';
import dotenv from 'dotenv';

dotenv.config();

const migrateDocuments = async () => {
  try {
    await mongoose.connect(process.env.dbURL);
    console.log('Connected to MongoDB');

    // Find all FinanceLegal documents with old structure
    const financeLegals = await FinanceLegal.find({
      'legal.ownershipDetails.registrationDocument': { $exists: true }
    });

    console.log(`Found ${financeLegals.length} documents to migrate`);

    let migratedCount = 0;

   for (const fl of financeLegals) {
  const oldDoc = fl.legal.ownershipDetails.registrationDocument;
  
  if (oldDoc && !Array.isArray(oldDoc) && oldDoc.url) {
    console.log(`Migrating property: ${fl.property}`);
    
    fl.legal.ownershipDetails.registrationDocuments = [{
      filename: oldDoc.filename || '',
      originalName: oldDoc.originalName || '',
      url: oldDoc.url || '',
      uploadedAt: oldDoc.uploadedAt || new Date(),
    }];
    
    fl.legal.ownershipDetails.registrationDocument = undefined;
    
    await fl.save({ validateBeforeSave: false }); // ← Fix here
    migratedCount++;
    console.log(`✓ Migrated property: ${fl.property}`);
  }
}

    console.log(`\nMigration completed! ${migratedCount} documents migrated.`);
    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
};

migrateDocuments();