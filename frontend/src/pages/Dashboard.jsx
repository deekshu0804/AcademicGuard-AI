import { useState, useEffect, useContext, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Users, Activity, ShieldAlert, AlertTriangle, LogOut, Hexagon, User, Settings as SettingsIcon, Bell, ChevronLeft, Moon, Sun, CheckCircle2 } from 'lucide-react';
import { fetchDashboardStats, fetchStudents, fetchStudentDetail } from '../api/client';
import { MOCK_STUDENTS, mockStats } from '../utils/mockData';
import { AuthContext } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import RiskTable from '../components/RiskTable';
import TrendChart from '../components/TrendChart';
import { useTheme } from '../hooks/useTheme';

const BackgroundBlobs = () => (
  <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
    <motion.div animate={{ x: [0, 30, 0], y: [0, -20, 0] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }} className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[var(--accent-blue)] rounded-full blur-[120px] opacity-10" />
    <motion.div animate={{ x: [0, -40, 0], y: [0, 30, 0] }} transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }} className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-[var(--accent-teal)] rounded-full blur-[150px] opacity-10" />
    <motion.div animate={{ x: [0, 20, 0], y: [0, 40, 0] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} className="absolute top-[30%] left-[40%] w-[300px] h-[300px] bg-[#7c3aed] rounded-full blur-[100px] opacity-5" />
  </div>
);

const HeaderClock = () => {
  const [time, setTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="font-mono text-xs tracking-widest text-[var(--text-muted)] flex items-center gap-2 bg-[var(--glass)] border border-[var(--glass-border)] px-3 py-1.5 rounded-full">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
      </span>
      LIVE {time.toLocaleTimeString('en-US', { hour12: false })}
    </div>
  );
};

export default function Dashboard() {
  const { user, logout } = useContext(AuthContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState('main'); // main, settings, notifications
  const [dark, toggleTheme] = useTheme();
  const theme = dark ? 'dark' : 'light';
  const dropdownRef = useRef(null);

  const [activeFilter, setActiveFilter] = useState('ALL');
  const tableRef = useRef(null);

  const handleStatCardClick = (filter) => {
    setActiveFilter(filter);
    tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
        setTimeout(() => setActiveMenu('main'), 200);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const notifications = [
    { id: 1, text: "STU-002 flagged for high risk anomaly.", time: "2m ago", read: false },
    { id: 2, text: "Stylometry model weights updated.", time: "1h ago", read: true },
    { id: 3, text: "System scan completed successfully.", time: "3h ago", read: true },
  ];
  const { data: stats = mockStats, isLoading: statsLoading } = useQuery({ queryKey: ['stats'], queryFn: fetchDashboardStats, placeholderData: mockStats, staleTime: 30000 });
  const { data: students = MOCK_STUDENTS, isLoading: studentsLoading } = useQuery({ queryKey: ['students'], queryFn: fetchStudents, placeholderData: MOCK_STUDENTS, staleTime: 30000 });

  const highestRiskStudent = students?.sort((a, b) => b.latest_risk_score - a.latest_risk_score)[0];
  const { data: highestRiskData } = useQuery({
    queryKey: ['studentDetail', highestRiskStudent?.student_id],
    queryFn: () => fetchStudentDetail(highestRiskStudent.student_id),
    enabled: !!highestRiskStudent,
    staleTime: 30000,
  });

  const chartData = highestRiskData?.submissions?.map(sub => ({ name: sub.assignment_id, risk: sub.risk_score })) || [];

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } } };

  if (statsLoading || studentsLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-64 h-32 bg-[var(--glass)] border border-[var(--glass-border)] rounded-2xl flex items-center justify-center backdrop-blur-xl">
          <p className="text-[var(--accent-teal)] font-mono tracking-widest uppercase text-sm animate-pulse">Initializing Interface...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full text-[var(--text-primary)] p-4 md:p-8 relative overflow-hidden font-sans" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="scanlines" />
      <BackgroundBlobs />

      <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-7xl mx-auto space-y-8 relative z-10">
        
        {/* Redesigned Header */}
        <motion.header variants={itemVariants} className="flex flex-col md:flex-row justify-between items-center gap-4 bg-[var(--glass)] border border-[var(--glass-border)] backdrop-blur-xl p-4 rounded-2xl corner-brackets shadow-[0_0_20px_rgba(0,0,0,0.3)]">
          <div className="flex items-center gap-4">
            <div className="relative flex items-center justify-center w-10 h-10">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: 'linear' }} className="absolute inset-0 border border-cyan-500/30 border-dashed rounded-full" />
              <Hexagon className="text-cyan-500 relative z-10" size={24} />
            </div>
            <h1 className="text-2xl font-black tracking-tighter">Nexus<span className="text-[var(--accent-teal)]">Guard</span></h1>
          </div>
          
          <div className="hidden md:flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full font-mono text-xs font-bold text-slate-400 tracking-widest">
            NEURAL CORE v2.1
          </div>

          <div className="flex items-center gap-4">
            <NavLink to="/analyze" className="px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 rounded-full border border-cyan-500/30 transition-all font-bold tracking-widest text-xs flex items-center">
              <motion.span
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-cyan-400"
              >
                ⚡ Analyze
              </motion.span>
            </NavLink>
            <HeaderClock />
            <div className="relative pl-4 border-l border-[var(--glass-border)]" ref={dropdownRef}>
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-sm font-bold shadow-[0_0_15px_rgba(6,182,212,0.5)] hover:scale-105 transition-transform border-2 border-transparent hover:border-cyan-300"
              >
                {user?.name?.split(' ').map(n => n[0]).join('') || 'FC'}
              </button>

              <AnimatePresence mode="wait">
                {dropdownOpen && (
                  <motion.div
                    key="dropdown"
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-14 w-72 bg-[var(--bg-secondary)] backdrop-blur-xl border border-[var(--glass-border)] rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden z-50 corner-brackets"
                  >
                    <AnimatePresence mode="wait">
                      {activeMenu === 'main' && (
                        <motion.div
                          key="main"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.15 }}
                        >
                          <div className="p-4 border-b border-[var(--glass-border)] bg-[var(--glass)]">
                            <p className="font-bold text-[var(--text-primary)] text-base">{user?.name || 'Dr. Faculty'}</p>
                            <p className="text-xs font-mono text-[var(--accent-teal)] mt-1">{user?.email || 'faculty@nexusguard.edu'}</p>
                            <div className="mt-3 inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-bold uppercase tracking-widest">
                              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                              Clearance: Level 4
                            </div>
                          </div>
                          
                          <div className="p-2">
                            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--glass)] rounded-xl transition-colors text-left">
                              <User size={16} /> My Profile
                            </button>
                            <button onClick={() => setActiveMenu('settings')} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--glass)] rounded-xl transition-colors text-left">
                              <SettingsIcon size={16} /> System Settings
                            </button>
                            <button onClick={() => setActiveMenu('notifications')} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--glass)] rounded-xl transition-colors text-left">
                              <Bell size={16} /> Notifications <span className="ml-auto bg-[var(--risk-high)] text-white text-[10px] px-1.5 py-0.5 rounded-full">1</span>
                            </button>
                          </div>

                          <div className="p-2 border-t border-[var(--glass-border)]">
                            <button 
                              onClick={() => { setDropdownOpen(false); logout(); }}
                              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-xl transition-colors text-left"
                            >
                              <LogOut size={16} /> Disconnect Session
                            </button>
                          </div>
                        </motion.div>
                      )}

                      {activeMenu === 'settings' && (
                        <motion.div
                          key="settings"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ duration: 0.15 }}
                        >
                          <div className="p-3 border-b border-[var(--glass-border)] flex items-center gap-2">
                            <button onClick={() => setActiveMenu('main')} className="p-1 hover:bg-[var(--glass)] rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                              <ChevronLeft size={18} />
                            </button>
                            <span className="font-bold text-sm">System Settings</span>
                          </div>
                          <div className="p-4 space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 text-sm text-[var(--text-primary)]">
                                {theme === 'dark' ? <Moon size={16} className="text-[var(--accent-teal)]" /> : <Sun size={16} className="text-[var(--accent-amber)]" />}
                                Theme Interface
                              </div>
                              <button 
                                onClick={toggleTheme}
                                className="w-12 h-6 bg-[var(--glass)] border border-[var(--glass-border)] rounded-full relative transition-colors flex items-center px-1"
                              >
                                <motion.div 
                                  layout 
                                  className="w-4 h-4 bg-[var(--accent-teal)] rounded-full shadow-[0_0_5px_var(--accent-teal)]"
                                  animate={{ x: theme === 'dark' ? 0 : 22 }}
                                />
                              </button>
                            </div>
                            <p className="text-xs text-[var(--text-muted)] italic">Note: Neural Core is optimized for dark mode.</p>
                          </div>
                        </motion.div>
                      )}

                      {activeMenu === 'notifications' && (
                        <motion.div
                          key="notifications"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ duration: 0.15 }}
                        >
                          <div className="p-3 border-b border-[var(--glass-border)] flex items-center gap-2">
                            <button onClick={() => setActiveMenu('main')} className="p-1 hover:bg-[var(--glass)] rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                              <ChevronLeft size={18} />
                            </button>
                            <span className="font-bold text-sm">Notifications</span>
                          </div>
                          <div className="p-2 max-h-64 overflow-y-auto custom-scrollbar">
                            {notifications.map(n => (
                              <div key={n.id} className="p-3 rounded-xl hover:bg-[var(--glass)] transition-colors mb-1 cursor-pointer">
                                <div className="flex items-start gap-3">
                                  <div className="mt-1">
                                    {n.read ? <CheckCircle2 size={14} className="text-[var(--accent-teal)]" /> : <div className="w-2 h-2 rounded-full bg-[var(--risk-high)] animate-pulse mt-1" />}
                                  </div>
                                  <div>
                                    <p className={`text-sm ${n.read ? 'text-[var(--text-muted)]' : 'text-[var(--text-primary)] font-semibold'}`}>{n.text}</p>
                                    <p className="text-[10px] text-[var(--text-muted)] font-mono mt-1">{n.time}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.header>

        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard label="Total Monitored" value={stats?.total_students || 0} icon={Users} color="var(--accent-blue)" delay={0.1} trend="+12%" trendUp={true} progress={80} onClick={() => handleStatCardClick('ALL')} clickable />
          <StatCard label="Flagged Activity" value={stats?.flagged_count || 0} icon={Activity} color="var(--accent-amber)" delay={0.2} trend="+4%" trendUp={false} progress={15} onClick={() => handleStatCardClick('MEDIUM')} clickable />
          <StatCard label="High Risk (>70)" value={stats?.high_risk_count || 0} icon={ShieldAlert} color="var(--risk-high)" delay={0.3} trend="-2%" trendUp={true} progress={5} onClick={() => handleStatCardClick('HIGH')} clickable />
          <StatCard label="System Avg Risk" value={stats?.avg_risk_score?.toFixed(1) || '0.0'} icon={AlertTriangle} color="var(--accent-teal)" delay={0.4} trend="-0.5%" trendUp={true} progress={42} onClick={() => handleStatCardClick('ALL')} clickable />
        </motion.div>

        <motion.div variants={itemVariants} className="bg-[var(--glass)] backdrop-blur-xl border border-[var(--glass-border)] rounded-2xl p-6 relative overflow-hidden corner-brackets shadow-[0_0_20px_rgba(0,0,0,0.2)]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent-blue)] rounded-full blur-[80px] opacity-10 pointer-events-none"></div>
          <div className="mb-6">
            <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Activity className="text-[var(--accent-blue)]" size={20} />
              Critical Trajectory
            </h2>
            <p className="text-[var(--text-muted)] text-sm">
              Analyzing extreme deviations for <span className="text-[var(--text-primary)] font-semibold">{highestRiskStudent?.name}</span>
            </p>
          </div>
          <TrendChart data={chartData} threshold={70} />
        </motion.div>

        <motion.div variants={itemVariants}>
          <RiskTable 
            ref={tableRef}
            students={students || []} 
            externalFilter={activeFilter}
            onFilterChange={setActiveFilter}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
