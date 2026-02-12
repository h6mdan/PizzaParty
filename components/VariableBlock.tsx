
import React from 'react';
import { motion } from 'framer-motion';

interface VariableControlProps {
  label: string;
  type: 'number' | 'string' | 'boolean';
  value: any;
  onChange: (val: any) => void;
  options?: string[];
  icon: string;
}

const VariableControl: React.FC<VariableControlProps> = ({ label, type, value, onChange, options, icon }) => {
  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      className="relative bg-white p-5 rounded-[2.5rem] shadow-[0_10px_0_#e2e8f0] border-2 border-slate-100 mb-4 transition-all"
    >
      <div className="flex justify-between items-center mb-3">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Variable Box</span>
        <code className="text-[10px] bg-indigo-50 px-2 py-1 rounded-full text-indigo-500 font-bold">{label} = ?</code>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <span className="text-4xl filter drop-shadow-md">{icon}</span>
          <span className="text-xl font-black text-slate-700 uppercase tracking-tight">{label.replace('toy_', '').replace('has_', '')}</span>
        </div>
        
        <div className="flex gap-3">
          {type === 'number' && (
            <div className="flex w-full gap-2">
              {[1, 2, 3].map(n => (
                <motion.button
                  key={n}
                  whileTap={{ scale: 0.9, y: 5 }}
                  onClick={() => onChange(n)}
                  className={`flex-1 py-4 rounded-3xl font-black text-2xl transition-all shadow-md ${value === n ? 'bg-indigo-500 text-white shadow-[0_6px_0_#3730a3]' : 'bg-slate-100 text-slate-400 shadow-[0_6px_0_#cbd5e1]'}`}
                >
                  {n === 1 ? '🐥' : n === 2 ? '🦒' : '🐘'}
                </motion.button>
              ))}
            </div>
          )}

          {type === 'string' && options && (
            <div className="grid grid-cols-2 w-full gap-3">
              {options.map(opt => (
                <motion.button
                  key={opt}
                  whileTap={{ scale: 0.9, y: 5 }}
                  onClick={() => onChange(opt)}
                  className={`py-3 rounded-2xl text-[12px] font-black uppercase transition-all shadow-md ${value === opt ? 'bg-pink-500 text-white shadow-[0_6px_0_#9d174d]' : 'bg-slate-100 text-slate-400 shadow-[0_6px_0_#cbd5e1]'}`}
                >
                  {opt}
                </motion.button>
              ))}
            </div>
          )}

          {type === 'boolean' && (
            <motion.button
              whileTap={{ scale: 0.9, y: 5 }}
              onClick={() => onChange(!value)}
              className={`w-full py-5 rounded-3xl font-black text-lg uppercase tracking-widest transition-all shadow-md flex justify-center items-center gap-3 ${value ? 'bg-emerald-400 text-white shadow-[0_6px_0_#065f46]' : 'bg-slate-100 text-slate-300 shadow-[0_6px_0_#cbd5e1]'}`}
            >
              {value ? '🌟 YES!' : '🚫 NO'}
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default VariableControl;
