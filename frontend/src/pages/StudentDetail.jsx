import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, useMotionValue, useSpring, useTransform, animate, AnimatePresence } from 'framer-motion';
import { ArrowLeft, AlertTriangle, ArrowRight, Flag, Download, GitCompare, Settings, CheckCircle2, Loader2, X } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { fetchStudentDetail } from '../api/client';
import RiskBadge from '../components/RiskBadge';
import ShapChart from '../components/ShapChart';
import TrendChart from '../components/TrendChart';
import ComparisonResults from '../components/ComparisonResults';
import { MOCK_COMPARISON } from '../utils/mockData';

const BackgroundBlobs = () => (
  <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
    <div className="scanlines z-10" />
    <motion.div animate={{ x: [0, 30, 0], y: [0, -20, 0] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }} className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[var(--accent-blue)] rounded-full blur-[120px] opacity-10" />
  </div>
);

const AnimatedGauge = ({ value }) => {
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { stiffness: 40, damping: 20 });
  const pathLength = useTransform(springValue, [0, 100], [0, 1]);
  const [displayValue, setDisplayValue] = useState(0);
  
  const color = value > 70 ? 'var(--risk-high)' : value >= 31 ? 'var(--risk-med)' : 'var(--risk-low)';
  const dropShadow = `drop-shadow(0 0 8px ${color})`;

  useEffect(() => {
    motionValue.set(value);
    const controls = animate(0, value, {
      duration: 1.5,
      onUpdate: (v) => setDisplayValue(v)
    });
    return controls.stop;
  }, [value, motionValue]);

  return (
    <div className="relative w-40 h-40 flex items-center justify-center">
      <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" stroke="var(--glass-border)" strokeWidth="6" fill="none" />
        <motion.circle cx="50" cy="50" r="45" stroke={color} strokeWidth="6" fill="none" strokeLinecap="round" style={{ pathLength, filter: dropShadow }} />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-4xl font-black font-mono" style={{ color }}>{displayValue.toFixed(1)}</span>
        <span className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-bold mt-1">Risk Index</span>
      </div>
    </div>
  );
};

import { GlassSkeleton } from '../components/GlassSkeleton';
export default function StudentDetail() {
  const { student_id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({ queryKey: ['student', student_id], queryFn: () => fetchStudentDetail(student_id), staleTime: 30000 });

  const [isFlagged, setIsFlagged] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  const handleFlag = () => setIsFlagged(!isFlagged);

  const handleExport = () => {
    if (isExporting || exportComplete) return;
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      setExportComplete(true);
      setTimeout(() => setExportComplete(false), 3000);
    }, 2000);
  };

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } } };

  if (isLoading) return <GlassSkeleton />;

  if (isError || !data) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-8 relative" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="scanlines" />
        <div className="bg-[var(--glass)] border border-[var(--risk-high)]/50 backdrop-blur-xl p-8 rounded-2xl max-w-md text-center corner-brackets">
          <AlertTriangle className="w-16 h-16 text-[var(--risk-high)] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[var(--risk-high)] mb-4">Neural Link Offline</h2>
          <button onClick={() => navigate(-1)} className="bg-white/10 hover:bg-white/20 px-6 py-2 rounded-xl text-[var(--text-primary)] font-bold transition-all">Abort</button>
        </div>
      </div>
    );
  }

  const latestSub = data.submissions[data.submissions.length - 1];
  const riskScore = latestSub.risk_score;
  const isHighRisk = riskScore > 70;
  const nlExplanation = data.latest_natural_language_reason || data.nl_explanation;
  const recommendedAction = riskScore > 70 ? "Initiate Formal Review" : riskScore >= 50 ? "Request Draft History" : "Continue Normal Monitoring";
  
  let shapData = [];
  if (data.latest_shap_breakdown) {
    shapData = Object.entries(data.latest_shap_breakdown)
      .map(([feature, value]) => ({ feature: feature.replace(/_/g, ' ').toUpperCase(), value: Number(value), abs: Math.abs(Number(value)) }))
      .sort((a, b) => b.abs - a.abs)
      .slice(0, 8);
  }

  const sparklineData = data.submissions.map(sub => ({ name: sub.assignment_id, risk: sub.risk_score }));

  const radarData = [
    { subject: 'Style', A: 120, fullMark: 150 },
    { subject: 'Timing', A: 98, fullMark: 150 },
    { subject: 'Vocab', A: 86, fullMark: 150 },
    { subject: 'Syntax', A: 99, fullMark: 150 },
    { subject: 'History', A: 85, fullMark: 150 },
    { subject: 'Meta', A: 65, fullMark: 150 },
  ];

  return (
    <div className="min-h-screen w-full font-sans text-[var(--text-primary)] p-4 md:p-8 relative overflow-hidden" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <BackgroundBlobs />
      {isHighRisk && <div className="fixed top-[20%] right-[-10%] w-[400px] h-[400px] bg-[var(--risk-high)] rounded-full blur-[150px] opacity-5 pointer-events-none" />}

      <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-7xl mx-auto space-y-6 relative z-10">
        
        {/* Navigation & Hero */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
          <div>
            <button onClick={() => navigate(-1)} className="group flex items-center text-[var(--text-muted)] hover:text-white transition-colors text-sm font-bold uppercase tracking-wider mb-6">
              <motion.span whileHover={{ x: -3 }} className="mr-2"><ArrowLeft className="w-4 h-4" /></motion.span> Back to Command
            </button>
            <div className="flex items-center gap-4 mb-2">
              <h1 className="text-4xl md:text-5xl font-black text-white">{data.name || 'Unknown Target'}</h1>
              {isHighRisk && <div className="animate-pulse w-3 h-3 bg-[var(--risk-high)] rounded-full shadow-[0_0_10px_var(--risk-high)]" />}
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <span className="font-mono text-[var(--text-muted)] tracking-widest text-lg bg-white/5 px-3 py-1 rounded-md border border-white/10">{data.student_id || student_id}</span>
              <RiskBadge score={riskScore} confidence={data.confidence || 'HIGH'} />
            </div>
          </div>
          
          <div className="bg-[var(--glass)] border border-[var(--glass-border)] backdrop-blur-xl p-6 rounded-2xl flex flex-col items-center corner-brackets shadow-[0_0_20px_rgba(0,0,0,0.3)]">
            <AnimatedGauge value={riskScore} />
          </div>
        </motion.div>

        {/* NLP & Action Callouts */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[var(--glass)] backdrop-blur-xl p-6 rounded-2xl border border-[var(--glass-border)] border-l-[4px] border-l-[var(--accent-amber)] corner-brackets shadow-[0_0_20px_rgba(245,158,11,0.05)]">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-[var(--accent-amber)]/10 rounded-xl text-[var(--accent-amber)] border border-[var(--accent-amber)]/20">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-widest mb-2 font-mono">Behavioral Analysis</h3>
                <p className="text-[var(--text-muted)] leading-relaxed text-sm">{nlExplanation}</p>
              </div>
            </div>
          </div>

          <div className="bg-[var(--glass)] backdrop-blur-xl p-6 rounded-2xl border border-[var(--glass-border)] border-l-[4px] border-l-[var(--accent-teal)] corner-brackets shadow-[0_0_20px_rgba(6,182,212,0.05)]">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-[var(--accent-teal)]/10 rounded-xl text-[var(--accent-teal)] border border-[var(--accent-teal)]/20">
                <ArrowRight size={24} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-widest mb-2 font-mono">Recommended Action</h3>
                <p className="text-xl font-black text-[var(--accent-teal)] tracking-wide">{recommendedAction}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Visualizations Grid */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="bg-[var(--glass)] backdrop-blur-xl p-6 rounded-2xl border border-[var(--glass-border)] corner-brackets lg:col-span-1">
            <h2 className="text-sm font-bold text-[var(--text-primary)] font-mono uppercase tracking-widest mb-6 border-b border-[var(--glass-border)] pb-2">Behavioral Fingerprint</h2>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke="var(--glass-border)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'monospace' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                  <Radar name="Student" dataKey="A" stroke="var(--accent-teal)" fill="var(--accent-teal)" fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-[var(--glass)] backdrop-blur-xl p-6 rounded-2xl border border-[var(--glass-border)] corner-brackets lg:col-span-2">
            <h2 className="text-sm font-bold text-[var(--text-primary)] font-mono uppercase tracking-widest mb-6 border-b border-[var(--glass-border)] pb-2">SHAP Vector Breakdown</h2>
            <ShapChart data={shapData} />
          </div>

          <div className="bg-[var(--glass)] backdrop-blur-xl p-6 rounded-2xl border border-[var(--glass-border)] corner-brackets lg:col-span-2">
            <h2 className="text-sm font-bold text-[var(--text-primary)] font-mono uppercase tracking-widest mb-6 border-b border-[var(--glass-border)] pb-2">Historical Trajectory</h2>
            <TrendChart data={sparklineData} threshold={70} />
          </div>

          <div className="bg-[var(--glass)] backdrop-blur-xl p-6 rounded-2xl border border-[var(--glass-border)] corner-brackets lg:col-span-1 flex flex-col">
            <h2 className="text-sm font-bold text-[var(--text-primary)] font-mono uppercase tracking-widest mb-6 border-b border-[var(--glass-border)] pb-2">Submission Timeline</h2>
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              {data.submissions.map((sub, i) => (
                <div key={i} className="flex gap-4 relative">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full ${sub.risk_score > 70 ? 'bg-[var(--risk-high)] shadow-[0_0_8px_var(--risk-high)]' : sub.risk_score >= 50 ? 'bg-[var(--risk-med)]' : 'bg-[var(--risk-low)]'}`} />
                    {i !== data.submissions.length - 1 && <div className="w-0.5 h-full bg-[var(--glass-border)] mt-1" />}
                  </div>
                  <div className="pb-4">
                    <p className="text-xs font-bold text-white">{sub.assignment_id}</p>
                    <p className="text-[10px] text-[var(--text-muted)] font-mono mt-0.5">Risk: {sub.risk_score.toFixed(1)}</p>
                  </div>
                </div>
              )).reverse()}
            </div>
          </div>

        </motion.div>

        {/* Action Buttons Row */}
        <motion.div variants={itemVariants} className="flex flex-col gap-4 pt-4 pb-8">
          <div className="flex flex-wrap gap-4">
            <motion.button 
              onClick={handleFlag} 
              whileHover={{ scale: 1.02 }} 
              whileTap={{ scale: 0.98 }} 
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-lg border ${
                isFlagged 
                  ? 'bg-[var(--risk-high)]/20 border-[var(--risk-high)] text-[var(--risk-high)] shadow-[0_0_15px_rgba(239,68,68,0.2)]' 
                  : 'bg-[var(--glass)] border-[var(--glass-border)] text-[var(--text-primary)] hover:border-[var(--risk-high)] hover:bg-[var(--risk-high)]/10'
              }`}
            >
              <Flag size={18} className={isFlagged ? "fill-current" : "text-[var(--risk-high)]"} /> 
              {isFlagged ? 'Review Flagged' : 'Flag for Review'}
            </motion.button>

            <motion.button 
              onClick={handleExport} 
              whileHover={{ scale: 1.02 }} 
              whileTap={{ scale: 0.98 }} 
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-lg border ${
                exportComplete 
                  ? 'bg-green-500/20 border-green-500 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.2)]' 
                  : isExporting
                  ? 'bg-[var(--accent-teal)]/10 border-[var(--accent-teal)] text-[var(--accent-teal)] opacity-80'
                  : 'bg-[var(--glass)] border-[var(--glass-border)] text-[var(--text-primary)] hover:border-[var(--accent-teal)] hover:bg-[var(--accent-teal)]/10'
              }`}
            >
              {exportComplete ? <CheckCircle2 size={18} /> : isExporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} className="text-[var(--accent-teal)]" />}
              {exportComplete ? 'Dossier Exported' : isExporting ? 'Compiling...' : 'Export Dossier'}
            </motion.button>

            <motion.button 
              onClick={() => setShowComparison(!showComparison)} 
              whileHover={{ scale: 1.02 }} 
              whileTap={{ scale: 0.98 }} 
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-lg border ${
                showComparison 
                  ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]' 
                  : 'bg-[var(--glass)] hover:bg-white/10 text-[var(--text-primary)] border-[var(--glass-border)]'
              }`}
            >
              <GitCompare size={18} /> Compare History
            </motion.button>

            <motion.button 
              onClick={() => setShowSettings(!showSettings)} 
              whileHover={{ scale: 1.02 }} 
              whileTap={{ scale: 0.98 }} 
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-lg border ${
                showSettings 
                  ? 'bg-white/10 border-white/20 text-white' 
                  : 'bg-[var(--glass)] border-[var(--glass-border)] text-[var(--text-primary)] hover:bg-white/10'
              }`}
            >
              <Settings size={18} /> Adjust Thresholds
            </motion.button>
          </div>

          <AnimatePresence>
            {showSettings && (
              <motion.div 
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-[var(--glass)] border border-[var(--glass-border)] rounded-2xl p-6 relative corner-brackets">
                  <button onClick={() => setShowSettings(false)} className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-white transition-colors">
                    <X size={20} />
                  </button>
                  <h3 className="text-sm font-bold tracking-widest uppercase mb-4 flex items-center gap-2">
                    <Settings size={16} className="text-cyan-400" /> Live Detection Parameters
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-[var(--text-muted)]">Stylometry Variance</span>
                        <span className="text-cyan-400">0.85</span>
                      </div>
                      <input type="range" min="0" max="100" defaultValue="85" className="w-full accent-cyan-500 bg-white/10 h-1.5 rounded-full appearance-none cursor-pointer" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-[var(--text-muted)]">Timing Anomaly Threshold</span>
                        <span className="text-cyan-400">92%</span>
                      </div>
                      <input type="range" min="0" max="100" defaultValue="92" className="w-full accent-cyan-500 bg-white/10 h-1.5 rounded-full appearance-none cursor-pointer" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showComparison && (
              <motion.div 
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 32 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                className="overflow-hidden"
              >
                <div className="relative pt-8 border-t border-[var(--glass-border)]">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--bg-primary)] px-4 text-xs font-bold tracking-widest text-[var(--text-muted)] flex items-center gap-2">
                    <GitCompare size={14} /> HISTORICAL COMPARISON
                  </div>
                  <ComparisonResults result={MOCK_COMPARISON} onReset={() => setShowComparison(false)} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

      </motion.div>
    </div>
  );
}
