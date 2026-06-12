import { Suspense, lazy, useState } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { useTheme } from './hooks/useTheme';

const StudentDetail = lazy(() => import('./pages/StudentDetail'));
import { GlassSkeleton } from './components/GlassSkeleton';
const AnalyzePage = lazy(() => import('./pages/AnalyzePage'));

const pageVariants = {
  initial: { opacity: 0, y: 20, filter: 'blur(10px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.4 } },
  exit: { opacity: 0, y: -20, filter: 'blur(10px)', transition: { duration: 0.2 } }
};

const PageWrapper = ({ children }) => (
  <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="w-full min-h-screen bg-[var(--bg-primary)]">
    {children}
  </motion.div>
);

const BootSequence = ({ onComplete }) => (
  <motion.div 
    initial={{ opacity: 1 }} 
    exit={{ opacity: 0 }} 
    transition={{ duration: 1 }}
    className="fixed inset-0 z-[999] bg-[#0a0a0f] text-cyan-500 font-mono flex flex-col items-center justify-center p-8"
  >
    <div className="w-full max-w-lg">
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xl font-bold mb-4 tracking-widest uppercase">
        NEXUSGUARD NEURAL CORE
      </motion.p>
      <div className="space-y-2 text-sm text-cyan-500/80">
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>Initializing...</motion.p>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="flex items-center gap-4">
          <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 1.5, ease: 'linear' }} className="h-full bg-cyan-500" onAnimationComplete={onComplete} />
          </div>
        </motion.div>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>Loading intelligence modules...</motion.p>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}>System ready.</motion.p>
      </div>
    </div>
  </motion.div>
);

const App = () => {
  const location = useLocation();
  const [booting, setBooting] = useState(() => !sessionStorage.getItem('nexusguard_booted'));
  const [dark, toggleTheme] = useTheme();

  const handleBootComplete = () => {
    setTimeout(() => {
      setBooting(false);
      sessionStorage.setItem('nexusguard_booted', 'true');
    }, 500);
  };

  return (
    <AuthProvider>
      <AnimatePresence>
        {booting && <BootSequence key="boot" onComplete={handleBootComplete} />}
      </AnimatePresence>
      
      {!booting && (
        <>
          <button className="toggle-btn" onClick={toggleTheme}>
            {dark ? '🌙 Dark' : '☀️ Light'}
          </button>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<ProtectedRoute><PageWrapper><Dashboard /></PageWrapper></ProtectedRoute>} />
            <Route path="/analyze" element={<ProtectedRoute><PageWrapper><Suspense fallback={<GlassSkeleton />}><AnalyzePage /></Suspense></PageWrapper></ProtectedRoute>} />
            <Route path="/student/:student_id" element={<ProtectedRoute><PageWrapper><Suspense fallback={<GlassSkeleton />}><StudentDetail /></Suspense></PageWrapper></ProtectedRoute>} />
          </Routes>
        </AnimatePresence>
        </>
      )}
    </AuthProvider>
  );
};

export default App;
