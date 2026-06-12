import { useState, useMemo, useCallback, useEffect, forwardRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronRight } from 'lucide-react';

const MiniGauge = ({ score }) => {
  const color = score > 70 ? '#ef4444' : score >= 50 ? '#f59e0b' : '#22c55e';
  const strokeDasharray = `${score}, 100`;
  return (
    <div className="flex items-center gap-2">
      <svg width="24" height="24" viewBox="0 0 36 36" className="transform -rotate-90">
        <circle cx="18" cy="18" r="16" fill="none" className="stroke-white/10" strokeWidth="4" />
        <circle cx="18" cy="18" r="16" fill="none" stroke={color} strokeWidth="4" strokeDasharray={strokeDasharray} className="drop-shadow-[0_0_4px_currentColor]" />
      </svg>
      <span className="font-mono text-sm font-bold" style={{ color }}>{score.toFixed(1)}</span>
    </div>
  );
};

const ThreatLevelBar = ({ score }) => {
  const bars = Math.floor(score / 10);
  const empty = 10 - bars;
  const color = score > 70 ? 'text-[var(--risk-high)]' : score >= 50 ? 'text-[var(--risk-med)]' : 'text-[var(--risk-low)]';
  return (
    <div className={`font-mono text-xs tracking-widest ${color}`}>
      {'█'.repeat(bars)}{'░'.repeat(empty)} {score.toFixed(0)}%
    </div>
  );
};

const FilterPill = ({ label, current, setFilterStatus }) => {
  const isActive = current === label;
  return (
    <button 
      onClick={() => setFilterStatus(label)}
      className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${isActive ? 'bg-[var(--accent-blue)] text-white shadow-[0_0_10px_rgba(59,130,246,0.6)]' : 'bg-[var(--glass)] text-[var(--text-muted)] hover:text-white border border-[var(--glass-border)]'}`}
    >
      {label}
    </button>
  );
};

const RiskRow = ({ student, onClick, index }) => {
  
  return (
    <motion.tr 
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ x: 4, backgroundColor: 'rgba(6,182,212,0.05)' }}
      onClick={() => onClick(student.student_id)}
      className={`transition-colors duration-200 group cursor-pointer border-b border-[var(--glass-border)] last:border-0 relative ${index % 2 === 0 ? 'bg-white/[0.01]' : ''}`}
    >
      <td className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--accent-teal)] opacity-0 group-hover:opacity-100 transition-opacity shadow-[0_0_10px_var(--accent-teal)]"></td>
      <td className="p-5 pl-8">
        <div className="flex flex-col">
          <span className="text-white font-semibold text-sm">
            {student.name || student.student_name || "Unknown"}
          </span>
          <span className="text-slate-500 text-xs mt-0.5">
            {student.student_id}
          </span>
        </div>
      </td>
      <td className="p-5 text-[var(--text-muted)] font-medium">{student.assignment}</td>
      <td className="p-5">
        <MiniGauge score={student.risk_score} />
      </td>
      <td className="p-5">
        <ThreatLevelBar score={student.risk_score} />
      </td>
      <td className="p-5 text-right">
        <button className="text-[var(--text-primary)] border border-[var(--glass-border)] group-hover:border-[var(--accent-teal)] group-hover:bg-[var(--accent-teal)]/10 font-bold px-4 py-2 rounded-xl text-sm transition-all flex items-center gap-2 ml-auto">
          Review <ChevronRight size={16} />
        </button>
      </td>
    </motion.tr>
  );
};

const RiskTable = forwardRef(({ students, externalFilter, onFilterChange }, ref) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
    if (externalFilter) {
      setFilterStatus(externalFilter);
    }
  }, [externalFilter]);

  const handleFilterChange = (newFilter) => {
    setFilterStatus(newFilter);
    if (onFilterChange) onFilterChange(newFilter);
  };

  const handleRowClick = useCallback((id) => {
    navigate(`/student/${id}`);
  }, [navigate]);

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchesSearch = s.student_id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            s.name.toLowerCase().includes(searchTerm.toLowerCase());
      let matchesStatus = true;
      if (filterStatus === 'HIGH') matchesStatus = s.risk_score > 70;
      if (filterStatus === 'MEDIUM') matchesStatus = s.risk_score > 40 && s.risk_score <= 70;
      if (filterStatus === 'LOW') matchesStatus = s.risk_score <= 40;
      return matchesSearch && matchesStatus;
    });
  }, [students, searchTerm, filterStatus]);

  return (
    <div ref={ref} className="bg-[var(--glass)] backdrop-blur-xl rounded-2xl overflow-hidden border border-[var(--glass-border)] relative corner-brackets">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--accent-blue)] via-[var(--accent-teal)] to-[var(--risk-high)] opacity-50 blur-[2px]"></div>

      <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--glass-border)]">
        <h2 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Intelligence Log</h2>
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="flex gap-2">
            <FilterPill label="ALL" current={filterStatus} setFilterStatus={handleFilterChange} />
            <FilterPill label="HIGH" current={filterStatus} setFilterStatus={handleFilterChange} />
            <FilterPill label="MEDIUM" current={filterStatus} setFilterStatus={handleFilterChange} />
            <FilterPill label="LOW" current={filterStatus} setFilterStatus={handleFilterChange} />
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
            <input 
              type="text" 
              placeholder="Search Target..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[var(--glass)] border border-[var(--glass-border)] rounded-xl pl-10 pr-4 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-teal)] transition-colors min-w-[200px]"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="bg-[var(--glass)] border-b border-[var(--glass-border)]">
              <th className="p-5 pl-8 font-bold text-[var(--text-muted)] text-xs uppercase tracking-widest">Student Target</th>
              <th className="p-5 font-bold text-[var(--text-muted)] text-xs uppercase tracking-widest">Context</th>
              <th className="p-5 font-bold text-[var(--text-muted)] text-xs uppercase tracking-widest">Risk Index</th>
              <th className="p-5 font-bold text-[var(--text-muted)] text-xs uppercase tracking-widest">Threat Level</th>
              <th className="p-5 font-bold text-[var(--text-muted)] text-xs uppercase tracking-widest text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {filteredStudents.map((student, index) => (
                <RiskRow key={student.student_id} student={student} onClick={handleRowClick} index={index} />
              ))}
            </AnimatePresence>
            {filteredStudents.length === 0 && (
              <tr>
                <td colSpan="5" className="p-16 text-center text-[var(--text-muted)]">
                  <div className="flex flex-col items-center justify-center">
                    <Search className="w-12 h-12 mb-4 opacity-50" />
                    <p className="text-lg font-medium">No records match your criteria.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
});

export default RiskTable;
