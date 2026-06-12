import { motion } from 'framer-motion';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from 'recharts';
import ShapChart from './ShapChart';
import RiskBadge from './RiskBadge';
import { ShieldAlert, Info, Download, RefreshCw, Flag } from 'lucide-react';

const ArcGauge = ({ score }) => {
  const isHighRisk = score > 70;
  const isMedRisk = score > 40 && score <= 70;
  const color = isHighRisk ? '#ef4444' : isMedRisk ? '#f59e0b' : '#10b981';
  const rotation = (score / 100) * 180 - 90;

  return (
    <div className="relative flex flex-col items-center justify-center pt-8">
      <div className="w-48 h-24 overflow-hidden relative">
        <div className="w-48 h-48 rounded-full border-[12px] border-white/10 absolute top-0 left-0" />
        <motion.div 
          initial={{ rotate: -90 }}
          animate={{ rotate: rotation }}
          transition={{ duration: 1.5, type: "spring", bounce: 0.2 }}
          className="w-48 h-48 rounded-full border-[12px] border-transparent absolute top-0 left-0 origin-center"
          style={{ borderTopColor: color, borderRightColor: color, transform: 'rotate(45deg)' }}
        />
      </div>
      <div className="absolute bottom-0 text-center flex flex-col items-center">
        <span className="text-4xl font-black" style={{ color }}>{score}</span>
        <span className="text-xs tracking-widest text-[var(--text-muted)] font-mono">RISK SCORE</span>
      </div>
    </div>
  );
};

export default function AnalysisResults({ result, filename, onReset }) {
  if (!result) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-5xl mx-auto"
    >
      {/* Header */}
      <div className="bg-[var(--glass)] border border-cyan-500/30 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 corner-brackets relative overflow-hidden shadow-[0_0_30px_rgba(6,182,212,0.1)]">
        <div className="absolute right-0 top-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px]" />
        <div>
          <h2 className="text-xl font-bold text-white mb-1">ANALYSIS COMPLETE</h2>
          <div className="flex items-center gap-4 text-sm text-[var(--text-muted)]">
            <span className="font-mono text-cyan-400">{filename}</span>
            <span>•</span>
            <span>Processed in {result.processing_time}</span>
          </div>
        </div>
        <div className="flex items-center gap-6 z-10">
          <div className="text-right">
            <p className="text-xs text-[var(--text-muted)] mb-1 font-mono tracking-widest">THREAT LEVEL</p>
            <RiskBadge score={result.risk_score} size="lg" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Arc Gauge & Findings */}
        <div className="bg-[var(--glass)] border border-[var(--glass-border)] rounded-2xl p-6 flex flex-col items-center justify-center gap-8">
          <ArcGauge score={result.risk_score} />
          <div className="w-full text-sm">
            <p className="text-[var(--text-muted)] mb-3 font-bold uppercase tracking-widest text-xs">Key Findings</p>
            <div className="space-y-2">
              {result.shap_contributions.slice(0, 3).map((s, i) => (
                <div key={i} className="flex justify-between items-center bg-white/5 px-3 py-2 rounded-lg">
                  <span className="text-gray-300">{s.feature}</span>
                  <span className={`font-mono font-bold ${s.value > 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {s.value > 0 ? '▲' : '▼'} {Math.abs(s.value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SHAP Chart */}
        <div className="bg-[var(--glass)] border border-[var(--glass-border)] rounded-2xl p-6 md:col-span-2">
          <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--text-muted)] mb-4">Feature Impact Analysis</h3>
          <ShapChart data={result.shap_contributions} />
        </div>

        {/* Radar Chart */}
        <div className="bg-[var(--glass)] border border-[var(--glass-border)] rounded-2xl p-6 md:col-span-1 h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={result.radar_data}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar name={filename} dataKey={result.radar_data[0]?.value !== undefined ? 'value' : 'docA'} stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.3} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Explanations */}
        <div className="md:col-span-2 space-y-4">
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-5 flex gap-4 text-amber-100">
            <ShieldAlert className="text-amber-500 shrink-0" />
            <div>
              <h4 className="font-bold text-amber-400 mb-1">Intelligence Assessment</h4>
              <p className="text-sm leading-relaxed">{result.nl_explanation}</p>
            </div>
          </div>
          
          <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-5 flex gap-4 text-cyan-100">
            <Info className="text-cyan-400 shrink-0" />
            <div>
              <h4 className="font-bold text-cyan-400 mb-1">Recommended Action</h4>
              <p className="text-sm leading-relaxed">{result.recommended_action}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 border-t border-[var(--glass-border)] pt-6">
        <button onClick={onReset} className="px-5 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 transition-colors flex items-center gap-2 text-sm font-bold text-white">
          <RefreshCw size={16} /> Analyze Another
        </button>
        <button className="px-5 py-2.5 rounded-xl bg-[var(--glass)] border border-cyan-500/30 hover:bg-cyan-500/10 transition-colors flex items-center gap-2 text-sm font-bold text-cyan-400">
          <Download size={16} /> Download Report
        </button>
        {result.risk_score > 70 && (
          <button className="px-5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 transition-colors flex items-center gap-2 text-sm font-bold text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
            <Flag size={16} /> Flag Student
          </button>
        )}
      </div>
    </motion.div>
  );
}
