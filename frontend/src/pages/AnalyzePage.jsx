import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, FileText, Zap, ChevronLeft, Hexagon } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import DocumentDropzone from '../components/DocumentDropzone';
import ProcessingAnimation from '../components/ProcessingAnimation';
import AnalysisResults from '../components/AnalysisResults';
import ComparisonResults from '../components/ComparisonResults';
import { MOCK_AI_RESULT, MOCK_HUMAN_RESULT, MOCK_COMPARISON } from '../utils/mockData';

const BackgroundBlobs = () => (
  <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
    <motion.div animate={{ x: [0, 30, 0], y: [0, -20, 0] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }} className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[var(--accent-blue)] rounded-full blur-[120px] opacity-10" />
    <motion.div animate={{ x: [0, -40, 0], y: [0, 30, 0] }} transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }} className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-[var(--accent-teal)] rounded-full blur-[150px] opacity-10" />
  </div>
);

const getMockResult = (filename, docType) => {
  if (!filename) return MOCK_HUMAN_RESULT;
  const isAI = docType === 'ai' || 
    filename.toLowerCase().includes('ai') || 
    filename.toLowerCase().includes('gpt') ||
    filename.toLowerCase().includes('generated');
  return isAI ? MOCK_AI_RESULT : MOCK_HUMAN_RESULT;
};

export default function AnalyzePage() {
  const [mode, setMode] = useState('single'); // 'single' | 'compare'
  const [status, setStatus] = useState('idle'); // 'idle' | 'processing' | 'complete'
  
  const [singleFile, setSingleFile] = useState(null);
  const [docA, setDocA] = useState(null);
  const [docB, setDocB] = useState(null);

  const [result, setResult] = useState(null);

  const handleAnalyzeSingle = () => {
    if (!singleFile) return;
    setStatus('processing');
  };

  const handleAnalyzeCompare = () => {
    if (!docA || !docB) return;
    setStatus('processing');
  };

  const handleProcessingComplete = () => {
    if (mode === 'single') {
      setResult(getMockResult(singleFile.name));
    } else {
      // In comparison mode, use MOCK_COMPARISON directly to show the showpiece
      setResult(MOCK_COMPARISON);
    }
    setStatus('complete');
  };

  const handleReset = () => {
    setStatus('idle');
    setSingleFile(null);
    setDocA(null);
    setDocB(null);
    setResult(null);
  };

  return (
    <div className="min-h-screen w-full text-[var(--text-primary)] p-4 md:p-8 relative overflow-hidden font-sans" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="scanlines" />
      <BackgroundBlobs />

      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-center gap-4 bg-[var(--glass)] border border-[var(--glass-border)] backdrop-blur-xl p-4 rounded-2xl corner-brackets shadow-[0_0_20px_rgba(0,0,0,0.3)]"
        >
          <div className="flex items-center gap-4">
            <NavLink to="/dashboard" className="w-10 h-10 bg-[var(--bg2)] hover:bg-[var(--glass-border)] rounded-full flex items-center justify-center transition-colors border border-[var(--border)]">
              <ChevronLeft className="text-[var(--text-primary)]" size={20} />
            </NavLink>
            <div className="relative flex items-center justify-center w-10 h-10">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: 'linear' }} className="absolute inset-0 border border-cyan-500/30 border-dashed rounded-full" />
              <Zap className="text-cyan-500 relative z-10" size={20} />
            </div>
            <h1 className="text-xl font-bold tracking-widest uppercase">Live Intelligence Scanner</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/30 rounded-full flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-cyan-400 text-xs font-mono font-bold tracking-widest">SYSTEM ONLINE</span>
            </div>
          </div>
        </motion.header>

        {status === 'idle' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8"
          >
            {/* Mode Toggle */}
            <div className="flex flex-wrap justify-center gap-4">
              <button 
                onClick={() => setMode('single')}
                className={`flex flex-col items-center p-6 rounded-2xl border-2 transition-all duration-300 w-64 ${mode === 'single' ? 'border-cyan-500 bg-cyan-500/10 shadow-[0_0_20px_rgba(6,182,212,0.2)] scale-105' : 'border-[var(--glass-border)] bg-[var(--glass)] hover:border-cyan-500/50'}`}
              >
                <FileText className={mode === 'single' ? "text-cyan-400 mb-3" : "text-[var(--text-muted)] mb-3"} size={32} />
                <span className="font-bold text-[var(--text-primary)] mb-1">Single Analysis</span>
                <span className="text-xs text-[var(--text-muted)] text-center">Scan one document</span>
              </button>

              <button 
                onClick={() => setMode('compare')}
                className={`flex flex-col items-center p-6 rounded-2xl border-2 transition-all duration-300 w-64 ${mode === 'compare' ? 'border-cyan-500 bg-cyan-500/10 shadow-[0_0_20px_rgba(6,182,212,0.2)] scale-105' : 'border-[var(--glass-border)] bg-[var(--glass)] hover:border-cyan-500/50'}`}
              >
                <div className="flex gap-2 mb-3">
                  <Bot className={mode === 'compare' ? "text-red-400" : "text-[var(--text-muted)]"} size={32} />
                  <FileText className={mode === 'compare' ? "text-cyan-400" : "text-[var(--text-muted)]"} size={32} />
                </div>
                <span className="font-bold text-[var(--text-primary)] mb-1">Comparison Mode</span>
                <span className="text-xs text-[var(--text-muted)] text-center">AI vs Human side by side</span>
              </button>
            </div>

            {/* Dropzones */}
            <AnimatePresence mode="wait">
              {mode === 'single' ? (
                <motion.div 
                  key="single"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="max-w-2xl mx-auto"
                >
                  <DocumentDropzone 
                    file={singleFile} 
                    onFileSelect={setSingleFile} 
                    onClear={() => setSingleFile(null)} 
                    label="Drop .txt / .pdf / .docx here or click to browse"
                  />
                  <div className="mt-8 text-center">
                    <button 
                      onClick={handleAnalyzeSingle}
                      disabled={!singleFile}
                      className="px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold text-white tracking-widest shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all flex items-center gap-2 mx-auto"
                    >
                      <Zap size={18} /> RUN ANALYSIS
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="compare"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <div className="bg-red-500/10 border border-red-500/30 rounded-t-xl p-3 text-center">
                        <span className="text-red-400 font-bold text-sm tracking-widest flex items-center justify-center gap-2">
                          <Bot size={16} /> Document A (AI Generated)
                        </span>
                      </div>
                      <div className="bg-[var(--glass)] border border-[var(--glass-border)] border-t-0 rounded-b-xl p-6">
                        <DocumentDropzone file={docA} onFileSelect={setDocA} onClear={() => setDocA(null)} label="Drop file here" />
                      </div>
                    </div>
                    <div>
                      <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-t-xl p-3 text-center">
                        <span className="text-cyan-400 font-bold text-sm tracking-widest flex items-center justify-center gap-2">
                          <FileText size={16} /> Document B (Student Written)
                        </span>
                      </div>
                      <div className="bg-[var(--glass)] border border-[var(--glass-border)] border-t-0 rounded-b-xl p-6">
                        <DocumentDropzone file={docB} onFileSelect={setDocB} onClear={() => setDocB(null)} label="Drop file here" />
                      </div>
                    </div>
                  </div>
                  <div className="mt-8 text-center">
                    <button 
                      onClick={handleAnalyzeCompare}
                      disabled={!docA || !docB}
                      className="px-8 py-4 bg-gradient-to-r from-red-600 to-cyan-600 hover:from-red-500 hover:to-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold text-white tracking-widest shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all flex items-center gap-2 mx-auto"
                    >
                      <Zap size={18} /> RUN COMPARISON ANALYSIS
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {status === 'processing' && (
          <div className="py-20">
            <ProcessingAnimation onComplete={handleProcessingComplete} />
          </div>
        )}

        {status === 'complete' && (
          <AnimatePresence mode="wait">
            {mode === 'single' ? (
              <AnalysisResults key="single-result" result={result} filename={singleFile?.name} onReset={handleReset} />
            ) : (
              <ComparisonResults key="compare-result" result={result} onReset={handleReset} />
            )}
          </AnimatePresence>
        )}

      </div>
    </div>
  );
}
