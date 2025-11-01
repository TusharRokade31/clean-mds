// controllers/voiceSearch.controller.js
import Property from '../models/Property.js';
import City from '../models/City.js';
import State from '../models/State.js';
import geminiService from '../services/gemini.service.js';
import { format, addDays } from 'date-fns';

class VoiceSearchController {
  
  async voiceSearch(req, res) {
    try {
      const { voiceInput, userLocation } = req.body;

      console.log('🎤 Voice Search Request:', { voiceInput, userLocation });

      if (!voiceInput || voiceInput.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Voice input is required'
        });
      }

      // Parse voice input using Gemini
      const parsedQuery = await geminiService.parseVoiceQuery(voiceInput, userLocation);
      console.log('📝 Parsed Query:', parsedQuery);

      // Build search parameters
      const searchParams = await this.buildSearchParams(parsedQuery, userLocation);
      console.log('🔍 Search Params:', searchParams);

      // Execute search
      const properties = await this.executeSearch(searchParams);
      console.log(`✅ Found ${properties.length} properties`);

      // Generate natural language response
      const responseText = await geminiService.generateSearchResponse(
        properties,
        searchParams,
        voiceInput
      );

      // Save search history (optional)
      if (req.user) {
        await this.saveSearchHistory(req.user.id, voiceInput, parsedQuery, properties.length);
      }

      return res.status(200).json({
        success: true,
        data: {
          voiceInput,
          parsedQuery,
          searchParams,
          properties,
          totalResults: properties.length,
          responseText,
          suggestions: await this.generateSuggestions(parsedQuery, properties)
        }
      });

    } catch (error) {
      console.error('❌ Voice search error:', error);
      return res.status(500).json({
        success: false,
        message: 'Error processing voice search',
        error: error.message
      });
    }
  }

  async buildSearchParams(parsedQuery, userLocation) {
    const params = {
      query: {},
      sort: {},
      limit: 50,
      location: null,
      dates: null
    };

    // Only published and completed properties
    params.query.status = 'published';
    params.query['formProgress.formCompleted'] = true;

    // Property type filter
    if (parsedQuery.propertyType) {
      params.query.propertyType = parsedQuery.propertyType;
    }

    // Location filter
    if (parsedQuery.location.useUserLocation && userLocation) {
      console.log('📍 Using user location:', userLocation);
      
      const locationConditions = [];
      
      if (userLocation.city) {
        locationConditions.push({ 
          'location.city': new RegExp(userLocation.city, 'i') 
        });
      }
      
      if (userLocation.state) {
        locationConditions.push({ 
          'location.state': new RegExp(userLocation.state, 'i') 
        });
      }
      
      if (locationConditions.length > 0) {
        params.query.$or = locationConditions;
      }
      
      params.location = {
        city: userLocation.city,
        state: userLocation.state
      };
    } 
    else if (parsedQuery.location.city || parsedQuery.location.state) {
      console.log('📍 Using parsed location:', parsedQuery.location);
      
      const locationConditions = [];
      
      if (parsedQuery.location.city) {
        // Try exact match with City collection
        const city = await City.findOne({ 
          name: new RegExp(`^${parsedQuery.location.city}$`, 'i') 
        });
        
        if (city) {
          locationConditions.push({ 'location.cityRef': city._id });
        }
        
        locationConditions.push({ 
          'location.city': new RegExp(parsedQuery.location.city, 'i') 
        });
      }
      
      if (parsedQuery.location.state) {
        const state = await State.findOne({ 
          name: new RegExp(`^${parsedQuery.location.state}$`, 'i') 
        });
        
        if (state) {
          locationConditions.push({ 'location.stateRef': state._id });
        }
        
        locationConditions.push({ 
          'location.state': new RegExp(parsedQuery.location.state, 'i') 
        });
      }
      
      if (locationConditions.length > 0) {
        params.query.$or = locationConditions;
      }
      
      params.location = parsedQuery.location;
    }

    // Date availability filter
    if (parsedQuery.dates.checkin && parsedQuery.dates.checkout && !parsedQuery.dates.flexible) {
      params.query['rooms.availability'] = {
        $elemMatch: {
          startDate: { $lte: new Date(parsedQuery.dates.checkin) },
          endDate: { $gte: new Date(parsedQuery.dates.checkout) },
          availableUnits: { $gt: 0 }
        }
      };
      params.dates = parsedQuery.dates;
    }

    // Guest capacity filter
    if (parsedQuery.guests.adults > 0) {
      params.query['rooms.occupancy.maximumAdults'] = { 
        $gte: parsedQuery.guests.adults 
      };
    }

    // Sorting
    switch (parsedQuery.intent) {
      case 'recommendation':
        params.sort = { placeRating: -1, createdAt: -1 };
        break;
      case 'availability':
        params.sort = { 'rooms.availability.availableUnits': -1, placeRating: -1 };
        break;
      default:
        params.sort = { placeRating: -1, createdAt: -1 };
    }

    params.parsedQuery = parsedQuery;
    return params;
  }

  async executeSearch(searchParams) {
    try {
      const properties = await Property.find(searchParams.query)
        .populate('location.cityRef', 'name')
        .populate('location.stateRef', 'name')
        .sort(searchParams.sort)
        .limit(searchParams.limit)
        .select('-__v -pendingChanges -publishedVersion')
        .lean();

      console.log(`🔎 Database query returned ${properties.length} properties`);

      // Filter rooms if dates specified
      if (searchParams.dates?.checkin && searchParams.dates?.checkout) {
        return properties.map(property => {
          const availableRooms = property.rooms?.filter(room => {
            return room.availability?.some(avail => {
              const availStart = new Date(avail.startDate);
              const availEnd = new Date(avail.endDate);
              const checkin = new Date(searchParams.dates.checkin);
              const checkout = new Date(searchParams.dates.checkout);
              
              return availStart <= checkin && 
                     availEnd >= checkout && 
                     avail.availableUnits > 0;
            });
          }) || [];

          return {
            ...property,
            rooms: availableRooms,
            availableRoomCount: availableRooms.length
          };
        }).filter(p => p.availableRoomCount > 0);
      }

      return properties;
    } catch (error) {
      console.error('❌ Search execution error:', error);
      throw error;
    }
  }

  async getPopularVoiceQueries(req, res) {
    try {
      const popularQueries = [
        {
          category: 'Popular Locations',
          queries: [
            'Dharamshala near me',
            'Ashram in Rishikesh',
            'Dharamshala in Varanasi',
            'Guest house in Haridwar',
            'Yatri Niwas in Ayodhya'
          ]
        },
        {
          category: 'By Property Type',
          queries: [
            'Find ashrams',
            'Show all dharamshalas',
            'Trust guest houses available',
            'Yatri Niwas for pilgrims'
          ]
        },
        {
          category: 'Quick Searches',
          queries: [
            'Available today',
            'Stays for 2 persons',
            'Budget dharamshala',
            'Ashram with meal plan'
          ]
        }
      ];

      return res.status(200).json({
        success: true,
        data: popularQueries
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error fetching popular queries',
        error: error.message
      });
    }
  }

  async getVoiceSearchSuggestions(req, res) {
    try {
      const { partialInput } = req.query;

      if (!partialInput || partialInput.length < 2) {
        return res.status(200).json({
          success: true,
          data: []
        });
      }

      const suggestions = [];

      // Property types
      const propertyTypes = [
        'Dharamshala',
        'Ashram',
        'Trust Guest House',
        'Yatri Niwas / Pilgrim Lodge'
      ];
      
      propertyTypes.forEach(type => {
        if (type.toLowerCase().includes(partialInput.toLowerCase())) {
          suggestions.push({
            type: 'propertyType',
            text: `${type} near me`,
            category: 'Property Type'
          });
        }
      });

      // Cities
      const cities = await City.find({
        name: new RegExp(partialInput, 'i')
      }).limit(5).lean();

      cities.forEach(city => {
        suggestions.push({
          type: 'location',
          text: `Dharamshala in ${city.name}`,
          category: 'Location'
        });
      });

      return res.status(200).json({
        success: true,
        data: suggestions.slice(0, 10)
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error fetching suggestions',
        error: error.message
      });
    }
  }

  async saveSearchHistory(userId, voiceInput, parsedQuery, resultCount) {
    try {
      console.log('📊 Voice Search History:', {
        userId,
        voiceInput,
        parsedQuery,
        resultCount,
        timestamp: new Date()
      });
      // TODO: Save to database if needed
    } catch (error) {
      console.error('Error saving search history:', error);
    }
  }

  async generateSuggestions(parsedQuery, properties) {
    const suggestions = [];

    if (properties.length === 0 && parsedQuery.location.city) {
      suggestions.push({
        type: 'alternative',
        text: `Try searching in nearby areas`,
        action: 'broaden_search'
      });
    }

    if (parsedQuery.propertyType && properties.length < 5) {
      suggestions.push({
        type: 'alternative',
        text: `Also check other accommodation types`,
        action: 'show_all_types'
      });
    }

    if (parsedQuery.dates.checkin && properties.length < 5) {
      suggestions.push({
        type: 'suggestion',
        text: `Try flexible dates for more options`,
        action: 'flexible_dates'
      });
    }

    return suggestions;
  }
}

export default new VoiceSearchController();