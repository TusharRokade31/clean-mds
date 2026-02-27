"use client"
import { useEffect, useState, useRef } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { useDispatch, useSelector } from 'react-redux';
import { voiceSearchProperties, fetchPopularVoiceQueries } from '@/redux/features/property/propertySlice';
import { usePathname, useRouter } from 'next/navigation';
import { Mic, MicOff, X, Send, Trash2, MapPin, Star } from 'lucide-react';

// Brand tokens
const BLUE = '#1035ac';
const BLUE_DARK = '#0c2689';
const YELLOW = '#fcf6cd';
const YELLOW_DEEP = '#f0d84a';   // deeper gold for icons/borders
const YELLOW_BORDER = '#e8cc30'; // visible border/accent

const VoiceChatbot = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [isActive, setIsActive] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const pathname = usePathname();
  const [textInput, setTextInput] = useState('');
  const [inputMode, setInputMode] = useState('voice');
  const messagesEndRef = useRef(null);
  const textInputRef = useRef(null);

  const {
    isVoiceSearching,
    popularVoiceQueries
  } = useSelector((state) => state.property);

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  useEffect(() => {
    dispatch(fetchPopularVoiceQueries());
  }, [dispatch]);

  useEffect(() => {
    if (inputMode === 'text' && textInputRef.current) {
      textInputRef.current.focus();
    }
  }, [inputMode]);

  const getUserLocation = async () => {
    return new Promise((resolve) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => resolve({
            city: 'Mumbai',
            state: 'Maharashtra',
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }),
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
      setChatHistory(prev => [...prev, { type: 'user', text: command, timestamp: new Date() }]);
      const userLocation = await getUserLocation();
      const result = await dispatch(voiceSearchProperties({ voiceInput: command, userLocation })).unwrap();
      setChatHistory(prev => [...prev, {
        type: 'bot',
        text: result.data.responseText,
        timestamp: new Date(),
        results: result.data.properties.slice(0, 5),
        totalResults: result.data.totalResults
      }]);
      if (inputMode === 'voice') speakText(result.data.responseText);
    } catch {
      const errorMsg = 'Sorry, I encountered an error while searching. Please try again.';
      setChatHistory(prev => [...prev, { type: 'bot', text: errorMsg, timestamp: new Date() }]);
      if (inputMode === 'voice') speakText(errorMsg);
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
    if (textInput.trim()) processVoiceCommand(textInput.trim());
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
      <div className="fixed bottom-24 right-5 px-4 py-3 rounded-xl max-w-sm shadow-lg text-sm"
        style={{ background: YELLOW, border: `1px solid ${YELLOW_BORDER}`, color: BLUE }}>
        Your browser doesn't support speech recognition. Please use the text input option or try Chrome, Edge, or Safari.
      </div>
    );
  }

  if (pathname.startsWith("/admin") || pathname.startsWith("/host")) return null;

  return (
    <div className="fixed bottom-0 right-0 z-[9999]">

      {/* ── Floating Action Button ── */}
      <button
        onClick={() => setIsActive(!isActive)}
        aria-label="Toggle voice chatbot"
        className="fixed bottom-5 right-5 w-16 h-16 rounded-full flex items-center justify-center z-[10000] transition-all duration-300 hover:scale-110"
        style={{
          background: `linear-gradient(145deg, ${BLUE}, ${BLUE_DARK})`,
          boxShadow: `0 0 0 3px ${YELLOW_DEEP}, 0 6px 20px rgba(16,53,172,0.45)`,
        }}
      >
        <Mic
          className={`w-7 h-7 ${listening ? 'animate-pulse' : ''}`}
          style={{ color: YELLOW_DEEP }}
        />
        {listening && (
          <span
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full animate-ping"
            style={{ background: YELLOW_DEEP }}
          />
        )}
        {/* spinning halo */}
        <span
          className="absolute inset-0 rounded-full border-2 animate-spin-slow"
          style={{ borderColor: YELLOW_DEEP, borderTopColor: 'transparent', opacity: 0.7 }}
        />
      </button>

      {/* ── Chatbot Panel ── */}
      {isActive && (
        <div
          className="fixed bottom-24 right-5 w-[420px] max-w-[calc(100vw-40px)] h-[600px] max-h-[calc(100vh-140px)] rounded-2xl flex flex-col overflow-hidden animate-slideUp"
          style={{
            background: '#ffffff',
            border: `1.5px solid ${YELLOW_DEEP}`,
            boxShadow: `0 24px 60px rgba(16,53,172,0.2), 0 0 0 1px ${YELLOW}`,
          }}
        >

          {/* Header */}
          <div
            className="p-5 flex items-center justify-between relative overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${BLUE} 0%, ${BLUE_DARK} 100%)` }}
          >
            {/* soft yellow glow in corner */}
            <div
              className="absolute -top-6 right-6 w-24 h-24 rounded-full blur-2xl opacity-30"
              style={{ background: YELLOW_DEEP }}
            />

            <div className="flex items-center gap-3 z-10">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(252,246,205,0.15)', border: `1.5px solid ${YELLOW_DEEP}` }}
              >
                <Mic className="w-5 h-5" style={{ color: YELLOW_DEEP }} />
              </div>
              <div>
                {/* <h3 className="text-base font-bold tracking-wide text-white">Wish AI</h3> */}
                <p className="text-xs font-medium" style={{ color: YELLOW_DEEP }}>My Divine Stays</p>
              </div>
            </div>

            <button
              onClick={() => setIsActive(false)}
              aria-label="Close chatbot"
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:opacity-80 z-10"
              style={{ background: 'rgba(252,246,205,0.15)', border: `1px solid ${YELLOW_DEEP}` }}
            >
              <X className="w-4 h-4" style={{ color: YELLOW_DEEP }} />
            </button>
          </div>

          {/* Gold divider */}
          <div
            className="h-[2px] w-full flex-shrink-0"
            style={{ background: `linear-gradient(90deg, transparent, ${YELLOW_DEEP}, ${YELLOW_DEEP}, transparent)` }}
          />

          {/* ── Messages ── */}
          <div
            className="flex-1 overflow-y-auto p-4 space-y-4"
            style={{ background: `linear-gradient(180deg, ${YELLOW} 0%, #fff 40%)` }}
          >
            {/* Empty state */}
            {chatHistory.length === 0 && (
              <div className="text-center py-6">
                {/* icon */}
                <div
                  className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center relative"
                  style={{
                    background: `linear-gradient(135deg, ${BLUE}, ${BLUE_DARK})`,
                    boxShadow: `0 0 20px rgba(16,53,172,0.3), 0 0 0 3px ${YELLOW_DEEP}`,
                  }}
                >
                  <Mic className="w-7 h-7" style={{ color: YELLOW_DEEP }} />
                  <div
                    className="absolute inset-0 rounded-full border-2 animate-spin-slow"
                    style={{ borderColor: YELLOW_DEEP, borderTopColor: 'transparent', opacity: 0.6 }}
                  />
                </div>

                <h4 className="text-lg font-bold mb-1" style={{ color: BLUE }}>
                  Hi! I'm your Wish AI
                </h4>
                 <div className="flex items-center justify-center gap-2 my-3">
      <span
        className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide"
        style={{
          background: `linear-gradient(135deg, ${BLUE}, ${BLUE_DARK})`,
          color: YELLOW_DEEP,
          boxShadow: `0 2px 10px rgba(16,53,172,0.25), 0 0 0 2px ${YELLOW_BORDER}`,
        }}
      >
        ✨ Make a Wish
      </span>
    </div>
                <p className="text-sm text-gray-500 mb-5">Try saying or typing:</p>

                {popularVoiceQueries.length > 0 ? (
                  <div className="space-y-3 text-left">
                    {popularVoiceQueries.map((category, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl p-3"
                        style={{
                          background: '#fff',
                          border: `1px solid ${YELLOW_DEEP}`,
                          boxShadow: `0 2px 8px rgba(16,53,172,0.06)`,
                        }}
                      >
                        <h5
                          className="font-bold text-xs uppercase tracking-wider mb-2"
                          style={{ color: BLUE }}
                        >
                          {category.category}
                        </h5>
                        <ul className="space-y-1.5">
                          {category.queries.map((query, qIdx) => (
                            <li
                              key={qIdx}
                              onClick={() => handleSuggestionClick(query)}
                              className="text-sm px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 hover:translate-x-1"
                              style={{
                                color: BLUE,
                                background: YELLOW,
                                border: `1px solid ${YELLOW_BORDER}`,
                              }}
                              onMouseEnter={e => {
                                e.currentTarget.style.background = BLUE;
                                e.currentTarget.style.color = YELLOW_DEEP;
                                e.currentTarget.style.borderColor = BLUE_DARK;
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.background = YELLOW;
                                e.currentTarget.style.color = BLUE;
                                e.currentTarget.style.borderColor = YELLOW_BORDER;
                              }}
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
                    {["Hotels near me", "Dharamshala in Varanasi", "Ashram in Rishikesh for 2 persons"].map((q, i) => (
                      <li
                        key={i}
                        onClick={() => handleSuggestionClick(q)}
                        className="text-sm px-4 py-2 rounded-lg cursor-pointer transition-all duration-200 hover:translate-x-1"
                        style={{ color: BLUE, background: YELLOW, border: `1px solid ${YELLOW_BORDER}` }}
                      >
                        "{q}"
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Chat messages */}
            {chatHistory.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
              >
                <div className={`max-w-[85%] ${msg.type === 'user' ? 'order-2' : 'order-1'}`}>
                  <div
                    className="rounded-2xl px-4 py-3"
                    style={msg.type === 'user'
                      ? {
                          background: `linear-gradient(135deg, ${BLUE}, ${BLUE_DARK})`,
                          color: YELLOW,
                          borderBottomRightRadius: '4px',
                          borderLeft: `3px solid ${YELLOW_DEEP}`,
                        }
                      : {
                          background: '#ffffff',
                          color: BLUE,
                          borderBottomLeftRadius: '4px',
                          border: `1px solid ${YELLOW_DEEP}`,
                          boxShadow: `0 2px 12px rgba(16,53,172,0.08)`,
                        }
                    }
                  >
                    <p className="text-sm leading-relaxed">{msg.text}</p>

                    {/* Property cards */}
                    {msg.results && msg.results.length > 0 && (
                      <div className="mt-4">
                        <p className="text-xs mb-2 opacity-60">
                          Showing {msg.results.length} of {msg.totalResults} results
                        </p>
                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                          {msg.results.map((prop) => (
                            <div
                              key={prop._id}
                              onClick={() => router.push(`/hotel-details/${prop.slug}`)}
                              className="min-w-[170px] rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-1"
                              style={{
                                background: '#fff',
                                border: `1px solid ${YELLOW_DEEP}`,
                                boxShadow: `0 2px 10px rgba(16,53,172,0.1)`,
                              }}
                            >
                              <div className="relative h-28">
                                <img
                                  src={prop.media?.images[0]?.url || '/placeholder.jpg'}
                                  alt={prop.placeName}
                                  className="w-full h-full object-cover"
                                  onError={(e) => { e.target.src = '/placeholder.jpg'; }}
                                />
                                {/* yellow accent strip */}
                                <div
                                  className="absolute bottom-0 left-0 right-0 h-[3px]"
                                  style={{ background: `linear-gradient(90deg, ${BLUE}, ${YELLOW_DEEP}, ${BLUE})` }}
                                />
                              </div>
                              <div className="p-2.5">
                                <h4 className="font-bold text-xs truncate mb-1" style={{ color: BLUE }}>
                                  {prop.placeName}
                                </h4>
                                <p className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                                  <MapPin className="w-3 h-3" />
                                  {prop.location.city}, {prop.location.state}
                                </p>
                                <span
                                  className="text-xs px-2 py-0.5 rounded-full inline-block mb-1"
                                  style={{ background: YELLOW, color: BLUE, border: `1px solid ${YELLOW_BORDER}` }}
                                >
                                  {prop.propertyType}
                                </span>
                                {prop.placeRating && (
                                  <p className="text-xs flex items-center gap-1" style={{ color: YELLOW_DEEP }}>
                                    <Star className="w-3 h-3 fill-current" />
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
                  <span className="text-xs text-gray-400 mt-1 block px-2">
                    {new Date(msg.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {(isProcessing || isVoiceSearching) && (
              <div className="flex justify-start">
                <div
                  className="rounded-2xl rounded-bl-sm px-5 py-3"
                  style={{
                    background: '#fff',
                    border: `1px solid ${YELLOW_DEEP}`,
                    boxShadow: `0 2px 12px rgba(16,53,172,0.08)`,
                  }}
                >
                  <div className="flex gap-1.5 items-center">
                    <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: YELLOW_DEEP, animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: BLUE, animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: YELLOW_DEEP, animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ── Controls ── */}
          <div
            className="p-4 bg-white flex-shrink-0"
            style={{ borderTop: `1.5px solid ${YELLOW_DEEP}` }}
          >
            {/* Mode toggle */}
            <div
              className="flex gap-1.5 mb-3 p-1 rounded-xl"
              style={{ background: YELLOW, border: `1px solid ${YELLOW_BORDER}` }}
            >
              {['voice', 'text'].map((mode) => (
                <button
                  key={mode}
                  onClick={toggleInputMode}
                  className="flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2"
                  style={inputMode === mode
                    ? {
                        background: `linear-gradient(135deg, ${BLUE}, ${BLUE_DARK})`,
                        color: YELLOW_DEEP,
                        boxShadow: `0 2px 8px rgba(16,53,172,0.35)`,
                      }
                    : { color: BLUE, background: 'transparent' }
                  }
                >
                  {mode === 'voice'
                    ? <><Mic className="w-4 h-4" />Voice</>
                    : <><Send className="w-4 h-4" />Text</>
                  }
                </button>
              ))}
            </div>

            {/* Live transcript */}
            {transcript && inputMode === 'voice' && (
              <div
                className="px-4 py-2 rounded-lg mb-3"
                style={{ background: YELLOW, border: `1px solid ${YELLOW_BORDER}` }}
              >
                <p className="text-sm italic" style={{ color: BLUE }}>"{transcript}"</p>
              </div>
            )}

            {/* Voice / Text input */}
            {inputMode === 'voice' ? (
              listening ? (
                <button
                  onClick={SpeechRecognition.stopListening}
                  disabled={isProcessing}
                  className="w-full py-4 px-6 rounded-xl font-bold flex items-center justify-center gap-3 transition-all disabled:opacity-70 disabled:cursor-not-allowed relative overflow-hidden"
                  style={{ background: 'linear-gradient(135deg,#c0392b,#e74c3c)', color: '#fff' }}
                >
                  <MicOff className="w-5 h-5" />
                  Listening… Tap to stop
                  <span className="absolute inset-0 animate-pulse rounded-xl" style={{ background: 'rgba(255,255,255,0.1)' }} />
                </button>
              ) : (
                <button
                  onClick={SpeechRecognition.startListening}
                  disabled={isProcessing}
                  className="w-full py-4 px-6 rounded-xl font-bold flex items-center justify-center gap-3 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                  style={{
                    background: `linear-gradient(135deg, ${BLUE}, ${BLUE_DARK})`,
                    color: YELLOW_DEEP,
                    boxShadow: `0 4px 16px rgba(16,53,172,0.35), 0 0 0 2px ${YELLOW_BORDER}`,
                  }}
                >
                  <Mic className="w-5 h-5" />
                  {isProcessing ? 'Processing…' : 'Tap to speak'}
                </button>
              )
            ) : (
              <form onSubmit={handleTextSubmit} className="flex gap-2">
                <input
                  ref={textInputRef}
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Type your search…"
                  disabled={isProcessing}
                  className="flex-1 px-4 py-3 rounded-xl text-sm outline-none disabled:cursor-not-allowed transition-all"
                  style={{
                    border: `1.5px solid ${YELLOW_BORDER}`,
                    background: YELLOW,
                    color: BLUE,
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = BLUE;
                    e.target.style.boxShadow = `0 0 0 3px rgba(16,53,172,0.12)`;
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = YELLOW_BORDER;
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="submit"
                  disabled={!textInput.trim() || isProcessing}
                  className="px-4 py-3 rounded-xl font-bold flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: `linear-gradient(135deg, ${BLUE}, ${BLUE_DARK})`,
                    color: YELLOW_DEEP,
                    boxShadow: `0 2px 8px rgba(16,53,172,0.3)`,
                  }}
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* Clear chat */}
            {chatHistory.length > 0 && (
              <button
                onClick={handleClearChat}
                className="w-full mt-3 py-2 px-4 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all hover:opacity-80"
                style={{
                  border: `1px solid ${YELLOW_BORDER}`,
                  color: BLUE,
                  background: YELLOW,
                }}
              >
                <Trash2 className="w-4 h-4" />
                Clear Chat
              </button>
            )}
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .animate-slideUp   { animation: slideUp  0.3s ease-out; }
        .animate-fadeIn    { animation: fadeIn   0.3s ease-out; }
        .animate-spin-slow { animation: spin-slow 3s linear infinite; }

        .scrollbar-thin::-webkit-scrollbar        { height: 4px; }
        .scrollbar-thin::-webkit-scrollbar-track  { background: #fcf6cd; }
        .scrollbar-thin::-webkit-scrollbar-thumb  { background: #1035ac; border-radius: 2px; }
      `}</style>
    </div>
  );
};

export default VoiceChatbot;