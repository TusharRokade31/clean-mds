import mongoose from 'mongoose';
import slugify from 'slugify';
import dotenv from 'dotenv';
import Property from '../models/Property.js';


dotenv.config();

const updateExistingSlugs = async () => {
  try {
    // 1. Connect to your database
    await mongoose.connect(process.env.dbURL);
    console.log('Connected to MongoDB for migration...');

    // 2. Find all properties that don't have a slug yet
    const properties = await Property.find({ 
      $or: [
        { slug: { $exists: false } }, 
        { slug: "" },
        { slug: null }
      ] 
    });

    console.log(`Found ${properties.length} properties to update.`);

    for (const property of properties) {
      // Ensure we have the data needed for Option 1 (Name + City)
      const name = property.placeName || 'property';
      const city = property.location?.city || '';
      
      const baseString = `${name} ${city}`.trim();
      
      // Generate the slug
      let generatedSlug = slugify(baseString, { 
        lower: true, 
        strict: true, 
        trim: true 
      });

      // Handle potential duplicates during migration
      const slugExists = await Property.findOne({ 
        slug: generatedSlug, 
        _id: { $ne: property._id } 
      });

      if (slugExists) {
        generatedSlug = `${generatedSlug}-${Math.floor(1000 + Math.random() * 9000)}`;
      }

      // Update the document
      property.slug = generatedSlug;
      await property.save();
      
      console.log(`Updated: "${property.placeName}" -> ${generatedSlug}`);
    }

    console.log('✅ All properties updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

updateExistingSlugs();