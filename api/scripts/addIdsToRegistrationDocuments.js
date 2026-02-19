// scripts/addIdsToRegistrationDocuments.js
import mongoose from 'mongoose';
import FinanceLegal from '../models/FinanceLegal.js';
import dotenv from 'dotenv';

dotenv.config();

const addIdsToDocuments = async () => {
  try {
    await mongoose.connect(process.env.dbURL);
    console.log('Connected to MongoDB');

    // Find all FinanceLegal records that have registrationDocuments
    const financeLegals = await FinanceLegal.find({
      'legal.ownershipDetails.registrationDocuments': { $exists: true, $ne: [] }
    });

    console.log(`Found ${financeLegals.length} records to process`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const fl of financeLegals) {
      const docs = fl.legal.ownershipDetails.registrationDocuments;
      let needsUpdate = false;

      docs.forEach((doc, index) => {
        if (!doc._id) {
          // Assign new ObjectId to documents without _id
          docs[index]._id = new mongoose.Types.ObjectId();
          needsUpdate = true;
          console.log(`  ✓ Added _id to doc: ${doc.originalName}`);
        }
      });

      if (needsUpdate) {
        await FinanceLegal.updateOne(
          { _id: fl._id },
          { 
            $set: { 
              'legal.ownershipDetails.registrationDocuments': docs.map(doc => ({
                _id: doc._id || new mongoose.Types.ObjectId(),
                filename: doc.filename,
                originalName: doc.originalName,
                url: doc.url,
                uploadedAt: doc.uploadedAt || new Date(),
              }))
            } 
          }
        );
        updatedCount++;
        console.log(`✓ Updated property: ${fl.property}`);
      } else {
        skippedCount++;
        console.log(`— Skipped (already has _ids): ${fl.property}`);
      }
    }

    console.log('\n=== Migration Complete ===');
    console.log(`Updated: ${updatedCount}`);
    console.log(`Skipped: ${skippedCount}`);
    console.log(`Total:   ${financeLegals.length}`);

    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
};

addIdsToDocuments();