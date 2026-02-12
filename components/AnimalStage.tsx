
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimalDNA } from '../types';

interface BioDomeProps {
  dna: AnimalDNA;
  status: 'IDLE' | 'LAUNCHING' | 'SUCCESS';
}

const BioDome: React.FC<BioDomeProps> = ({ dna, status }) => {
  const getHead = () => {
    switch(dna.head) {
      case 'Cat': return '🐱';
      case 'Dino': return '🦖';
      case 'Panda': return '🐼';
      case 'Alien': return '👽';
      case 'Robot': return '🤖';
    }
  };

  const getBody = () => {
    switch(dna.body) {
      case 'Tiger': return '🐅';
      case 'Chicken': return '🐔';
      case 'Shark': return '🦈';
      case 'Bee': return '🐝';
    }
  };

  const getColorFilter = () => {
    switch(dna.color) {
      case 'Neon': return 'hue-rotate(90deg) saturate(3) brightness(1.2)';
      case 'Ghost': return 'opacity(0.4) brightness(2) blur(1px)';
      case 'Gold': return 'sepia(1) saturate(5) brightness(1.1) hue-rotate(-30deg)';
      case 'Ruby': return 'hue-rotate(300deg) saturate(4) brightness(0.8)';
    }
  };

  return (
    <div className="relative w-full h-full bg-[#0a0f0a] flex items-center justify-center overflow-hidden rounded-[4rem] border-[12px] border-[#1a1f1a] shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]">
      {/* Bio-Dome Glass Effect */}
      <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/5 to-transparent pointer-events-none z-20" />
      <div className="absolute top-0 w-full h-full border-[1px] border-white/5 rounded-full scale-[0.98] pointer-events-none" />

      {/* Lab Grid */}
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(#22c55e 1px, transparent 1px), linear-gradient(90deg, #22c55e 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      {/* The Hybrid Creature */}
      <motion.div 
        key={`${dna.head}-${dna.body}-${dna.color}-${dna.isFlying}`}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ 
          scale: status === 'LAUNCHING' ? 0 : 1, 
          y: dna.isFlying ? [0, -40, 0] : 0,
          opacity: status === 'LAUNCHING' ? 0 : 1
        }}
        transition={{ 
          y: { repeat: Infinity, duration: 2, ease: "easeInOut" },
          scale: { type: "spring", damping: 12 }
        }}
        className="relative z-10 flex flex-col items-center"
        style={{ filter: getColorFilter() }}
      >
        {/* Particle Glow based on Power Level */}
        {Array.from({ length: dna.powerLevel }).map((_, i) => (
          <motion.div 
            key={i}
            animate={{ scale: [1, 2, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ repeat: Infinity, duration: 2, delay: i * 0.4 }}
            className="absolute inset-0 bg-emerald-400 rounded-full blur-3xl opacity-20"
          />
        ))}

        <div className="relative">
          {/* Wings if flying */}
          {dna.isFlying && (
            <div className="absolute inset-0 flex justify-between items-center -mx-20 text-7xl opacity-50 animate-pulse">
              <span>🦋</span>
              <span>🦋</span>
            </div>
          )}

          {/* Combined Body and Head */}
          <div className="flex flex-col items-center">
            <div className="text-[120px] mb-[-60px] relative z-20 drop-shadow-2xl">
              {getHead()}
            </div>
            <div className="text-[160px] relative z-10 drop-shadow-xl">
              {getBody()}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Scanning Line */}
      <motion.div 
        animate={{ top: ['0%', '100%', '0%'] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        className="absolute left-0 w-full h-[2px] bg-emerald-500/40 shadow-[0_0_15px_#22c55e] z-30 pointer-events-none"
      />

      {/* Success Celebration */}
      <AnimatePresence>
        {status === 'SUCCESS' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center z-50 bg-emerald-500/20 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0 }} 
              animate={{ scale: 1 }} 
              className="text-center"
            >
              <h2 className="text-6xl font-black text-white italic tracking-tighter mb-4 shadow-emerald-500 drop-shadow-lg">DNA SYNCED!</h2>
              <div className="text-5xl flex gap-4 justify-center">🧬🦁🦓🦄🐲</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute bottom-10 text-emerald-900/40 font-black tracking-[1em] text-[10px] uppercase">
        Bio-Dome Containment Alpha
      </div>
    </div>
  );
};

export default BioDome;
