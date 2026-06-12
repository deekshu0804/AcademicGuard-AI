import { motion } from 'framer-motion';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Cell } from 'recharts';
import RiskBadge from './RiskBadge';
import { Download, Flag, RefreshCw, Microscope } from 'lucide-react';

const ArcGauge = ({ score, color, label }) => {
  const rotation = (score / 100) * 180 - 90;

  return (
    <div className="relative flex flex-col items-center justify-center pt-8">
      <div className="w-40 h-20 overflow-hidden relative">
        <div className="w-40 h-40 rounded-full border-[10px] border-white/10 absolute top-0 left-0" />
        <motion.div 
          initial={{ rotate: -90 }}
          animate={{ rotate: rotation }}
          transition={{ duration: 1.5, type: "spring", bounce: 0.2 }}
          className="w-40 h-40 rounded-full border-[10px] border-transparent absolute top-0 left-0 origin-center"
          style={{ borderTopColor: color, borderRightColor: color, transform: 'rotate(45deg)' }}
        />
      </div>
      <div className="absolute bottom-0 text-center flex flex-col items-center">
        <span className="text-3xl font-black" style={{ color }}>{score}</span>
        <span className="text-[10px] tracking-widest text-[var(--text-muted)] font-mono">{label}</span>
      </div>
    </div>
  );
};

export default function ComparisonResults({ result, onReset }) {
  if (!result) return null;

  const docA = result.document_a;
  const docB = result.document_b;

  // Transform SHAP for side-by-side
  const shapData = docA.shap_contributions.map(aFeature => {
    const bFeature = docB.shap_contributions.find(b => b.feature === aFeature.feature);
    return {
      feature: aFeature.feature,
      docA: aFeature.value,
      docB: bFeature ? bFeature.value : 0
    };
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-6xl mx-auto"
    >
      {/* Header */}
      <div className="bg-[var(--glass)] border border-cyan-500/30 p-6 rounded-2xl flex items-center gap-4 corner-brackets relative overflow-hidden shadow-[0_0_30px_rgba(6,182,212,0.1)]">
        <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center">
          <Microscope className="text-cyan-400" size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white tracking-widest uppercase">Comparative Intelligence Report</h2>
          <p className="text-sm text-cyan-400 font-mono">Divergence Score: {result.divergence_score}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Doc A Summary */}
        <div className="bg-[var(--glass)] border border-red-500/30 rounded-2xl p-6 relative overflow-hidden flex flex-col items-center shadow-[0_0_20px_rgba(239,68,68,0.05)]">
          <div className="absolute top-0 right-0 p-3 bg-red-500/20 rounded-bl-xl text-red-400 font-mono text-xs font-bold flex items-center gap-2">
            🤖 Document A
          </div>
          <ArcGauge score={docA.risk_score} color="#ef4444" label="RISK SCORE" />
          <div className="mt-4 text-center">
            <RiskBadge score={docA.risk_score} size="lg" />
            <p className="text-xs text-[var(--text-muted)] mt-2">Processed in {docA.processing_time}</p>
          </div>
        </div>

        {/* Doc B Summary */}
        <div className="bg-[var(--glass)] border border-cyan-500/30 rounded-2xl p-6 relative overflow-hidden flex flex-col items-center shadow-[0_0_20px_rgba(6,182,212,0.05)]">
          <div className="absolute top-0 right-0 p-3 bg-cyan-500/20 rounded-bl-xl text-cyan-400 font-mono text-xs font-bold flex items-center gap-2">
            ✍️ Document B
          </div>
          <ArcGauge score={docB.risk_score} color="#06b6d4" label="RISK SCORE" />
          <div className="mt-4 text-center">
            <RiskBadge score={docB.risk_score} size="lg" />
            <p className="text-xs text-[var(--text-muted)] mt-2">Processed in {docB.processing_time}</p>
          </div>
        </div>

        {/* Side-by-side SHAP comparison */}
        <div className="bg-[var(--glass)] border border-[var(--glass-border)] rounded-2xl p-6 h-[400px]">
          <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--text-muted)] mb-4">Feature Divergence (SHAP)</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart layout="vertical" data={shapData} margin={{ top: 0, right: 30, left: 60, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" horizontal={true} vertical={false} />
              <XAxis type="number" stroke="var(--text-muted)" tick={{ fill: 'var(--text-muted)' }} axisLine={false} />
              <YAxis dataKey="feature" type="category" width={140} stroke="var(--text-muted)" tick={{ fill: 'var(--text-primary)', fontSize: 10, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
              <RechartsTooltip cursor={{ fill: 'var(--glass)' }} contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--glass-border)', borderRadius: '8px' }} />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="docA" name="Document A (AI)" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={12} />
              <Bar dataKey="docB" name="Document B (Human)" fill="#06b6d4" radius={[0, 4, 4, 0]} barSize={12} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Radar Overlay */}
        <div className="bg-[var(--glass)] border border-[var(--glass-border)] rounded-2xl p-6 h-[400px]">
          <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--text-muted)] mb-4">Multidimensional Style Overlay</h3>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="65%" data={docA.radar_data}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar name="Document A" dataKey="docA" stroke="#ef4444" fill="#ef4444" fillOpacity={0.15} />
              <Radar name="Document B" dataKey="docB" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.15} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Forensic Conclusion */}
        <div className="md:col-span-2 bg-white/[0.03] border border-white/10 rounded-2xl p-6 lg:p-8 corner-brackets">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Microscope className="text-cyan-400" />
            Forensic Conclusion
          </h3>
          <p className="text-[var(--text-primary)] leading-relaxed text-sm md:text-base">
            {result.forensic_conclusion}
          </p>
          
          <div className="mt-8 flex flex-wrap gap-4 pt-6 border-t border-[var(--glass-border)]">
            <button onClick={onReset} className="px-5 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 transition-colors flex items-center gap-2 text-sm font-bold text-white">
              <RefreshCw size={16} /> Analyze Another
            </button>
            <button className="px-5 py-2.5 rounded-xl bg-[var(--glass)] border border-cyan-500/30 hover:bg-cyan-500/10 transition-colors flex items-center gap-2 text-sm font-bold text-cyan-400">
              <Download size={16} /> Download Full Report
            </button>
            <button className="px-5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 transition-colors flex items-center gap-2 text-sm font-bold text-red-400 ml-auto">
              <Flag size={16} /> Flag Doc A
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
