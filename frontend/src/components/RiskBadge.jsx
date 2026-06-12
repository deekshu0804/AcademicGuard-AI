

const RiskBadge = ({ score, confidence }) => {
  let colorClass = 'text-[var(--risk-low)] border-[var(--risk-low)] bg-[var(--risk-low)]';
  let glowClass = '';
  let dotClass = 'bg-[var(--risk-low)]';
  let label = 'Low Risk';

  if (score > 70) {
    colorClass = 'text-[var(--risk-high)] border-[var(--risk-high)] bg-[var(--risk-high)]';
    glowClass = 'shadow-[0_0_10px_rgba(239,68,68,0.5)]';
    dotClass = 'bg-[var(--risk-high)] animate-ping';
    label = 'Critical Risk';
  } else if (score >= 50) {
    colorClass = 'text-[var(--risk-med)] border-[var(--risk-med)] bg-[var(--risk-med)]';
    glowClass = 'shadow-[0_0_10px_rgba(245,158,11,0.5)]';
    dotClass = 'bg-[var(--risk-med)]';
    label = 'Elevated Risk';
  }

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border border-opacity-30 bg-opacity-10 backdrop-blur-md ${colorClass} ${glowClass}`}>
      <div className="relative flex h-2 w-2">
        {score > 70 && <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${dotClass}`}></span>}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${dotClass.replace('animate-ping', '')}`}></span>
      </div>
      <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
      {confidence && (
        <span className="ml-1 pl-2 border-l border-current opacity-70 text-[10px]">
          {confidence}
        </span>
      )}
    </div>
  );
};

export default RiskBadge;
