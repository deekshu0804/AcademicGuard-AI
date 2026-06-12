import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileText, UploadCloud, X } from 'lucide-react';

export default function DocumentDropzone({ onFileSelect, file, onClear, label = "Drop file here" }) {
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles?.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 
      'text/plain': ['.txt'], 
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] 
    },
    maxFiles: 1
  });

  if (file) {
    return (
      <div className="border border-cyan-500/50 bg-cyan-500/10 rounded-2xl p-6 relative overflow-hidden flex items-center justify-between shadow-[0_0_20px_rgba(6,182,212,0.15)]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center">
            <FileText className="text-cyan-400" size={24} />
          </div>
          <div>
            <p className="font-bold text-white truncate max-w-[200px]">{file.name}</p>
            <p className="text-xs text-cyan-400 font-mono">{(file.size / 1024).toFixed(1)} KB • Ready for scan</p>
          </div>
        </div>
        {onClear && (
          <button 
            onClick={onClear}
            className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center text-white/50 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>
    );
  }

  return (
    <div 
      {...getRootProps()} 
      className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 ${
        isDragActive 
          ? 'border-cyan-500 bg-cyan-500/5 shadow-[0_0_20px_rgba(6,182,212,0.3)] scale-[1.02]' 
          : 'border-white/20 bg-white/[0.02] hover:border-cyan-500/50 hover:bg-white/[0.04]'
      }`}
    >
      <input {...getInputProps()} />
      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        <UploadCloud className={isDragActive ? "text-cyan-400 animate-bounce" : "text-[var(--text-muted)]"} size={32} />
      </div>
      <p className="font-bold text-[var(--text-primary)] mb-1">{label}</p>
      <p className="text-sm text-[var(--text-muted)]">.txt, .pdf, .docx (Max 10MB)</p>
    </div>
  );
}
