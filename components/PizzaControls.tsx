import React from 'react';
import { motion } from 'framer-motion';

interface PizzaControlProps {
  label: string;
  value: any;
  onChange: (val: any) => void;
  options?: string[];
  type: 'select' | 'toggle';
  icon: string;
}

const PizzaControl: React.FC<PizzaControlProps> = ({ label, value, onChange, options, type, icon }) => {
  return (
    <motion.div 
      whileHover={{ scale: 1.01, x: 2 }}
      className="bg-white border-4 border-[#3d251e] p-4 rounded-3xl shadow-md mb-2 transition-colors hover:bg-red-50"
    >
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl filter drop-shadow-sm">{icon}</span>
          <span className="text-[10px] font-black text-red-900 uppercase tracking-tight">{label}</span>
        </div>
        <div className="text-[7px] bg-red-100 px-2 py-1 rounded-full text-red-600 font-mono font-black uppercase border border-red-200">
          {value === null ? 'null' : 'var'}
        </div>
      </div>

      {type === 'select' && options && (
        <div className="grid grid-cols-2 gap-2">
          {options.map(opt => (
            <button
              key={opt}
              onClick={() => onChange(opt)}
              className={`py-2.5 rounded-xl text-[9px] font-black uppercase transition-all transform active:scale-95 border-2 border-[#3d251e] ${
                value === opt 
                ? 'bg-red-600 text-white shadow-[0_4px_0_#450a0a]' 
                : 'bg-white text-slate-500 hover:bg-slate-50 border-b-4'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}

      {type === 'toggle' && (
        <button
          onClick={() => onChange(!value)}
          className={`w-full py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all transform active:scale-95 border-2 border-[#3d251e] border-b-4 ${
            value 
            ? 'bg-yellow-400 text-yellow-900 shadow-inner' 
            : 'bg-slate-100 text-slate-400'
          }`}
        >
          {value ? 'True (Assign)' : 'False (Empty)'}
        </button>
      )}
    </motion.div>
  );
};

export default PizzaControl;