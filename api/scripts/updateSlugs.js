import mongoose from 'mongoose';
import slugify from 'slugify';
import dotenv from 'dotenv';
import Property from '../models/Property.js';


dotenv.config();

const updateExistingSlugs = async () => {
  try {
    await mongoose.connect(process.env.dbURL);
    console.log('Connected to MongoDB...');

    // Find all properties where slug is missing, null, or empty string
    const properties = await Property.find({ 
      $or: [
        { slug: { $exists: false } }, 
        { slug: "" },
        { slug: null }
      ] 
    });

    console.log(`Found ${properties.length} properties to update.`);

    for (const property of properties) {
      const name = property.placeName || 'property';
      const city = property.location?.city || '';
      const baseString = `${name} ${city}`.trim();
      
      let generatedSlug = slugify(baseString, { lower: true, strict: true });

      // Direct update to bypass any middleware logic that might be blocking the save
      await Property.updateOne(
        { _id: property._id },
        { $set: { slug: generatedSlug } }
      );
      
      console.log(`Updated ID ${property._id} with slug: ${generatedSlug}`);
    }

    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

updateExistingSlugs();