
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const TrendChart = ({ data, threshold = 70 }) => {
  if (!data || data.length === 0) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="h-[300px] w-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 20, right: 30, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.5}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" vertical={false} />
          <XAxis dataKey="name" stroke="var(--text-muted)" tick={{ fill: 'var(--text-muted)' }} tickMargin={10} axisLine={false} />
          <YAxis domain={[0, 100]} stroke="var(--text-muted)" tick={{ fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
          <Tooltip 
            contentStyle={{ backgroundColor: 'rgba(13, 17, 23, 0.9)', backdropFilter: 'blur(10px)', borderColor: 'var(--glass-border)', color: 'var(--text-primary)', borderRadius: '12px' }}
            itemStyle={{ color: '#06b6d4', fontWeight: 'bold' }}
          />
          <ReferenceLine y={threshold} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'Critical Threshold', fill: '#ef4444', fontSize: 12, fontWeight: 'bold' }} />
          <Area 
            type="monotone" 
            dataKey="risk" 
            name="Risk Score"
            stroke="#06b6d4" 
            strokeWidth={2} 
            fill="url(#colorRisk)" 
            style={{ filter: 'drop-shadow(0 0 6px rgba(6,182,212,0.8))' }}
            isAnimationActive={true}
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

export default TrendChart;
