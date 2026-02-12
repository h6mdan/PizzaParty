import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PizzaVariables } from '../types';

interface PizzaStageProps {
  pizza: PizzaVariables;
  status: 'IDLE' | 'SERVING' | 'SUCCESS';
}

const Pepperoni = () => (
  <div className="relative w-10 h-10 rounded-full bg-[#b91c1c] border-2 border-[#7f1d1d] shadow-inner overflow-hidden">
    <div className="absolute top-1 left-1 w-6 h-4 bg-white/20 rounded-full blur-[1px]" />
    <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(#450a0a 1px, transparent 1px)', backgroundSize: '4px 4px' }} />
  </div>
);

const Mushroom = () => (
  <div className="relative w-10 h-8 flex flex-col items-center">
    <div className="w-10 h-6 bg-[#e7e5e4] rounded-t-full border-b-2 border-stone-400" />
    <div className="w-4 h-4 bg-[#d6d3d1] rounded-b-lg" />
  </div>
);

const Olive = () => (
  <div className="w-6 h-6 rounded-full bg-[#1c1917] border-2 border-[#0c0a09] flex items-center justify-center shadow-md">
    <div className="w-2 h-2 rounded-full bg-[#292524] shadow-inner" />
  </div>
);

const Pineapple = () => (
  <div className="w-8 h-8 bg-[#facc15] rounded-lg border-2 border-[#ca8a04] shadow-sm flex flex-col items-center justify-center overflow-hidden">
    <div className="w-full h-full opacity-20" style={{ backgroundImage: 'linear-gradient(45deg, #854d0e 1px, transparent 1px)', backgroundSize: '4px 4px' }} />
  </div>
);

const LatticeTop = () => {
  return (
    <div className="absolute inset-4 pointer-events-none z-20 overflow-hidden rounded-full">
      {/* Horizontal Strips */}
      <div className="absolute inset-0 flex flex-col justify-around">
        {[1, 2, 3, 4].map(i => (
          <div key={`h-${i}`} className="h-6 w-full bg-[#fcd34d] border-y-2 border-[#d97706] shadow-sm relative">
             <div className="absolute inset-0 opacity-30 bg-[radial-gradient(#d97706_1px,transparent_1px)] bg-[size:4px_4px]" />
          </div>
        ))}
      </div>
      {/* Vertical Strips */}
      <div className="absolute inset-0 flex flex-row justify-around">
        {[1, 2, 3, 4].map(i => (
          <div key={`v-${i}`} className="w-6 h-full bg-[#fcd34d] border-x-2 border-[#d97706] shadow-md relative">
             <div className="absolute inset-0 opacity-30 bg-[radial-gradient(#d97706_1px,transparent_1px)] bg-[size:4px_4px]" />
          </div>
        ))}
      </div>
    </div>
  );
};

const PizzaStage: React.FC<PizzaStageProps> = ({ pizza, status }) => {
  const sauceColors = {
    Red: { base: '#991b1b', light: '#dc2626' },
    White: { base: '#f1f5f9', light: '#ffffff' },
    Pink: { base: '#db2777', light: '#f472b6' },
    Green: { base: '#166534', light: '#22c55e' },
  };

  const toppingGrid = useMemo(() => {
    const types = ['Pepperoni', 'Mushroom', 'Olive', 'Pineapple'];
    const grid: Record<string, { top: string; left: string; rotate: number; scale: number }[]> = {};
    
    types.forEach((type) => {
      grid[type] = Array.from({ length: 12 }).map(() => {
        const r = Math.sqrt(Math.random()) * 35; 
        const theta = Math.random() * 2 * Math.PI;
        return {
          top: `${50 + r * Math.sin(theta)}%`,
          left: `${50 + r * Math.cos(theta)}%`,
          rotate: Math.random() * 360,
          scale: 0.7 + Math.random() * 0.4
        };
      });
    });
    return grid;
  }, []);

  const renderTopping = (type: string) => {
    switch(type) {
      case 'Pepperoni': return <Pepperoni />;
      case 'Mushroom': return <Mushroom />;
      case 'Olive': return <Olive />;
      case 'Pineapple': return <Pineapple />;
      default: return null;
    }
  };

  const getSizeScale = () => {
    if (pizza.size === null) return 0;
    switch(pizza.size) {
      case 'Small': return 0.7;
      case 'Big': return 1;
      case 'Super': return 1.3;
      default: return 1;
    }
  };

  return (
    <div className="relative w-full h-full bg-[#fffcf0] flex items-center justify-center overflow-hidden">
      {/* Background Counter Grain */}
      <div className="absolute inset-0 opacity-5" style={{ 
        backgroundImage: 'linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000), linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000)',
        backgroundSize: '100px 100px',
        backgroundPosition: '0 0, 50px 50px'
      }} />

      {/* Placeholder */}
      {(!pizza.baseType || !pizza.size) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none gap-4">
           <motion.div 
             animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.6, 0.3] }}
             transition={{ repeat: Infinity, duration: 2 }}
             className="w-72 h-72 rounded-full border-8 border-dashed border-red-200 flex items-center justify-center"
           >
              <div className="flex flex-col items-center">
                <span className="text-6xl mb-4 opacity-40">🍕</span>
                <span className="text-[12px] font-black text-red-300 uppercase tracking-[0.4em]">Ready to Bake</span>
              </div>
           </motion.div>
        </div>
      )}

      <motion.div
        key={`${pizza.size}-${pizza.sauce}-${pizza.baseType}`}
        initial={{ scale: 0, rotate: -15, opacity: 0 }}
        animate={{ 
          scale: status === 'SERVING' ? 0 : getSizeScale(), 
          rotate: 0,
          opacity: status === 'SERVING' ? 0 : (pizza.baseType ? 1 : 0)
        }}
        className="relative z-10 w-80 h-80 flex items-center justify-center"
      >
        {/* PIE CRIMPED EDGE */}
        {pizza.baseType === 'Pie' && (
          <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center">
            {Array.from({ length: 36 }).map((_, i) => (
              <div 
                key={i}
                className="absolute w-14 h-14 bg-[#f59e0b] rounded-full border-b-4 border-[#d97706] shadow-sm"
                style={{ 
                  transform: `rotate(${i * 10}deg) translateY(-160px)`,
                  boxShadow: 'inset 0 -5px 10px rgba(0,0,0,0.1)'
                }}
              />
            ))}
          </div>
        )}

        {/* PIZZA CRUST EDGE */}
        {pizza.baseType === 'Pizza' && (
           <div className="absolute inset-[-12px] rounded-full border-[24px] border-[#ea580c] shadow-2xl z-0" />
        )}

        <div 
          className="w-full h-full relative flex items-center justify-center overflow-hidden transition-all duration-700 bg-[#fef3c7]"
          style={{ 
            borderRadius: '50%',
            boxShadow: 'inset 0 0 60px rgba(0,0,0,0.2), 0 30px 60px rgba(0,0,0,0.4)',
            border: pizza.baseType === 'Pie' ? '10px solid #fcd34d' : '6px solid #f59e0b',
            display: pizza.baseType ? 'flex' : 'none'
          }}
        >
          {/* Dough Texture */}
          <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ 
            backgroundImage: 'radial-gradient(#451a03 2px, transparent 2px)',
            backgroundSize: '25px 25px'
          }} />

          {/* Sauce/Filling Layer */}
          {pizza.sauce && (
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              style={{ 
                backgroundColor: sauceColors[pizza.sauce as keyof typeof sauceColors]?.base || '#b91c1c',
                boxShadow: 'inset 0 0 40px rgba(0,0,0,0.4)'
              }}
              className="w-[94%] h-[94%] rounded-full relative z-10"
            >
               <div className="absolute top-6 left-12 w-24 h-12 bg-white/20 rounded-full blur-lg rotate-[-25deg]" />
            </motion.div>
          )}
          
          {/* LATTICE FOR PIE */}
          {pizza.baseType === 'Pie' && <LatticeTop />}

          {/* TOPPINGS */}
          <div className={`absolute inset-0 ${pizza.baseType === 'Pie' ? 'z-30' : 'z-20'}`}>
            <AnimatePresence>
              {pizza.toppings.map((toppingType) => (
                <div key={toppingType} className="absolute inset-0">
                  {toppingGrid[toppingType].map((pos, i) => (
                    <motion.div 
                      key={`${toppingType}-${i}`} 
                      initial={{ scale: 0, opacity: 0, y: -20 }} 
                      animate={{ scale: pos.scale, opacity: 1, y: 0 }} 
                      exit={{ scale: 0, opacity: 0 }}
                      className="absolute -translate-x-1/2 -translate-y-1/2"
                      style={{ 
                        top: pos.top,
                        left: pos.left,
                        rotate: pos.rotate,
                        filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))'
                      }}
                    >
                      {renderTopping(toppingType)}
                    </motion.div>
                  ))}
                </div>
              ))}
            </AnimatePresence>
          </div>

          {/* EXTRA CHEESE OVERLAY */}
          <AnimatePresence>
            {pizza.extraCheese && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 pointer-events-none flex items-center justify-center z-40"
              >
                <div className="w-full h-full bg-[#fcd34d] mix-blend-overlay blur-xl" />
                <div className="absolute inset-0 opacity-50 bg-[radial-gradient(#ffffff_2px,transparent_2px)] bg-[size:12px:12px]" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <AnimatePresence>
        {status === 'SUCCESS' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.5, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="absolute z-[60] flex flex-col items-center"
          >
            <div className="text-9xl mb-4 drop-shadow-2xl filter brightness-110 animate-bounce">🍕</div>
            <div className="bg-red-600 text-white px-12 py-5 rounded-[3rem] border-4 border-red-900 shadow-2xl flex flex-col items-center">
               <h2 className="text-6xl font-black italic tracking-tighter uppercase leading-none">ORDER UP!</h2>
               <p className="text-yellow-300 font-black mt-2 text-sm tracking-widest">+10 POINTS EARNED</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PizzaStage;