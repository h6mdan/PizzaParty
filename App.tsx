import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { motion, AnimatePresence } from 'framer-motion';
import { PizzaVariables, PizzaOrder, GameState } from './types';
import PizzaControl from './components/PizzaControls';
import PizzaStage from './components/PizzaStage';

const BASES: ('Pizza' | 'Pie')[] = ['Pizza', 'Pie'];
const SIZES: ('Small' | 'Big' | 'Super')[] = ['Small', 'Big', 'Super'];
const TOPPINGS: string[] = ['Pepperoni', 'Mushroom', 'Olive', 'Pineapple'];
const SAUCES: ('Red' | 'White' | 'Pink' | 'Green')[] = ['Red', 'White', 'Pink', 'Green'];

const TIMER_OPTIONS = [
  { label: '1 Min', seconds: 60 },
  { label: '3 Mins', seconds: 180 },
  { label: '5 Mins', seconds: 300 },
];

interface LeaderboardEntry {
  name: string;
  score: number;
}

// Sound effects function
const playSound = (type: 'goal' | 'hit' | 'star' | 'tick' | 'finish' | 'click') => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    const now = ctx.currentTime;

    if (type === 'star') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    } else if (type === 'goal') {
      osc.type = 'square';
      [440, 554, 659, 880].forEach((freq, i) => {
        osc.frequency.setValueAtTime(freq, now + i * 0.1);
      });
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
      osc.start(now);
      osc.stop(now + 0.5);
    } else if (type === 'hit') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.3);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === 'tick') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(200, now);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === 'finish') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 1);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.linearRampToValueAtTime(0, now + 1);
      osc.start(now);
      osc.stop(now + 1);
    } else if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    }
  } catch (e) {
    console.error("Audio failed", e);
  }
};

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('MENU');
  const [order, setOrder] = useState<PizzaOrder | null>(null);
  const [pizza, setPizza] = useState<PizzaVariables>({ 
    baseType: null,
    size: null, 
    toppings: [], 
    sauce: null, 
    extraCheese: false 
  });
  const [score, setScore] = useState(0);
  const [chefTalk, setChefTalk] = useState("Welcome back! Ready for your shift?");
  const [isMuted, setIsMuted] = useState(false);
  
  const [selectedDuration, setSelectedDuration] = useState(60);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isGameOver, setIsGameOver] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(() => {
    const saved = localStorage.getItem('pizza_leaderboard');
    return saved ? JSON.parse(saved) : [
      { name: "Chef Byte", score: 50 },
      { name: "Cookie Bot", score: 30 },
      { name: "Silly Sauce", score: 20 }
    ];
  });

  const timerRef = useRef<number | null>(null);
  const musicContextRef = useRef<AudioContext | null>(null);
  const musicGainRef = useRef<GainNode | null>(null);

  // Background Music Logic
  const initMusic = useCallback(() => {
    if (musicContextRef.current) return;
    
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const mainGain = ctx.createGain();
    mainGain.gain.setValueAtTime(0.05, ctx.currentTime);
    mainGain.connect(ctx.destination);
    
    musicContextRef.current = ctx;
    musicGainRef.current = mainGain;

    const playNote = (freq: number, time: number, duration: number, volume: number) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, time);
      g.gain.setValueAtTime(0, time);
      g.gain.linearRampToValueAtTime(volume, time + 0.05);
      g.gain.linearRampToValueAtTime(0, time + duration);
      osc.connect(g);
      g.connect(mainGain);
      osc.start(time);
      osc.stop(time + duration);
    };

    const loop = () => {
      const now = ctx.currentTime;
      const step = 0.4;
      const scale = [261.63, 311.13, 349.23, 392.00, 466.16];
      
      for (let i = 0; i < 8; i++) {
        const time = now + i * step;
        const freq = scale[Math.floor(Math.random() * scale.length)];
        playNote(freq, time, step * 0.9, 0.4);
        
        const kick = ctx.createOscillator();
        const kickG = ctx.createGain();
        kick.frequency.setValueAtTime(100, time);
        kick.frequency.exponentialRampToValueAtTime(0.01, time + 0.2);
        kickG.gain.setValueAtTime(0.2, time);
        kickG.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
        kick.connect(kickG);
        kickG.connect(mainGain);
        kick.start(time);
        kick.stop(time + 0.2);
      }
      
      setTimeout(loop, step * 8 * 1000);
    };

    loop();
  }, []);

  useEffect(() => {
    if (musicGainRef.current) {
      musicGainRef.current.gain.setTargetAtTime(isMuted ? 0 : 0.05, musicContextRef.current!.currentTime, 0.1);
    }
  }, [isMuted]);

  const fetchOrder = async () => {
    if (isGameOver) return;
    setGameState('ORDERING');
    setChefTalk("Someone's calling the shop...");
    
    // Check if API Key exists
    if (!process.env.API_KEY) {
      console.error("ERROR: Gemini API Key is missing! Please set 'API_KEY' in your Cloudflare Pages environment variables.");
      setChefTalk("Missing API Key! Please check Cloudflare settings.");
      return;
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const varietySeed = Math.random().toString(36).substring(7);
    const timestamp = Date.now();
    
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Act as a hungry pizza lover with a specific craving.
        Seed: ${varietySeed}-${timestamp}.
        
        RULES:
        1. Mix base types (Pizza or Pie), sizes, and sauces randomly.
        2. Toppings array: 0-4 unique items from: Pepperoni, Mushroom, Olive, Pineapple.
        3. Character name: Creative/Funny.
        4. Message: A single enthusiastic sentence about their craving.

        Return JSON:
        {
          "customer": "Name",
          "message": "Enthusiastic request",
          "requirements": {
            "baseType": "Pizza/Pie",
            "size": "Small/Big/Super",
            "toppings": ["Topping1", "Topping2"],
            "sauce": "Red/White/Pink/Green",
            "extraCheese": boolean
          }
        }`,
        config: {
          temperature: 1,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              customer: { type: Type.STRING },
              message: { type: Type.STRING },
              requirements: {
                type: Type.OBJECT,
                properties: {
                  baseType: { type: Type.STRING },
                  size: { type: Type.STRING },
                  toppings: { type: Type.ARRAY, items: { type: Type.STRING } },
                  sauce: { type: Type.STRING },
                  extraCheese: { type: Type.BOOLEAN }
                },
                required: ["baseType", "size", "toppings", "sauce", "extraCheese"]
              }
            },
            required: ["customer", "message", "requirements"]
          }
        }
      });

      if (!response || !response.text) {
        throw new Error("Empty response from Gemini API");
      }

      const data = JSON.parse(response.text.trim());
      setOrder({
        id: Math.random().toString(),
        customer: data.customer || "Hungry Customer",
        message: data.message || "I'm so hungry!",
        requirements: data.requirements as PizzaVariables
      });
      setGameState('COOKING');
      setChefTalk(`Incoming order! Let's get to work!`);
    } catch (e) {
      console.error("Failed to fetch order:", e);
      setChefTalk("Phone line is fuzzy... retrying soon.");
      if (process.env.API_KEY) {
        setTimeout(fetchOrder, 3000);
      }
    }
  };

  useEffect(() => {
    if (!isGameOver && gameState !== 'MENU' && timeLeft > 0) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleGameOver();
            return 0;
          }
          if (prev <= 10) playSound('tick');
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isGameOver, gameState, timeLeft]);

  const handleGameOver = () => {
    setIsGameOver(true);
    playSound('finish');
    setChefTalk("Closing time!");
    
    const newEntry: LeaderboardEntry = { name: "You (Master Chef)", score: score };
    setLeaderboard(prev => {
      const updated = [...prev, newEntry]
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);
      localStorage.setItem('pizza_leaderboard', JSON.stringify(updated));
      return updated;
    });
  };

  const startGame = () => {
    initMusic();
    playSound('star');
    setTimeLeft(selectedDuration);
    setScore(0);
    setIsGameOver(false);
    setPizza({ baseType: null, size: null, toppings: [], sauce: null, extraCheese: false });
    fetchOrder();
  };

  const goToMenu = () => {
    playSound('click');
    setIsGameOver(false);
    setGameState('MENU');
  };

  const handleServe = () => {
    if (!order || isGameOver) return;

    const sortedSelected = [...pizza.toppings].sort();
    const sortedRequired = [...order.requirements.toppings].sort();
    
    const isMatch = 
      pizza.baseType === order.requirements.baseType &&
      pizza.size === order.requirements.size &&
      JSON.stringify(sortedSelected) === JSON.stringify(sortedRequired) &&
      pizza.sauce === order.requirements.sauce &&
      pizza.extraCheese === order.requirements.extraCheese;

    if (isMatch) {
      playSound('goal');
      setGameState('SERVING');
      setChefTalk("Perfect Order! Bellissimo! +10");
      setTimeout(() => {
        playSound('star');
        setGameState('SUCCESS');
        setScore(s => s + 10);
        setTimeout(fetchOrder, 1500);
      }, 800);
    } else {
      playSound('hit');
      setChefTalk("Mamma Mia! The variables don't match!");
    }
  };

  const toggleTopping = (t: string) => {
    if (isGameOver) return;
    playSound('star');
    setPizza(prev => {
      const toppings = prev.toppings.includes(t)
        ? prev.toppings.filter(item => item !== t)
        : [...prev.toppings, t];
      return { ...prev, toppings };
    });
  };

  const handleVariableChange = (key: keyof PizzaVariables, val: any) => {
    if (isGameOver) return;
    playSound('star');
    setPizza(prev => ({
      ...prev,
      [key]: prev[key] === val ? null : val
    }));
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="h-screen w-full text-slate-900 p-4 md:p-6 font-['Fredoka'] overflow-hidden flex flex-col">
      <button 
        onClick={() => { setIsMuted(!isMuted); playSound('click'); }}
        className="fixed top-8 right-8 z-[200] w-14 h-14 bg-white border-4 border-[#3d251e] rounded-2xl flex items-center justify-center text-2xl shadow-xl hover:scale-110 active:scale-95 transition-all"
      >
        {isMuted ? '🔇' : '🎵'}
      </button>

      <div className="max-w-[1600px] w-full mx-auto h-full min-h-0 relative">
        <AnimatePresence>
          {gameState === 'MENU' && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-[110] flex items-center justify-center p-6"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 50 }} animate={{ scale: 1, y: 0 }}
                className="bg-[#fdf6e3] rounded-[3rem] p-8 max-w-4xl w-full shadow-2xl border-8 border-[#3d251e] relative overflow-hidden flex flex-col lg:flex-row gap-8"
              >
                <div className="checkered absolute inset-x-0 top-0 h-8 border-b-6 border-[#3d251e]"></div>
                
                <div className="flex-1 flex flex-col justify-center items-center lg:items-start pt-4">
                   <motion.div 
                    animate={{ y: [0, -8, 0] }} 
                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                    className="mb-6 flex flex-col items-center lg:items-start"
                   >
                    <img 
  src="/Million-Coders-White-text.svg"
  alt="Million Coders Logo"
  className="w-40 lg:w-56 h-auto drop-shadow-xl"
/>
                     <div id="emoji-fallback" style={{ display: 'none' }} className="text-8xl mb-4">🍕</div>
                   </motion.div>

                   <h1 className="text-6xl font-black text-red-600 uppercase italic leading-[0.9] tracking-tighter mb-4 text-center lg:text-left">
                     Pizza <br/>Party!
                   </h1>
                   <div className="bg-[#3d251e] px-3 py-1.5 rounded-xl text-white font-black text-xs uppercase tracking-widest mb-6">
                     Lesson 4.2: Using Variables
                   </div>
                   
                   <p className="text-base text-red-950/70 font-medium mb-6 text-center lg:text-left leading-tight max-w-sm">
                     Match orders by putting the right <b>Values</b> into your kitchen <b>Variables</b>!
                   </p>

                   <div className="mb-8 w-full max-w-xs">
                     <p className="text-[9px] font-black text-red-900 uppercase tracking-widest mb-2 text-center lg:text-left">Assign Shift Duration:</p>
                     <div className="flex gap-2">
                       {TIMER_OPTIONS.map(opt => (
                         <button
                           key={opt.seconds}
                           onClick={() => { setSelectedDuration(opt.seconds); playSound('click'); }}
                           className={`flex-1 py-2 px-1 rounded-xl font-black text-[10px] uppercase transition-all border-2 ${
                             selectedDuration === opt.seconds 
                             ? 'bg-red-600 text-white border-red-900 shadow-md' 
                             : 'bg-white text-red-900 border-[#3d251e] hover:bg-red-50'
                           }`}
                         >
                           {opt.label}
                         </button>
                       ))}
                     </div>
                   </div>

                   <button 
                    onClick={startGame}
                    className="group relative w-full lg:w-56 py-5 bg-red-600 hover:bg-red-500 text-white rounded-[2rem] font-black text-2xl uppercase italic border-b-[8px] border-red-900 active:border-b-0 active:translate-y-2 transition-all shadow-xl overflow-hidden"
                   >
                      <span className="relative z-10">START SHIFT</span>
                      <motion.div 
                        initial={{ x: '-100%' }}
                        whileHover={{ x: '100%' }}
                        transition={{ duration: 0.6 }}
                        className="absolute inset-0 bg-white/20 skew-x-12"
                      />
                   </button>
                </div>

                <div className="w-full lg:w-72 flex flex-col pt-4">
                  <div className="bg-white/80 rounded-[2.5rem] p-6 border-4 border-[#3d251e] shadow-lg flex-1 flex flex-col">
                    <h2 className="text-xl font-black text-[#3d251e] uppercase tracking-tighter mb-4 flex items-center gap-2">
                      <span>🏆</span> Top Chefs
                    </h2>
                    <div className="space-y-2 flex-1">
                      {leaderboard.map((entry, i) => (
                        <div key={i} className={`flex justify-between items-center p-2.5 rounded-xl ${i === 0 ? 'bg-yellow-100 border-2 border-yellow-400' : 'bg-white border border-slate-200'}`}>
                          <div className="flex items-center gap-2">
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-[10px] ${i === 0 ? 'bg-yellow-400' : 'bg-slate-200'}`}>{i + 1}</span>
                            <span className="font-bold text-slate-800 text-[11px]">{entry.name}</span>
                          </div>
                          <span className="font-black text-red-600 text-[12px]">{entry.score}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isGameOver && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-[120] bg-black/80 backdrop-blur-md flex items-center justify-center p-6 rounded-[3rem]"
            >
              <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-[#fdf6e3] rounded-[3.5rem] p-10 max-w-lg w-full shadow-2xl border-8 border-red-600">
                <div className="text-8xl mb-4 text-center">🍕</div>
                <h2 className="text-5xl font-black text-red-600 uppercase italic text-center mb-8 tracking-tighter">Shift Ended!</h2>
                <div className="space-y-3 mb-8">
                   <div className="bg-emerald-100 border-4 border-emerald-500 rounded-3xl p-6 text-center mb-6">
                      <p className="text-emerald-800 font-black text-sm uppercase tracking-widest mb-1">Your Score</p>
                      <p className="text-6xl font-black text-emerald-600 tracking-tighter">{score} PTS</p>
                   </div>
                </div>
                <div className="flex flex-col gap-3">
                  <button onClick={goToMenu} className="w-full py-5 bg-red-600 hover:bg-red-500 text-white rounded-3xl font-black text-2xl uppercase italic border-b-8 border-red-900 transition-all shadow-xl">New Shift</button>
                  <button onClick={goToMenu} className="w-full py-3 text-slate-500 font-black uppercase text-sm hover:text-red-600 transition-colors">Main Menu</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className={`grid grid-cols-1 lg:grid-cols-12 gap-6 h-full min-h-0 relative ${gameState === 'MENU' ? 'blur-md pointer-events-none' : ''}`}>
          <aside className="lg:col-span-3 flex flex-col min-h-0 order-1">
            <motion.div 
              initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
              className="parchment border-8 border-[#3d251e] p-6 rounded-[3rem] shadow-2xl flex flex-col min-h-0 h-full overflow-hidden relative"
            >
              <div className="checkered h-6 absolute top-0 left-0 right-0 border-b-4 border-[#3d251e]"></div>
              
              <header className="flex items-center justify-between mb-6 mt-6 shrink-0 bg-red-600 p-4 rounded-2xl border-4 border-[#3d251e] shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-2xl shadow-inner border-2 border-red-800">👨‍🍳</div>
                  <div>
                    <h1 className="text-lg font-black text-white leading-none uppercase tracking-tighter">RECIPE BOX</h1>
                  </div>
                </div>
                <div className={`px-3 py-1.5 rounded-xl border-4 flex flex-col items-center shadow-inner ${timeLeft < 10 ? 'bg-yellow-400 border-yellow-600 animate-pulse' : 'bg-white border-red-800'}`}>
                  <span className={`text-[12px] font-black font-mono leading-none ${timeLeft < 10 ? 'text-red-600' : 'text-red-600'}`}>
                    {formatTime(timeLeft)}
                  </span>
                </div>
              </header>

              <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-2 mb-4">
                <PizzaControl label="base_type" type="select" value={pizza.baseType} options={BASES} icon="🥣" onChange={(val) => handleVariableChange('baseType', val)} />
                <PizzaControl label="size_variable" type="select" value={pizza.size} options={SIZES} icon="📏" onChange={(val) => handleVariableChange('size', val)} />
                
                <div className="bg-[#fef3c7] border-4 border-[#3d251e] p-4 rounded-3xl shadow-md">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">🍄</span>
                    <span className="text-[11px] font-black text-red-900 uppercase tracking-tight">toppings_array[]</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {TOPPINGS.map(t => (
                      <button
                        key={t} onClick={() => toggleTopping(t)}
                        className={`py-2.5 rounded-xl text-[10px] font-black uppercase transition-all shadow-md border-2 border-[#3d251e] ${pizza.toppings.includes(t) ? 'bg-red-600 text-white' : 'bg-white text-slate-500'}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <PizzaControl label="sauce_type" type="select" value={pizza.sauce} options={SAUCES} icon="🍅" onChange={(val) => handleVariableChange('sauce', val)} />
                <PizzaControl label="extra_cheese" type="toggle" value={pizza.extraCheese} icon="🧀" onChange={(val) => handleVariableChange('extraCheese', val)} />
              </div>

              <button 
                onClick={handleServe} disabled={gameState !== 'COOKING' || isGameOver}
                className="w-full py-5 rounded-3xl bg-red-600 hover:bg-red-500 text-white font-black text-2xl uppercase italic border-b-8 border-red-900 active:border-b-0 active:translate-y-1 transition-all disabled:opacity-20 shadow-2xl shrink-0"
              >
                SERVE IT! 🍕
              </button>
            </motion.div>
          </aside>

          <main className="lg:col-span-6 flex flex-col gap-6 min-h-0 order-2">
            <div className="flex-1 relative min-h-0 bg-white border-[16px] border-[#3d251e] rounded-[4rem] shadow-2xl overflow-hidden group">
               <div className="absolute top-8 left-8 z-30">
                  <motion.div 
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="bg-white px-6 py-3 rounded-2xl border-4 border-red-600 shadow-2xl flex items-center gap-3"
                  >
                     <span className="text-2xl">⭐</span>
                     <span className="text-3xl font-black text-red-600 font-mono tracking-tighter">{score}</span>
                  </motion.div>
               </div>

               <div className="absolute top-8 right-8 z-30 max-w-[240px]">
                  <AnimatePresence mode="wait">
                    <motion.div 
                      key={chefTalk} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                      className={`px-6 py-4 rounded-3xl border-4 shadow-2xl text-white font-black uppercase text-xs italic text-center leading-tight ${chefTalk.includes('Mamma') || chefTalk.includes('fuzzy') || chefTalk.includes('Missing') ? 'bg-red-600 border-red-900' : 'bg-emerald-600 border-emerald-900'}`}
                    >
                      {chefTalk}
                    </motion.div>
                  </AnimatePresence>
               </div>

               <PizzaStage pizza={pizza} status={gameState === 'SERVING' ? 'SERVING' : gameState === 'SUCCESS' ? 'SUCCESS' : 'IDLE'} />
            </div>

            <div className="bg-[#fef3c7] p-5 rounded-[2.5rem] border-4 border-[#3d251e] flex items-center gap-4 shrink-0 shadow-2xl relative overflow-hidden">
               <div className="checkered w-4 absolute top-0 bottom-0 left-0 border-r-4 border-[#3d251e]"></div>
               <div className="ml-6 flex items-center gap-4">
                  <div className="w-14 h-14 bg-white border-4 border-red-600 rounded-2xl flex items-center justify-center text-4xl shadow-md shrink-0">💡</div>
                  <p className="text-[14px] text-red-950 font-bold leading-tight uppercase tracking-tight">
                    <span className="text-red-600">Variables</span> are like takeout boxes! Put the <span className="underline decoration-red-600 underline-offset-4">Values</span> inside them!
                  </p>
               </div>
            </div>
          </main>

          <aside className="lg:col-span-3 flex flex-col gap-6 min-h-0 order-3">
            <motion.div 
              initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
              className="bg-[#fdf6e3] border-8 border-[#3d251e] p-6 rounded-[3rem] shadow-2xl flex flex-col min-h-0 h-full relative overflow-hidden parchment"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-8 bg-[#3d251e] rounded-b-2xl shadow-lg flex items-center justify-center">
                <div className="w-12 h-1 bg-white/20 rounded-full"></div>
              </div>
              
              <header className="mb-6 mt-6 border-b-4 border-dashed border-[#3d251e]/30 pb-4 shrink-0">
                 <div className="flex items-center gap-3 mb-2">
                   <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-2xl shadow-lg border-2 border-red-800">📋</div>
                   <h2 className="text-xl font-black text-red-900 tracking-tighter uppercase leading-none">THE ORDER</h2>
                 </div>
              </header>

              <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
                {gameState === 'ORDERING' ? (
                  <div className="flex flex-col items-center justify-center h-48 gap-4">
                     <div className="relative">
                        <div className="w-16 h-16 bg-red-100 rounded-full animate-ping opacity-20" />
                        <div className="absolute inset-0 flex items-center justify-center text-4xl">🍕</div>
                     </div>
                     <p className="text-[11px] font-black text-red-800 uppercase tracking-widest text-center">Searching for hungry AI...</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-[10px] font-black uppercase text-red-400 tracking-[0.1em] mb-2">{order?.customer} says:</h3>
                      <p className="text-lg font-black text-red-900 italic leading-snug bg-white/50 p-5 rounded-3xl border-2 border-[#3d251e] shadow-inner relative">
                        {order?.message}
                      </p>
                    </div>

                    <div className="bg-[#fef3c7] border-4 border-[#3d251e] rounded-[2rem] p-5 shadow-lg relative">
                      <div className="flex items-center gap-2 mb-4 border-b-2 border-[#3d251e]/20 pb-2">
                        <span className="text-sm">📝</span>
                        <span className="text-[11px] font-black uppercase text-red-900 tracking-widest underline decoration-wavy decoration-red-400">Target Values</span>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex justify-between items-end bg-white/40 p-3 rounded-2xl border border-red-900/10">
                          <div>
                            <span className="block text-[8px] font-black text-red-400 uppercase leading-none mb-1">base_type</span>
                            <span className="text-base font-black text-red-900 uppercase tracking-tight leading-none">{order?.requirements.baseType}</span>
                          </div>
                          <div className="text-right">
                            <span className="block text-[8px] font-black text-red-400 uppercase leading-none mb-1">size_var</span>
                            <span className="text-base font-black text-red-900 uppercase tracking-tight leading-none">{order?.requirements.size}</span>
                          </div>
                        </div>

                        <div className="bg-white p-4 rounded-2xl border-2 border-[#3d251e] shadow-md">
                          <span className="block text-[8px] font-black text-red-400 uppercase leading-none mb-3">toppings_list[]</span>
                          <div className="flex flex-wrap gap-1.5">
                            {order?.requirements.toppings.length ? order.requirements.toppings.map(t => (
                              <span key={t} className="bg-emerald-600 text-white text-[10px] font-black px-2.5 py-1 rounded-lg uppercase border-b-4 border-emerald-900">
                                {t}
                              </span>
                            )) : <span className="text-[11px] font-bold text-slate-300 italic">[]</span>}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-white/40 p-3 rounded-2xl border border-red-900/10">
                            <span className="block text-[8px] font-black text-red-400 uppercase leading-none mb-1">sauce</span>
                            <span className="text-[12px] font-black text-red-900 uppercase">{order?.requirements.sauce}</span>
                          </div>
                          <div className="bg-white/40 p-3 rounded-2xl border border-red-900/10">
                            <span className="block text-[8px] font-black text-red-400 uppercase leading-none mb-1">cheese_bool</span>
                            <span className={`text-[12px] font-black uppercase ${order?.requirements.extraCheese ? 'text-emerald-600' : 'text-slate-400'}`}>
                              {order?.requirements.extraCheese ? 'True' : 'False'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default App;
