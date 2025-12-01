import React, { useState, useEffect } from 'react';
import { GeneratedResult } from '../types';
import Icon from './Icon';

interface ResultDisplayProps {
  result: GeneratedResult;
  onVisualize: (prompt: string) => void;
  isVisualizing: boolean;
  onRegenerate: () => void;
  isRegenerating: boolean;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ 
  result, 
  onVisualize, 
  isVisualizing,
  onRegenerate,
  isRegenerating
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Helper to handle both old string data and new array data
  const prompts = Array.isArray(result.prompts) ? result.prompts : [(result as any).optimizedPrompt || ""];

  useEffect(() => {
    if ((window as any).lucide) {
      (window as any).lucide.createIcons();
    }
  }, [result, copiedIndex, isVisualizing, isRegenerating]);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto mt-8 animate-fade-in-up">
      <div className="bg-surface rounded-2xl border border-slate-700 overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-slate-900/50 px-6 py-4 border-b border-slate-700 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-slate-700 text-xs font-bold text-primary uppercase">
              {result.category}
            </span>
            <span className="text-slate-400 text-sm">
              {new Date(result.createdAt).toLocaleTimeString()}
            </span>
          </div>
          <div className="text-xs text-slate-500 font-medium">
             Đã tạo {prompts.length} biến thể
          </div>
        </div>

        <div className="p-6 grid gap-6">
          {prompts.map((prompt, index) => (
            <div key={index} className="flex flex-col md:flex-row gap-4 bg-dark/50 p-4 rounded-xl border border-slate-700/50 hover:border-slate-600 transition-colors">
               {/* Prompt Text Content */}
               <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                     <span className="bg-slate-800 text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded border border-slate-700">
                        BIẾN THỂ #{index + 1}
                     </span>
                  </div>
                  <div className="font-mono text-sm text-slate-300 leading-relaxed whitespace-pre-wrap break-words">
                     {prompt}
                  </div>
                  <div className="mt-3 flex gap-3">
                     <button 
                        onClick={() => handleCopy(prompt, index)}
                        className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-md border border-slate-700"
                     >
                        {copiedIndex === index ? <Icon name="Check" size={14} className="text-green-400"/> : <Icon name="Copy" size={14}/>}
                        {copiedIndex === index ? 'Đã sao chép' : 'Sao chép prompt'}
                     </button>
                     
                     <button 
                        onClick={() => onVisualize(prompt)}
                        disabled={isVisualizing}
                        className="flex items-center gap-1.5 text-xs font-medium text-indigo-300 hover:text-white transition-colors hover:bg-indigo-500/20 px-3 py-1.5 rounded-md"
                        title="Tạo ảnh thử nghiệm cho prompt này"
                     >
                        {isVisualizing ? <Icon name="Loader" className="animate-spin" size={14}/> : <Icon name="Image" size={14}/>}
                        Test thử ảnh
                     </button>
                  </div>
               </div>
            </div>
          ))}

          {/* Visualization Area (Only shows if an image exists in the result) */}
          {result.imageUrl && (
             <div className="mt-4 p-4 bg-slate-900 rounded-xl border border-slate-700 flex flex-col items-center">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 w-full border-b border-slate-800 pb-2">
                   <Icon name="Image" size={16}/> Kết quả Test Ảnh (Gần nhất)
                </h3>
                <div className="relative group max-w-md w-full">
                   <img 
                      src={result.imageUrl} 
                      alt="Visualization" 
                      className="w-full h-auto rounded-lg shadow-lg border border-slate-700"
                   />
                   <a 
                     href={result.imageUrl} 
                     download={`prompt-master-test-${result.id}.png`}
                     className="absolute bottom-2 right-2 p-2 bg-black/70 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black"
                   >
                     <Icon name="Download" size={16} />
                   </a>
                </div>
             </div>
          )}
        </div>
        
        {/* Footer Actions - Regenerate */}
        <div className="bg-slate-900/30 px-6 py-4 border-t border-slate-700 flex justify-center">
          <button
            onClick={onRegenerate}
            disabled={isRegenerating}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-sm transition-all
              ${isRegenerating 
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/20 hover:scale-105'
              }`}
          >
             {isRegenerating ? <Icon name="Loader2" className="animate-spin" size={18} /> : <Icon name="RefreshCcw" size={18} />}
             {isRegenerating ? 'Đang tạo thêm...' : 'Tạo Thêm Prompt Mới (Regenerate)'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultDisplay;