// routes/voiceSearch.routes.js
import express from 'express';
import voiceSearchController from '../controllers/voiceSearch.controller.js';
// import { protect } from '../middleware/auth.middleware.js'; // Uncomment if you have auth

const router = express.Router();

// Main voice search endpoint
router.post('/search', voiceSearchController.voiceSearch.bind(voiceSearchController));

// Get popular voice queries
router.get('/popular-queries', voiceSearchController.getPopularVoiceQueries.bind(voiceSearchController));

// Get voice search suggestions
router.get('/suggestions', voiceSearchController.getVoiceSearchSuggestions.bind(voiceSearchController));

export default router;