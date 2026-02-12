
import React from 'react';
import { motion } from 'framer-motion';

interface DNAControlProps {
  label: string;
  type: 'select' | 'range' | 'toggle';
  value: any;
  onChange: (val: any) => void;
  options?: string[];
  icon: string;
}

const DNAControl: React.FC<DNAControlProps> = ({ label, type, value, onChange, options, icon }) => {
  return (
    <motion.div 
      whileHover={{ x: 5 }}
      className="bg-black/40 border-l-4 border-emerald-500 p-3 rounded-xl mb-2 backdrop-blur-sm shadow-lg"
    >
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center gap-2">
          <span className="text-xl filter drop-shadow-md">{icon}</span>
          <span className="text-[10px] font-black text-emerald-400 uppercase tracking-tight">{label}</span>
        </div>
        <div className="text-[8px] bg-white/10 px-1.5 py-0.5 rounded text-white/40 font-mono">
          variable
        </div>
      </div>

      <div className="mt-1">
        {type === 'select' && options && (
          <div className="grid grid-cols-2 gap-1.5">
            {options.map(opt => (
              <button
                key={opt}
                onClick={() => onChange(opt)}
                className={`py-1.5 rounded-lg text-[10px] font-black uppercase transition-all transform active:scale-95 ${value === opt ? 'bg-emerald-500 text-black shadow-[0_0_12px_rgba(16,185,129,0.4)]' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {type === 'range' && (
          <div className="flex items-center gap-3 px-1">
            <input 
              type="range" min="1" max="5" value={value} 
              onChange={(e) => onChange(parseInt(e.target.value))}
              className="flex-1 accent-emerald-500 h-2 bg-white/10 rounded-full appearance-none cursor-pointer"
            />
            <span className="text-xl font-black text-emerald-400 font-mono drop-shadow-sm">{value}</span>
          </div>
        )}

        {type === 'toggle' && (
          <button
            onClick={() => onChange(!value)}
            className={`w-full py-2 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all transform active:scale-95 ${value ? 'bg-sky-500 text-white shadow-[0_0_12px_rgba(14,165,233,0.4)]' : 'bg-white/5 text-white/20'}`}
          >
            {value ? '✨ FLYING ON!' : '❌ NO WINGS'}
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default DNAControl;
