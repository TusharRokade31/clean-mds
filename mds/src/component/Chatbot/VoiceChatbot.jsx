"use client"
import { useEffect, useState, useRef } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { useDispatch, useSelector } from 'react-redux';
import { voiceSearchProperties, fetchPopularVoiceQueries } from '@/redux/features/property/propertySlice';
import { useRouter } from 'next/navigation';
import { Mic, MicOff, X, Send, Trash2, MapPin, Star, Home } from 'lucide-react';

const VoiceChatbot = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [isActive, setIsActive] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [inputMode, setInputMode] = useState('voice'); // 'voice' or 'text'
  const messagesEndRef = useRef(null);
  const textInputRef = useRef(null);

  const { 
    voiceSearchResults,
    voiceSearchResponse, 
    isVoiceSearching,
    popularVoiceQueries 
  } = useSelector((state) => state.property);

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  useEffect(() => {
    dispatch(fetchPopularVoiceQueries());
  }, [dispatch]);

  // Focus text input when switching to text mode
  useEffect(() => {
    if (inputMode === 'text' && textInputRef.current) {
      textInputRef.current.focus();
    }
  }, [inputMode]);

  const getUserLocation = async () => {
    return new Promise((resolve) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            resolve({ 
              city: 'Mumbai', 
              state: 'Maharashtra',
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
          },
          () => resolve({ city: 'India', state: '' })
        );
      } else {
        resolve({ city: 'India', state: '' });
      }
    });
  };

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-IN';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const processVoiceCommand = async (command) => {
    if (!command || command.trim() === '') return;
    
    setIsProcessing(true);
    
    try {
      setChatHistory(prev => [...prev, { 
        type: 'user', 
        text: command,
        timestamp: new Date()
      }]);

      const userLocation = await getUserLocation();
      console.log('User Location:', userLocation);

      const result = await dispatch(voiceSearchProperties({
        voiceInput: command,
        userLocation
      })).unwrap();

      console.log('Voice Search Result:', result);

      setChatHistory(prev => [...prev, { 
        type: 'bot', 
        text: result.data.responseText,
        timestamp: new Date(),
        results: result.data.properties.slice(0, 5),
        totalResults: result.data.totalResults
      }]);
      
      // Only speak if voice mode
      if (inputMode === 'voice') {
        speakText(result.data.responseText);
      }

      // if (result.data.properties.length > 0) {
      //   setTimeout(() => {
      //     router.push(`/search-results?voiceSearch=true&q=${encodeURIComponent(command)}`);
      //   }, 3000);
      // }
    } catch (error) {
      console.error('Voice search error:', error);
      const errorMsg = 'Sorry, I encountered an error while searching. Please try again.';
      setChatHistory(prev => [...prev, { 
        type: 'bot', 
        text: errorMsg,
        timestamp: new Date()
      }]);
      
      if (inputMode === 'voice') {
        speakText(errorMsg);
      }
    } finally {
      setIsProcessing(false);
      resetTranscript();
      setTextInput('');
    }
  };

  useEffect(() => {
    if (!listening && transcript && transcript.length > 0 && !isProcessing && inputMode === 'voice') {
      processVoiceCommand(transcript);
    }
  }, [listening, transcript]);

  const handleSuggestionClick = (suggestion) => {
    resetTranscript();
    setTextInput('');
    processVoiceCommand(suggestion);
  };

  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (textInput.trim()) {
      processVoiceCommand(textInput.trim());
    }
  };

  const handleClearChat = () => {
    setChatHistory([]);
    resetTranscript();
    setTextInput('');
  };

  const toggleInputMode = () => {
    setInputMode(prev => prev === 'voice' ? 'text' : 'voice');
    resetTranscript();
    setTextInput('');
  };

  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="fixed bottom-24 right-5 bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded-xl max-w-sm shadow-lg">
        <p className="text-sm">
          Your browser doesn't support speech recognition. Please use the text input option or try Chrome, Edge, or Safari.
        </p>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 right-0 z-[9999]">
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsActive(!isActive)}
        className="fixed bottom-5 right-5 w-16 h-16 rounded-full bg-linear-to-br from-purple-600 to-purple-800 text-white shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 flex items-center justify-center z-[10000] group"
        aria-label="Toggle voice chatbot"
      >
        {listening ? (
          <Mic className="w-7 h-7 animate-pulse" />
        ) : (
          <Mic className="w-7 h-7" />
        )}
        {listening && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-ping" />
        )}
      </button>

      {/* Chatbot Panel */}
      {isActive && (
        <div className="fixed bottom-24 right-5 w-[420px] max-w-[calc(100vw-40px)] h-[600px] max-h-[calc(100vh-140px)] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slideUp">
          {/* Header */}
          <div className="bg-linear-to-r from-purple-600 to-purple-800 text-white p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mic className="w-6 h-6" />
              <h3 className="text-lg font-semibold">Voice Assistant</h3>
            </div>
            <button
              onClick={() => setIsActive(false)}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              aria-label="Close chatbot"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-5 bg-gray-50 space-y-4">
            {chatHistory.length === 0 && (
              <div className="text-center py-8">
                <h4 className="text-xl font-semibold text-gray-800 mb-2">
                  Hi! I'm your MDS voice assistant.
                </h4>
                <p className="text-gray-600 mb-6">Try saying or typing:</p>
                
                {popularVoiceQueries.length > 0 ? (
                  <div className="space-y-4 text-left">
                    {popularVoiceQueries.map((category, idx) => (
                      <div key={idx} className="bg-white rounded-lg p-4 shadow-sm">
                        <h5 className="font-semibold text-gray-700 mb-3 text-sm">
                          {category.category}
                        </h5>
                        <ul className="space-y-2">
                          {category.queries.map((query, qIdx) => (
                            <li
                              key={qIdx}
                              onClick={() => handleSuggestionClick(query)}
                              className="text-sm text-purple-600 bg-purple-50 hover:bg-purple-600 hover:text-white px-4 py-2 rounded-lg cursor-pointer transition-all duration-200 hover:translate-x-1"
                            >
                              "{query}"
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                ) : (
                  <ul className="space-y-2 text-left">
                    <li className="text-sm text-purple-600 bg-purple-50 px-4 py-2 rounded-lg">
                      "Hotels near me"
                    </li>
                    <li className="text-sm text-purple-600 bg-purple-50 px-4 py-2 rounded-lg">
                      "Dharamshala in Varanasi"
                    </li>
                    <li className="text-sm text-purple-600 bg-purple-50 px-4 py-2 rounded-lg">
                      "Ashram in Rishikesh for 2 persons"
                    </li>
                  </ul>
                )}
              </div>
            )}
            
            {chatHistory.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
              >
                <div className={`max-w-[85%] ${msg.type === 'user' ? 'order-2' : 'order-1'}`}>
                  <div
                    className={`rounded-2xl px-4 py-3 ${
                      msg.type === 'user'
                        ? 'bg-linear-to-br from-purple-600 to-purple-700 text-white rounded-br-sm'
                        : 'bg-white text-gray-800 rounded-bl-sm shadow-md border border-gray-100'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                    
                    {msg.results && msg.results.length > 0 && (
                      <div className="mt-4">
                        <p className="text-xs text-gray-500 mb-3">
                          Showing {msg.results.length} of {msg.totalResults} results
                        </p>
                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300">
                          {msg.results.map((prop) => (
                            <div
                              key={prop._id}
                              onClick={() => router.push(`/property/${prop._id}`)}
                              className="min-w-[180px] bg-white rounded-xl overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-1 border border-gray-200"
                            >
                              <div className="relative h-32">
                                <img
                                  src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${prop.media?.images[0]?.url || '/placeholder.jpg'}`}
                                  alt={prop.placeName}
                                  className="w-full h-full object-cover"
                                  onError={(e) => { e.target.src = '/placeholder.jpg'; }}
                                />
                              </div>
                              <div className="p-3">
                                <h4 className="font-semibold text-sm text-gray-800 truncate mb-1">
                                  {prop.placeName}
                                </h4>
                                <p className="text-xs text-gray-600 flex items-center gap-1 mb-1">
                                  <MapPin className="w-3 h-3" />
                                  {prop.location.city}, {prop.location.state}
                                </p>
                                <p className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded inline-block mb-1">
                                  {prop.propertyType}
                                </p>
                                {prop.placeRating && (
                                  <p className="text-xs text-yellow-600 flex items-center gap-1">
                                    <Star className="w-3 h-3 fill-yellow-400" />
                                    {prop.placeRating}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 mt-1 block px-2">
                    {new Date(msg.timestamp).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            ))}
            
            {(isProcessing || isVoiceSearching) && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-md border border-gray-100">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Controls Area */}
          <div className="p-4 bg-white border-t border-gray-200">
            {/* Input Mode Toggle */}
            <div className="flex gap-2 mb-3">
              <button
                onClick={toggleInputMode}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                  inputMode === 'voice'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Mic className="w-4 h-4 inline mr-2" />
                Voice
              </button>
              <button
                onClick={toggleInputMode}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                  inputMode === 'text'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Send className="w-4 h-4 inline mr-2" />
                Text
              </button>
            </div>

            {/* Transcript Display */}
            {transcript && inputMode === 'voice' && (
              <div className="bg-gray-50 px-4 py-2 rounded-lg mb-3 border border-gray-200">
                <p className="text-sm text-gray-700 italic">"{transcript}"</p>
              </div>
            )}

            {/* Voice Input Controls */}
            {inputMode === 'voice' ? (
              <div className="space-y-2">
                {listening ? (
                  <button
                    onClick={SpeechRecognition.stopListening}
                    disabled={isProcessing}
                    className="w-full py-4 px-6 rounded-xl bg-linear-to-r from-red-500 to-red-600 text-white font-semibold flex items-center justify-center gap-3 hover:from-red-600 hover:to-red-700 transition-all disabled:opacity-70 disabled:cursor-not-allowed relative overflow-hidden"
                  >
                    <MicOff className="w-5 h-5" />
                    <span>Listening...</span>
                    <span className="absolute inset-0 bg-white/20 animate-pulse rounded-xl"></span>
                  </button>
                ) : (
                  <button
                    onClick={SpeechRecognition.startListening}
                    disabled={isProcessing}
                    className="w-full py-4 px-6 rounded-xl bg-linear-to-r from-purple-600 to-purple-700 text-white font-semibold flex items-center justify-center gap-3 hover:from-purple-700 hover:to-purple-800 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    <Mic className="w-5 h-5" />
                    <span>{isProcessing ? 'Processing...' : 'Tap to speak'}</span>
                  </button>
                )}
              </div>
            ) : (
              /* Text Input Controls */
              <form onSubmit={handleTextSubmit} className="flex gap-2">
                <input
                  ref={textInputRef}
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Type your search..."
                  disabled={isProcessing}
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
                />
                <button
                  type="submit"
                  disabled={!textInput.trim() || isProcessing}
                  className="px-5 py-3 rounded-xl bg-linear-to-r from-purple-600 to-purple-700 text-white font-semibold hover:from-purple-700 hover:to-purple-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* Clear Chat Button */}
            {chatHistory.length > 0 && (
              <button
                onClick={handleClearChat}
                className="w-full mt-3 py-2 px-4 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors text-sm font-medium flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Clear Chat
              </button>
            )}
          </div>
        </div>
      )}

      {/* Custom Styles for Animations */}
      <style jsx global>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .scrollbar-thin::-webkit-scrollbar {
          height: 4px;
        }

        .scrollbar-thin::-webkit-scrollbar-track {
          background: #f1f1f1;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 2px;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>
    </div>
  );
};

export default VoiceChatbot;