export const GlassSkeleton = () => (
  <div className="min-h-screen w-full p-8 relative" style={{ backgroundColor: 'var(--bg-primary)' }}>
    <div className="scanlines" />
    <div className="max-w-7xl mx-auto space-y-6 relative z-10">
      <div className="h-10 w-32 bg-[var(--glass)] rounded-xl animate-pulse" />
      <div className="h-48 bg-[var(--glass)] border border-[var(--glass-border)] rounded-2xl animate-pulse backdrop-blur-xl corner-brackets" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-80 bg-[var(--glass)] border border-[var(--glass-border)] rounded-2xl animate-pulse backdrop-blur-xl corner-brackets" />
        <div className="h-80 bg-[var(--glass)] border border-[var(--glass-border)] rounded-2xl animate-pulse backdrop-blur-xl corner-brackets" />
      </div>
    </div>
  </div>
);
