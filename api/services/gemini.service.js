// services/gemini.service.js
import { GoogleGenerativeAI } from '@google/generative-ai';

class GeminiService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  }

  async parseVoiceQuery(voiceInput, userContext = {}) {
    const prompt = `
You are an intelligent assistant for "My Divine Stay" (MDS), a platform for booking spiritual accommodations in India.

Available property types:
1. Dharamshala 
2. Ashram (Spiritual centers offering meditation/yoga stay with a guru or community)
3. Trust Guest House (Guesthouses owned/operated by temple or religious trusts)
4. Yatri Niwas / Pilgrim Lodge (Budget stays designed for pilgrims by governments or religious orgs)

User Input: "${voiceInput}"
User Location: ${userContext.city || 'Unknown'}, ${userContext.state || 'India'}
Current Date: ${new Date().toISOString().split('T')[0]}

Parse this voice input and extract the following information in JSON format:
{
  "intent": "search|availability|recommendation|information",
  "location": {
    "city": "extracted city name or null",
    "state": "extracted state name or null",
    "useUserLocation": true/false (true if user says "near me", "nearby", "here")
  },
  "propertyType": "one of the 4 types above or null for all types",
  "dates": {
    "checkin": "YYYY-MM-DD or null",
    "checkout": "YYYY-MM-DD or null",
    "flexible": true/false
  },
  "guests": {
    "adults": number or 1,
    "children": number or 0
  },
  "preferences": {
    "amenities": ["extracted amenities"],
    "priceRange": "budget|moderate|premium or null",
    "proximity": "temple|river|city center or null"
  },
  "additionalContext": "any other relevant information from the query"
}

Rules:
- If dates not mentioned, set flexible: true and leave dates null
- If location is "near me", "nearby", "here", set useUserLocation: true
- If no guest count mentioned, default to 1 adult
- Extract any mentioned amenities or preferences
- Match property type even if user uses informal terms like "dharamsala", "ashram stay", etc.
- For Indian cities, include both city and state if possible

Return ONLY valid JSON, no additional text.
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        console.log('✅ Gemini parsed query:', parsed);
        return parsed;
      }
      
      throw new Error('Failed to parse Gemini response');
    } catch (error) {
      console.error('❌ Gemini parsing error:', error);
      return this.fallbackParse(voiceInput, userContext);
    }
  }

  fallbackParse(voiceInput, userContext) {
    console.log('⚠️ Using fallback parser');
    const lowerInput = voiceInput.toLowerCase();
    
    let intent = 'search';
    if (lowerInput.includes('available') || lowerInput.includes('vacancy')) {
      intent = 'availability';
    } else if (lowerInput.includes('recommend') || lowerInput.includes('suggest')) {
      intent = 'recommendation';
    }

    const useUserLocation = lowerInput.includes('near me') || 
                           lowerInput.includes('nearby') || 
                           lowerInput.includes('here');

    let propertyType = null;
    if (lowerInput.includes('dharamshala') || lowerInput.includes('dharmshala')) {
      propertyType = 'Dharamshala';
    } else if (lowerInput.includes('ashram')) {
      propertyType = 'Ashram';
    } else if (lowerInput.includes('guest house') || lowerInput.includes('guesthouse')) {
      propertyType = 'Trust Guest House';
    } else if (lowerInput.includes('yatri niwas') || lowerInput.includes('pilgrim lodge')) {
      propertyType = 'Yatri Niwas / Pilgrim Lodge';
    }

    const numberMatch = voiceInput.match(/(\d+)\s*(person|people|guest|adult)/i);
    const adults = numberMatch ? parseInt(numberMatch[1]) : 1;

    return {
      intent,
      location: {
        city: null,
        state: null,
        useUserLocation
      },
      propertyType,
      dates: {
        checkin: null,
        checkout: null,
        flexible: true
      },
      guests: {
        adults,
        children: 0
      },
      preferences: {
        amenities: [],
        priceRange: null,
        proximity: null
      },
      additionalContext: voiceInput
    };
  }

  async generateSearchResponse(properties, searchParams, voiceInput) {
    const prompt = `
User asked: "${voiceInput}"
Search found ${properties.length} properties.

Generate a natural, conversational response (max 2-3 sentences) that:
1. Confirms what was searched for
2. States the number of results found
3. Mentions the top property name if results exist
4. Is friendly and helpful

Top property: ${properties[0]?.placeName || 'N/A'}
Location searched: ${searchParams.location?.city || searchParams.location?.state || 'your area'}

Return only the response text, no JSON or formatting.
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error('❌ Gemini response generation error:', error);
      return properties.length > 0
        ? `Found ${properties.length} properties. ${properties[0].placeName} is available in your search area.`
        : 'Sorry, no properties found matching your criteria. Try adjusting your search.';
    }
  }
}

export default new GeminiService();