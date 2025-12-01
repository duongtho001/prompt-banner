import React, { useState, useEffect } from 'react';
import { GraphicCategory, PromptInputs, GeneratedResult } from './types';
import { generateOptimizedPrompt, generatePreviewImage } from './services/geminiService';
import { saveToLibrary } from './services/storageService';
import { CATEGORIES } from './constants';
import PromptBuilder from './components/PromptBuilder';
import ResultDisplay from './components/ResultDisplay';
import GuideModal from './components/GuideModal';
import LibraryModal from './components/LibraryModal';
import Icon from './components/Icon';

function App() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isVisualizing, setIsVisualizing] = useState(false);
  const [currentResult, setCurrentResult] = useState<GeneratedResult | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);

  useEffect(() => {
    if ((window as any).lucide) {
      setTimeout(() => (window as any).lucide.createIcons(), 100);
    }
  }, []);

  const handleGeneratePrompt = async (category: GraphicCategory, inputs: PromptInputs) => {
    setIsGenerating(true);
    setCurrentResult(null);
    try {
      // Now returns an array of strings
      const prompts = await generateOptimizedPrompt(category, inputs);
      
      const newResult: GeneratedResult = {
        id: Date.now().toString(),
        category,
        originalInputs: inputs,
        prompts: prompts, // Store array
        createdAt: Date.now()
      };
      
      setCurrentResult(newResult);
      saveToLibrary(newResult);
      
      setTimeout(() => {
        const resultSection = document.getElementById('result-section');
        if (resultSection) {
          resultSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } catch (error) {
      alert("Có lỗi xảy ra khi tạo prompt. Vui lòng thử lại.");
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerate = () => {
    if (currentResult) {
      handleGeneratePrompt(currentResult.category, currentResult.originalInputs);
    }
  };

  const handleVisualize = async (prompt: string) => {
    if (!currentResult) return;
    
    const categoryInfo = CATEGORIES.find(c => c.id === currentResult.category);
    // Prioritize specific selected ratio (e.g., for Infographic) over category default
    const aspectRatio = currentResult.originalInputs.selectedRatio || categoryInfo?.aspectRatio || '1:1';
    const referenceImage = currentResult.originalInputs.referenceImage;

    setIsVisualizing(true);
    try {
      const imageUrl = await generatePreviewImage(prompt, aspectRatio, referenceImage);
      
      const updatedResult = { ...currentResult, imageUrl };
      setCurrentResult(updatedResult);
      saveToLibrary(updatedResult);
      
    } catch (error) {
      alert("Không thể tạo ảnh xem trước. Có thể do giới hạn API.");
      console.error(error);
    } finally {
      setIsVisualizing(false);
    }
  };

  const handleLoadFromLibrary = (result: GeneratedResult) => {
    setCurrentResult(result);
    setIsLibraryOpen(false);
    setTimeout(() => {
      const resultSection = document.getElementById('result-section');
      if (resultSection) {
        resultSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-dark text-slate-200 pb-20">
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-b border-white/5 text-xs relative z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-col md:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 text-indigo-300/80 hover:text-indigo-300 transition-colors">
                <Icon name="Phone" size={12} />
                <span className="font-medium tracking-wide">App của Thọ - <span className="text-white">0934415387</span></span>
             </div>
          </div>
          
          <a 
            href="https://zalo.me/g/sgkzgk550" 
            target="_blank" 
            rel="noreferrer"
            className="flex items-center gap-2 group px-3 py-1 rounded-full bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/20 hover:border-blue-500/40 transition-all"
          >
            <Icon name="Users" size={12} className="text-blue-400" />
            <span className="text-slate-300 group-hover:text-white font-medium">Tham Gia Nhóm Zalo Tạo App</span>
            <Icon name="ExternalLink" size={10} className="text-slate-500 group-hover:text-white transition-colors" />
          </a>
        </div>
      </div>

      <header className="border-b border-slate-800 bg-dark/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
              <Icon name="Wand2" className="text-white" size={24} />
            </div>
            <div>
              <h1 className="font-bold text-xl tracking-tight text-white">PromptMaster</h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">AI Graphic Generator</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
            <button 
              onClick={() => setIsLibraryOpen(true)}
              className="hover:text-white cursor-pointer transition-colors flex items-center gap-1"
            >
              <Icon name="Library" size={16} /> Thư viện
            </button>
            <button 
              onClick={() => setIsGuideOpen(true)}
              className="hover:text-white cursor-pointer transition-colors flex items-center gap-1"
            >
              <Icon name="BookOpen" size={16} /> Hướng dẫn
            </button>
            <a 
              href="https://ai.google.dev/" 
              target="_blank" 
              rel="noreferrer"
              className="px-4 py-2 rounded-full bg-slate-800 hover:bg-slate-700 text-white transition-colors border border-slate-700"
            >
              Powered by Gemini
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-center mb-12 space-y-4 animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 pb-2">
            Biến Ý Tưởng Thành Nghệ Thuật
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Công cụ chuyên nghiệp tạo prompt tối ưu cho Menu, Poster, Banner Du lịch và Artwork. 
            Hỗ trợ tư duy sâu tạo nhiều biến thể phong cách.
          </p>
        </div>

        <PromptBuilder onGenerate={handleGeneratePrompt} isGenerating={isGenerating} />

        {currentResult && (
          <div id="result-section">
            <div className="flex items-center gap-4 my-8">
              <div className="h-px bg-slate-800 flex-grow"></div>
              <span className="text-slate-500 text-sm font-medium uppercase tracking-widest">Kết Quả</span>
              <div className="h-px bg-slate-800 flex-grow"></div>
            </div>
            <ResultDisplay 
              result={currentResult} 
              onVisualize={handleVisualize}
              isVisualizing={isVisualizing}
              onRegenerate={handleRegenerate}
              isRegenerating={isGenerating}
            />
          </div>
        )}
      </main>
      
      <footer className="border-t border-slate-800 mt-12 py-8 text-center text-slate-500 text-sm">
        <p>© 2024 AI Graphic Prompt Master. All rights reserved.</p>
      </footer>

      <GuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
      <LibraryModal 
        isOpen={isLibraryOpen} 
        onClose={() => setIsLibraryOpen(false)} 
        onSelect={handleLoadFromLibrary}
      />
    </div>
  );
}

export default App;