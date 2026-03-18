
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GreetingVibe, GreetingRecord } from './types';
import * as gemini from './services/geminiService';

const VIBES = Object.values(GreetingVibe);
const LANGUAGES = [
  'English', 'Spanish', 'French', 'Japanese', 'German', 
  'Hindi', 'Arabic', 'Chinese', 'Portuguese', 'Korean'
];

const App: React.FC = () => {
  const [vibe, setVibe] = useState<GreetingVibe>(GreetingVibe.CYBERPUNK);
  const [language, setLanguage] = useState('English');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentGreeting, setCurrentGreeting] = useState<GreetingRecord | null>(null);
  const [history, setHistory] = useState<GreetingRecord[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);

  const handleGenerate = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    
    try {
      const text = await gemini.generateGreetingText(vibe, language);
      
      // Concurrently start generating image and audio
      const [imageUrl, audioData] = await Promise.all([
        gemini.generateGreetingImage(text, vibe),
        gemini.generateGreetingAudio(text)
      ]);

      const newRecord: GreetingRecord = {
        id: Math.random().toString(36).substr(2, 9),
        text,
        vibe,
        language,
        timestamp: Date.now(),
        imageUrl,
        audioData
      };

      setCurrentGreeting(newRecord);
      setHistory(prev => [newRecord, ...prev].slice(0, 10));
    } catch (error) {
      console.error("Generation failed", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const playAudio = async (base64Data?: string) => {
    if (!base64Data || isPlaying) return;
    
    setIsPlaying(true);
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      
      const ctx = audioContextRef.current;
      const decodedData = gemini.decodeBase64Audio(base64Data);
      const audioBuffer = await gemini.decodeAudioDataToBuffer(decodedData, ctx);
      
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.onended = () => setIsPlaying(false);
      source.start();
    } catch (e) {
      console.error("Audio playback error", e);
      setIsPlaying(false);
    }
  };

  return (
    <div className="min-h-screen pb-20 selection:bg-indigo-500/30">
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-900/20 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-900/20 blur-[120px] rounded-full"></div>
      </div>

      <header className="container mx-auto px-6 py-12 flex flex-col items-center">
        <div className="inline-flex items-center px-3 py-1 mb-4 rounded-full glass text-xs font-medium tracking-widest uppercase text-indigo-400">
          Powered by Gemini 2.5 & 3
        </div>
        <h1 className="text-5xl md:text-7xl font-bold font-display text-center mb-6 tracking-tight">
          Hello <span className="gradient-text">World</span> 2.0
        </h1>
        <p className="text-gray-400 text-lg md:text-xl text-center max-w-2xl leading-relaxed">
          The ultimate expression of the first line of code. Reimagined by artificial intelligence across time, space, and personas.
        </p>
      </header>

      <main className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Controls Column */}
        <section className="lg:col-span-4 space-y-8">
          <div className="glass p-8 rounded-3xl space-y-6">
            <h2 className="text-xl font-semibold mb-4">Customize Your Greeting</h2>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Language</label>
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-gray-900/50 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 transition-all outline-none appearance-none"
              >
                {LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Persona / Vibe</label>
              <div className="grid grid-cols-1 gap-2">
                {VIBES.map(v => (
                  <button
                    key={v}
                    onClick={() => setVibe(v)}
                    className={`text-left px-4 py-3 rounded-xl border transition-all duration-200 ${
                      vibe === v 
                      ? 'bg-indigo-600/20 border-indigo-500/50 text-white' 
                      : 'bg-transparent border-white/5 text-gray-400 hover:border-white/20'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className={`w-full relative overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-bold py-4 rounded-2xl shadow-xl shadow-indigo-500/20 transition-all active:scale-[0.98] group`}
            >
              {isGenerating ? (
                <span className="flex items-center justify-center gap-2">
                  <i className="fa-solid fa-spinner animate-spin"></i>
                  Generating...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <i className="fa-solid fa-wand-magic-sparkles"></i>
                  Awaken the World
                </span>
              )}
              {isGenerating && <div className="absolute inset-0 shimmer"></div>}
            </button>
          </div>

          {/* History Snippet */}
          {history.length > 0 && (
            <div className="glass p-6 rounded-3xl">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-gray-500 mb-4">Past Greetings</h3>
              <div className="space-y-3">
                {history.map(item => (
                  <div 
                    key={item.id} 
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
                    onClick={() => setCurrentGreeting(item)}
                  >
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-600">AI</div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-gray-200 truncate">{item.text}</p>
                      <p className="text-[10px] text-gray-500 uppercase">{item.vibe} • {item.language}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Display Column */}
        <section className="lg:col-span-8">
          {currentGreeting ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="glass rounded-[2rem] overflow-hidden">
                <div className="aspect-video bg-gray-900 relative group overflow-hidden">
                  {currentGreeting.imageUrl ? (
                    <img 
                      src={currentGreeting.imageUrl} 
                      alt="Generated visual" 
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center space-y-4">
                      <i className="fa-regular fa-image text-5xl text-gray-700"></i>
                      <p className="text-gray-600 font-medium">Visualizing greeting...</p>
                    </div>
                  )}
                  
                  {/* Overlay Controls */}
                  <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {currentGreeting.audioData && (
                        <button 
                          onClick={() => playAudio(currentGreeting.audioData)}
                          disabled={isPlaying}
                          className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all disabled:opacity-50"
                        >
                          {isPlaying ? (
                            <i className="fa-solid fa-volume-high animate-pulse"></i>
                          ) : (
                            <i className="fa-solid fa-play ml-1"></i>
                          )}
                        </button>
                      )}
                      <div className="glass px-4 py-2 rounded-xl text-xs backdrop-blur-xl border-white/20">
                        {currentGreeting.language} • {currentGreeting.vibe}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-10 md:p-14 text-center">
                  <blockquote className="relative">
                    <i className="fa-solid fa-quote-left absolute -top-4 -left-6 text-indigo-500/20 text-5xl"></i>
                    <h2 className="text-3xl md:text-5xl font-bold italic leading-tight text-white">
                      "{currentGreeting.text}"
                    </h2>
                  </blockquote>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FeatureCard 
                  icon="fa-language" 
                  title="Universal Translation" 
                  desc="Accurate semantic translations that preserve the tone of the persona."
                />
                <FeatureCard 
                  icon="fa-palette" 
                  title="Generative Art" 
                  desc="Custom imagery synthesized to match the specific vibe of your greeting."
                />
                <FeatureCard 
                  icon="fa-microphone-lines" 
                  title="AI Vocalization" 
                  desc="Native speech synthesis with realistic cadence and emotional weight."
                />
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-white/10 rounded-[3rem]">
              <div className="w-24 h-24 bg-indigo-500/10 rounded-full flex items-center justify-center mb-8">
                <i className="fa-solid fa-earth-americas text-4xl text-indigo-500"></i>
              </div>
              <h3 className="text-3xl font-bold mb-4">Ready to Greet the World?</h3>
              <p className="text-gray-500 max-w-sm">Select a language and a persona on the left to generate your first Hello World 2.0 experience.</p>
            </div>
          )}
        </section>
      </main>

      <footer className="mt-24 py-12 border-t border-white/5 text-center text-gray-600 text-sm">
        <p>&copy; 2024 Hello World 2.0 • Built with Gemini AI & React</p>
      </footer>
    </div>
  );
};

const FeatureCard: React.FC<{ icon: string; title: string; desc: string }> = ({ icon, title, desc }) => (
  <div className="glass p-6 rounded-3xl hover:bg-white/5 transition-colors">
    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-4">
      <i className={`fa-solid ${icon} text-indigo-400`}></i>
    </div>
    <h4 className="font-semibold text-white mb-2">{title}</h4>
    <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
  </div>
);

export default App;
