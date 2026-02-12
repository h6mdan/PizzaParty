
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ToyVariables } from '../types';

interface ToyMachineProps {
  toy: ToyVariables;
  status: 'IDLE' | 'SHIPPING' | 'SUCCESS';
}

const ToyMachine: React.FC<ToyMachineProps> = ({ toy, status }) => {
  const getToyEmoji = () => {
    switch(toy.model) {
      case 'Robot': return '🤖';
      case 'Dino': return '🦖';
      case 'Unicorn': return '🦄';
      case 'Truck': return '🚛';
      default: return '📦';
    }
  };

  const getToyColor = () => {
    switch(toy.color) {
      case 'Blue': return 'drop-shadow(0 0 20px #60a5fa)';
      case 'Pink': return 'drop-shadow(0 0 20px #f472b6)';
      case 'Green': return 'drop-shadow(0 0 20px #4ade80)';
      case 'Gold': return 'drop-shadow(0 0 20px #fbbf24)';
      default: return 'none';
    }
  };

  const colorHex = {
    'Blue': '#3b82f6',
    'Pink': '#ec4899',
    'Green': '#22c55e',
    'Gold': '#f59e0b'
  };

  return (
    <div className="relative w-full h-full bg-[#f8fafc] flex items-center justify-center overflow-hidden rounded-[4rem] border-8 border-white shadow-[inset_0_20px_40px_rgba(0,0,0,0.05)]">
      
      {/* Cartoon Background Elements */}
      <div className="absolute top-10 left-10 flex gap-4 opacity-10">
        <div className="w-12 h-12 bg-indigo-500 rounded-full animate-bounce"></div>
        <div className="w-8 h-8 bg-pink-400 rounded-lg rotate-12 animate-pulse"></div>
      </div>

      {/* The Scanner Beam */}
      <motion.div 
        animate={{ x: [-200, 200] }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 w-2 bg-indigo-500/10 blur-xl z-0"
      />

      {/* The Toy */}
      <motion.div 
        key={`${toy.model}-${toy.color}-${toy.size}-${toy.hasHat}`}
        initial={{ scale: 0, rotate: -20 }}
        animate={{ 
          scale: 1, 
          rotate: 0,
          x: status === 'SHIPPING' ? 1000 : 0,
          opacity: status === 'SHIPPING' ? 0 : 1
        }}
        transition={{ 
          type: "spring", 
          stiffness: 260, 
          damping: 20,
          x: { duration: 0.8, ease: "anticipate" }
        }}
        className="relative z-10 flex flex-col items-center select-none"
      >
        <div 
          className="relative transition-all duration-300"
          style={{ 
            fontSize: `${toy.size * 60 + 50}px`,
            filter: getToyColor(),
            color: colorHex[toy.color as keyof typeof colorHex]
          }}
        >
          {/* Hat Variable */}
          <AnimatePresence>
            {toy.hasHat && (
              <motion.div 
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -50, opacity: 0 }}
                className="text-5xl absolute -top-[0.6em] left-1/2 -translate-x-1/2 z-20"
              >
                🎩
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="filter brightness-110 drop-shadow-2xl">
            {getToyEmoji()}
          </div>
        </div>
      </motion.div>

      {/* Success Effects */}
      <AnimatePresence>
        {status === 'SUCCESS' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <div className="text-8xl flex gap-4">
              {['🎊', '🎈', '🍭', '✨'].map((emoji, i) => (
                <motion.span 
                  key={i}
                  initial={{ y: 500 }}
                  animate={{ y: -500 }}
                  transition={{ delay: i * 0.1, duration: 2 }}
                >
                  {emoji}
                </motion.span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floor with Depth */}
      <div className="absolute bottom-0 w-full h-32 bg-slate-100 rounded-t-[50%] shadow-inner border-t-8 border-white"></div>
    </div>
  );
};

export default ToyMachine;
