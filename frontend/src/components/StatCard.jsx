import { motion } from 'framer-motion';

const StatCard = ({ label, value, icon: Icon, color, delay = 0, trend = "+5%", trendUp = true, progress = 70, onClick, clickable }) => {
  return (
    <motion.div
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, type: 'spring' }}
      whileHover={{ scale: 1.02, y: -2, boxShadow: `0 0 20px -5px ${color}` }}
      className={`bg-[var(--glass)] backdrop-blur-xl border border-[var(--glass-border)] rounded-2xl p-6 relative overflow-hidden group transition-shadow duration-300 corner-brackets ${clickable ? 'cursor-pointer hover:ring-2 hover:ring-cyan-500/50 hover:scale-[1.02] transition-all' : ''}`}
    >
      <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
        <Icon size={64} style={{ color }} />
      </div>
      
      <div className="flex justify-between items-start">
        <h3 className="text-[var(--text-muted)] text-xs font-bold uppercase tracking-widest flex items-center gap-2">
          <div className="p-1.5 rounded-full bg-white/5 border border-white/10">
            <Icon size={14} style={{ color }} />
          </div>
          {label}
        </h3>
        
        {/* Sparkline (Inline SVG) */}
        <svg width="40" height="20" viewBox="0 0 40 20" className="opacity-60">
          <path d="M0 15 Q 10 5, 20 10 T 40 2" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>

      <div className="flex items-end gap-3 mt-4">
        <p 
          className="text-5xl font-black drop-shadow-md bg-clip-text text-transparent"
          style={{ backgroundImage: `linear-gradient(to bottom right, #fff, ${color})` }}
        >
          {value}
        </p>
        <span className={`text-xs font-bold mb-2 ${trendUp ? 'text-green-400' : 'text-red-400'}`}>
          {trendUp ? '▲' : '▼'} {trend}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-white/10 h-1 rounded-full mt-5 overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, delay: delay + 0.2 }}
          className="h-full rounded-full"
          style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}` }}
        />
      </div>
    </motion.div>
  );
};

export default StatCard;
