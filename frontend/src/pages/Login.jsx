import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Eye, Brain, Search, Zap, ArrowRight, Loader2 } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const shakeVariants = {
  shake: { x: [-10, 10, -10, 10, 0], transition: { duration: 0.4 } }
};

const BackgroundBlobs = () => (
  <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
    <motion.div animate={{ x: [0, 50, 0], y: [0, -30, 0] }} transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }} className="absolute top-[20%] left-[10%] w-[600px] h-[600px] bg-[var(--accent-blue)] rounded-full blur-[150px] opacity-10" />
    <motion.div animate={{ x: [0, -50, 0], y: [0, 40, 0] }} transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }} className="absolute bottom-[10%] right-[20%] w-[500px] h-[500px] bg-[var(--accent-teal)] rounded-full blur-[150px] opacity-10" />
    {/* Floating Rings */}
    <motion.div animate={{ rotate: 360 }} transition={{ duration: 40, repeat: Infinity, ease: 'linear' }} className="absolute top-[30%] left-[20%] w-[400px] h-[400px] rounded-full border border-[var(--accent-blue)]/10" />
    <motion.div animate={{ rotate: -360 }} transition={{ duration: 50, repeat: Infinity, ease: 'linear' }} className="absolute top-[25%] left-[15%] w-[500px] h-[500px] rounded-full border border-[var(--accent-teal)]/10 border-dashed" />
  </div>
);

const FeaturePill = ({ icon: Icon, text, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="flex items-center gap-3 bg-[var(--glass)] border border-[var(--glass-border)] rounded-full px-5 py-3 backdrop-blur-md w-fit shadow-[0_0_15px_rgba(6,182,212,0.1)]"
  >
    <Icon className="text-[var(--accent-teal)]" size={18} />
    <span className="text-[var(--text-primary)] font-bold text-sm tracking-wide">{text}</span>
  </motion.div>
);

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(false);
    setLoading(true);

    setTimeout(() => {
      if (email === 'faculty@nexusguard.edu' && password === 'demo1234') {
        login({ email, name: 'Dr. Faculty' });
        navigate('/dashboard');
      } else {
        setError(true);
        setLoading(false);
      }
    }, 800);
  };

  const handleDemoFill = () => {
    setEmail('faculty@nexusguard.edu');
    setPassword('demo1234');
    setError(false);
  };

  return (
    <div className="min-h-screen w-full flex relative overflow-hidden font-sans" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="scanlines" />
      <BackgroundBlobs />

      {/* Left Panel */}
      <div className="hidden lg:flex w-[60%] flex-col justify-between p-16 relative z-10">
        <div>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mb-4">
            <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-blue)] to-[var(--accent-teal)] drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]">
              NexusGuard
            </h1>
            <p className="text-xl text-[var(--text-muted)] font-mono tracking-widest uppercase mt-2">
              AI-Powered Academic Integrity Intelligence
            </p>
          </motion.div>

          <div className="mt-16 space-y-4">
            <FeaturePill icon={Brain} text="ML Anomaly Detection" delay={0.2} />
            <FeaturePill icon={Search} text="Behavioral Stylometry" delay={0.4} />
            <FeaturePill icon={Zap} text="Real-time SHAP Analysis" delay={0.6} />
          </div>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="flex gap-8 text-[var(--text-muted)] font-mono text-sm border-t border-[var(--glass-border)] pt-6">
          <span>● 284 Students Monitored</span>
          <span>● 94.2% Detection Accuracy</span>
          <span>● 0 False Verdicts</span>
        </motion.div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-[40%] flex items-center justify-center p-8 relative z-10">
        <motion.div 
          animate={error ? "shake" : ""}
          variants={shakeVariants}
          className="w-full max-w-md bg-white/[0.06] backdrop-blur-2xl border border-white/[0.1] rounded-3xl p-8 shadow-[0_0_40px_rgba(0,0,0,0.5)] corner-brackets"
        >
          <div className="flex flex-col items-center mb-8">
            <div className="p-4 bg-[var(--accent-teal)]/10 rounded-2xl mb-4 border border-[var(--accent-teal)]/30">
              <Shield className="text-[var(--accent-teal)] w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-white tracking-wide">Faculty Access</h2>
            <p className="text-[var(--risk-med)] text-xs font-bold uppercase tracking-widest mt-2 flex items-center gap-1 opacity-80">
              <AlertTriangle size={12} /> Authorized Personnel Only
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <input
                type="email"
                placeholder="Institution Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all font-mono text-sm"
              />
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all font-mono text-sm"
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-cyan-500 transition-colors"
              >
                <Eye size={16} />
              </button>
            </div>
            
            <div className="flex items-center gap-2 px-1">
              <input type="checkbox" id="remember" className="rounded border-white/[0.1] bg-white/[0.05] text-cyan-500 focus:ring-cyan-500/50 focus:ring-offset-0" />
              <label htmlFor="remember" className="text-xs text-[var(--text-muted)] font-bold">Remember this device</label>
            </div>

            <AnimatePresence>
              {error && (
                <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-[var(--risk-high)] text-xs font-bold text-center">
                  Invalid credentials. Authentication failed.
                </motion.p>
              )}
            </AnimatePresence>

            <motion.button
              whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(6,182,212,0.4)' }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold tracking-widest uppercase text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-70"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : 'Sign In'}
            </motion.button>
          </form>

          <div className="mt-6 flex flex-col items-center gap-4">
            <button onClick={handleDemoFill} className="text-cyan-500 hover:text-cyan-400 text-xs font-bold flex items-center gap-1 transition-colors">
              Demo Mode <ArrowRight size={12} />
            </button>
            <p className="text-[10px] text-slate-500 text-center leading-relaxed">
              This system is for authorized faculty only.<br/>All actions are logged.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

const AlertTriangle = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
);
