import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Loader2, Circle } from 'lucide-react';

const steps = [
  "Extracting text features...",
  "Running NLP pipeline...",
  "Computing style vectors...",
  "Isolation Forest analysis...",
  "Generating SHAP breakdown...",
  "Compiling intelligence report..."
];

export default function ProcessingAnimation({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // 600ms per step
    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= steps.length) {
          clearInterval(interval);
          if (onComplete) setTimeout(onComplete, 500);
          return prev;
        }
        return prev + 1;
      });
    }, 600);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: [1, 0.8, 1], scale: 1 }}
      transition={{ duration: 0.4 }}
      className="bg-[var(--bg-secondary)] border border-cyan-500/30 rounded-2xl p-8 max-w-lg mx-auto shadow-[0_0_40px_rgba(6,182,212,0.15)] corner-brackets relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-white/10">
        <motion.div 
          className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 shadow-[0_0_10px_rgba(6,182,212,0.8)]"
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: steps.length * 0.6, ease: 'linear' }}
        />
      </div>

      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-full border border-cyan-500/30 bg-cyan-500/10 flex items-center justify-center relative">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }} className="absolute inset-0 border border-cyan-500/30 border-dashed rounded-full" />
          <Loader2 className="text-cyan-400 animate-spin" size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">Neural Analysis Active</h2>
          <p className="text-xs text-cyan-400 font-mono opacity-80">EST. TIME: {(steps.length * 0.6).toFixed(1)}s</p>
        </div>
      </div>

      <div className="space-y-4">
        {steps.map((step, index) => {
          const isCompleted = currentStep > index;
          const isActive = currentStep === index;
          const isPending = currentStep < index;

          return (
            <div key={index} className={`flex items-center gap-3 transition-opacity duration-300 ${isPending ? 'opacity-40' : 'opacity-100'}`}>
              <div className="w-6 flex justify-center">
                {isCompleted ? (
                  <CheckCircle2 size={18} className="text-green-500" />
                ) : isActive ? (
                  <Loader2 size={18} className="text-cyan-500 animate-spin" />
                ) : (
                  <Circle size={18} className="text-slate-600" />
                )}
              </div>
              <span className={`font-mono text-sm ${isActive ? 'text-cyan-400' : isCompleted ? 'text-slate-300' : 'text-slate-500'}`}>
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
