
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const val = payload[0].value;
    const color = val > 0 ? '#ef4444' : '#3b82f6';
    return (
      <div className="bg-[var(--bg-secondary)]/90 backdrop-blur-lg border border-[var(--glass-border)] p-3 rounded-xl shadow-2xl">
        <p className="font-bold text-[var(--text-primary)] mb-1">{payload[0].payload.feature}</p>
        <p className="font-mono" style={{ color }}>
          {val > 0 ? '+' : ''}{val.toFixed(3)} (Contribution)
        </p>
      </div>
    );
  }
  return null;
};

const ShapChart = ({ data }) => {
  if (!data || data.length === 0) return null;



  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="h-[350px] w-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart layout="vertical" data={data} margin={{ top: 0, right: 30, left: 60, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" horizontal={true} vertical={false} />
          <XAxis type="number" stroke="var(--text-muted)" tick={{ fill: 'var(--text-muted)' }} axisLine={false} />
          <YAxis dataKey="feature" type="category" width={180} stroke="var(--text-muted)" tick={{ fill: 'var(--text-primary)', fontSize: 11, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--glass)' }} />
          <Bar dataKey="value" barSize={16} radius={[0, 8, 8, 0]} isAnimationActive={true} animationDuration={1000}>
            {data.map((entry, index) => {
              const isPositive = entry.value > 0;
              const fill = isPositive ? '#ef4444' : '#3b82f6';
              const filter = isPositive ? 'drop-shadow(0 0 6px #ef4444)' : 'drop-shadow(0 0 6px #3b82f6)';
              return <Cell key={`cell-${index}`} fill={fill} style={{ filter }} />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

export default ShapChart;
