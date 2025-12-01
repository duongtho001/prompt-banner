import React, { useState, useEffect, useRef } from 'react';
import { GraphicCategory, PromptInputs } from '../types';
import { CATEGORIES, STYLE_PRESETS } from '../constants';
import { suggestDetailsFromSubject, extractDetailsFromImage } from '../services/geminiService';
import Icon from './Icon';

interface PromptBuilderProps {
  onGenerate: (category: GraphicCategory, inputs: PromptInputs) => void;
  isGenerating: boolean;
}

const PromptBuilder: React.FC<PromptBuilderProps> = ({ onGenerate, isGenerating }) => {
  const [selectedCategory, setSelectedCategory] = useState<GraphicCategory>(GraphicCategory.POSTER);
  const [inputs, setInputs] = useState<PromptInputs>({
    subject: '',
    style: '',
    mood: '',
    colors: '',
    elements: '',
    additionalInfo: '',
    referenceImage: '',
    dataFileContent: '',
    promptCount: 3,
    selectedRatio: '',
    notebookFormat: 'BRIEFING'
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isReadingFile, setIsReadingFile] = useState(false); // State for file reading
  const [fileName, setFileName] = useState<string>('');
  
  const analysisInputRef = useRef<HTMLInputElement>(null);
  const referenceInputRef = useRef<HTMLInputElement>(null);
  const dataFileInputRef = useRef<HTMLInputElement>(null);

  // Set default ratio when category changes
  useEffect(() => {
    const categoryInfo = CATEGORIES.find(c => c.id === selectedCategory);
    setInputs(prev => ({
      ...prev,
      selectedRatio: categoryInfo?.aspectRatio || '1:1'
    }));
  }, [selectedCategory]);

  useEffect(() => {
    if ((window as any).lucide) {
      (window as any).lucide.createIcons();
    }
  }, [selectedCategory, isAnalyzing, isReadingFile, inputs.referenceImage, inputs.promptCount, fileName, inputs.selectedRatio, inputs.notebookFormat]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(selectedCategory, inputs);
  };

  const handleAutoSuggest = async () => {
    if (!inputs.subject) {
      alert("Vui lòng nhập chủ đề trước để AI có thể gợi ý.");
      return;
    }
    setIsAnalyzing(true);
    try {
      const suggestions = await suggestDetailsFromSubject(inputs.subject, CATEGORIES.find(c => c.id === selectedCategory)?.label || 'Poster');
      
      if (Object.keys(suggestions).length === 0) {
        throw new Error("No suggestions returned");
      }

      setInputs(prev => ({
        ...prev,
        style: suggestions.style || prev.style,
        mood: suggestions.mood || prev.mood,
        colors: suggestions.colors || prev.colors,
        elements: suggestions.elements || prev.elements,
      }));
    } catch (e) {
      console.error(e);
      alert("Không thể lấy gợi ý. Vui lòng thử lại.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAnalysisImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      alert("File ảnh quá lớn. Vui lòng chọn ảnh dưới 4MB.");
      return;
    }

    setIsAnalyzing(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        try {
          const analysis = await extractDetailsFromImage(base64String);
           if (Object.keys(analysis).length === 0) {
             throw new Error("No analysis returned");
           }
          setInputs(prev => ({
            ...prev,
            style: analysis.style || prev.style,
            mood: analysis.mood || prev.mood,
            colors: analysis.colors || prev.colors,
            elements: analysis.elements || prev.elements,
          }));
        } catch (err) {
           console.error(err);
           alert("Không thể phân tích hình ảnh.");
        } finally {
           setIsAnalyzing(false);
           if (analysisInputRef.current) analysisInputRef.current.value = '';
        }
      };
      reader.readAsDataURL(file);
    } catch (e) {
      console.error(e);
      setIsAnalyzing(false);
    }
  };

  const handleReferenceImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 4 * 1024 * 1024) {
      alert("File ảnh quá lớn.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setInputs(prev => ({ ...prev, referenceImage: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  // Helper function to extract text from PDF using pdf.js
  const readPdfFile = async (file: File): Promise<string> => {
    return new Promise(async (resolve, reject) => {
      try {
        const arrayBuffer = await file.arrayBuffer();
        // @ts-ignore - pdfjsLib is loaded via script tag in index.html
        const pdf = await window.pdfjsLib.getDocument(arrayBuffer).promise;
        let fullText = "";

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item: any) => item.str).join(" ");
          fullText += `--- Page ${i} ---\n${pageText}\n\n`;
        }
        resolve(fullText);
      } catch (error) {
        reject(error);
      }
    });
  };

  const handleDataFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Increased limit for PDFs slightly
    if (file.size > 5 * 1024 * 1024) {
      alert("File dữ liệu quá lớn. Vui lòng chọn file dưới 5MB.");
      return;
    }

    setFileName(file.name);
    setIsReadingFile(true);

    try {
      let content = "";
      if (file.type === "application/pdf") {
        content = await readPdfFile(file);
      } else {
        // Handle text based files
        content = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (event) => resolve(event.target?.result as string);
          reader.readAsText(file);
        });
      }
      setInputs(prev => ({ ...prev, dataFileContent: content }));
    } catch (error) {
      console.error("Error reading file:", error);
      alert("Không thể đọc file PDF/Text này. Vui lòng thử lại.");
      setFileName('');
    } finally {
      setIsReadingFile(false);
    }
  };

  const clearReferenceImage = () => {
    setInputs(prev => ({ ...prev, referenceImage: '' }));
    if (referenceInputRef.current) referenceInputRef.current.value = '';
  };

  const clearDataFile = () => {
    setInputs(prev => ({ ...prev, dataFileContent: '' }));
    setFileName('');
    if (dataFileInputRef.current) dataFileInputRef.current.value = '';
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      {/* Category Selection */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`relative p-2 rounded-xl border transition-all duration-300 flex flex-col items-center justify-center gap-2 text-center h-28
                ${isSelected 
                  ? `bg-gradient-to-br ${cat.gradient} border-transparent text-white shadow-lg shadow-purple-500/20 transform scale-105 z-10` 
                  : 'bg-surface border-slate-700 text-slate-400 hover:border-slate-500 hover:bg-slate-750'
                }`}
            >
              <div className={`${isSelected ? 'text-white' : 'text-slate-400'}`}>
                <Icon name={cat.icon} size={24} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wide leading-tight">{cat.label}</span>
              {isSelected && (
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rotate-45"></div>
              )}
            </button>
          );
        })}
      </div>

      {/* Form */}
      <div className="bg-surface rounded-2xl p-6 md:p-8 border border-slate-700 shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-slate-700 pb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-gradient-to-br ${CATEGORIES.find(c => c.id === selectedCategory)?.gradient}`}>
              <Icon name="PenTool" className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Nhập thông tin chi tiết</h2>
              <p className="text-sm text-slate-400">Điền thủ công hoặc sử dụng AI để gợi ý</p>
            </div>
          </div>

          <div className="w-full md:w-auto">
            <input 
              type="file" 
              ref={analysisInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleAnalysisImageUpload}
            />
            <button
              type="button"
              disabled={isAnalyzing}
              onClick={() => analysisInputRef.current?.click()}
              className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-sm text-slate-300 transition-colors"
            >
              {isAnalyzing ? <Icon name="Loader2" className="animate-spin" size={16}/> : <Icon name="ScanEye" size={16}/>}
              Quét phong cách từ ảnh mẫu
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">Chủ đề chính (Subject)</label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                placeholder="Ví dụ: Thực đơn món Ý, Tóm tắt báo cáo tài chính..."
                className="flex-grow bg-dark border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                value={inputs.subject}
                onChange={(e) => setInputs({ ...inputs, subject: e.target.value })}
              />
              <button
                type="button"
                onClick={handleAutoSuggest}
                disabled={isAnalyzing || !inputs.subject}
                className="flex-shrink-0 px-4 bg-indigo-600/20 border border-indigo-500/50 hover:bg-indigo-600/40 text-indigo-300 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                 {isAnalyzing ? <Icon name="Loader2" className="animate-spin" size={18}/> : <Icon name="Sparkles" size={18}/>}
                 <span className="hidden sm:inline">Gợi ý</span>
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">Phong cách (Style)</label>
              <div className="relative">
                <input
                  type="text"
                  list="styles"
                  placeholder="Chọn hoặc tự nhập..."
                  className="w-full bg-dark border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  value={inputs.style}
                  onChange={(e) => setInputs({ ...inputs, style: e.target.value })}
                />
                <datalist id="styles">
                  {STYLE_PRESETS.map(style => <option key={style} value={style} />)}
                </datalist>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">Cảm xúc / Mood</label>
              <input
                type="text"
                placeholder="Ví dụ: Hùng vĩ, Ngon miệng, Sang trọng..."
                className="w-full bg-dark border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                value={inputs.mood}
                onChange={(e) => setInputs({ ...inputs, mood: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">Màu sắc (Color Palette)</label>
              <input
                type="text"
                placeholder="Ví dụ: Neon, Pastel, Đen trắng..."
                className="w-full bg-dark border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                value={inputs.colors}
                onChange={(e) => setInputs({ ...inputs, colors: e.target.value })}
              />
            </div>
             <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">Chi tiết bổ sung (Elements)</label>
                 <input
                  type="text"
                  placeholder="Ánh sáng, bố cục, chất liệu..."
                  className="w-full bg-dark border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  value={inputs.elements}
                  onChange={(e) => setInputs({ ...inputs, elements: e.target.value })}
                />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300 flex items-center justify-between">
              <span>
                 {selectedCategory === GraphicCategory.INFOGRAPHIC || selectedCategory === GraphicCategory.NOTEBOOK_STYLE ? 'Dữ liệu văn bản / Ghi chú (QUAN TRỌNG)' : 'Ghi chú thêm (Additional Info)'}
              </span>
              {(selectedCategory === GraphicCategory.INFOGRAPHIC || selectedCategory === GraphicCategory.NOTEBOOK_STYLE) && <span className="text-[10px] text-orange-400 font-bold uppercase">Nguồn dữ liệu ưu tiên</span>}
            </label>
            <textarea
              placeholder={selectedCategory === GraphicCategory.INFOGRAPHIC || selectedCategory === GraphicCategory.NOTEBOOK_STYLE
                ? "Dán nội dung báo cáo, số liệu thống kê hoặc văn bản cần phân tích vào đây..." 
                : "Ghi chú khác (Ví dụ: Không dùng màu đỏ, thêm logo góc phải...)"}
              className={`w-full bg-dark border rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all ${selectedCategory === GraphicCategory.INFOGRAPHIC || selectedCategory === GraphicCategory.NOTEBOOK_STYLE ? 'border-orange-500/30 h-32' : 'border-slate-600 h-24'}`}
              value={inputs.additionalInfo || ''}
              onChange={(e) => setInputs({ ...inputs, additionalInfo: e.target.value })}
            />
          </div>

          {/* NotebookLM Format Selection */}
          {selectedCategory === GraphicCategory.NOTEBOOK_STYLE && (
            <div className="bg-slate-900/50 p-4 rounded-xl border border-violet-500/30">
               <div className="flex flex-col gap-3">
                  <div>
                    <label className="text-sm font-bold text-white flex items-center gap-2">
                      <Icon name="BookTemplate" size={16} className="text-violet-400"/> Dạng Trình Bày (Notebook Format)
                    </label>
                    <p className="text-xs text-slate-400 mt-1">Chọn kiểu tài liệu tóm tắt bạn muốn tạo.</p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {[
                      { id: 'BRIEFING', label: 'Briefing Doc', icon: 'FileText' },
                      { id: 'FAQ', label: 'FAQ / Hỏi Đáp', icon: 'HelpCircle' },
                      { id: 'TIMELINE', label: 'Timeline', icon: 'Clock' },
                      { id: 'STUDY_GUIDE', label: 'Study Guide', icon: 'ListTodo' }
                    ].map(format => (
                      <button
                        key={format.id}
                        type="button"
                        onClick={() => setInputs(prev => ({ ...prev, notebookFormat: format.id }))}
                        className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition-all text-xs font-bold
                          ${inputs.notebookFormat === format.id 
                            ? 'bg-violet-600 text-white border-violet-500 shadow-lg' 
                            : 'bg-dark border-slate-600 text-slate-400 hover:border-violet-500/50 hover:text-white'}`}
                      >
                        <Icon name={format.icon} size={14} />
                        {format.label}
                      </button>
                    ))}
                  </div>
               </div>
            </div>
          )}

          {/* Aspect Ratio Selector - Only for Infographic */}
          {selectedCategory === GraphicCategory.INFOGRAPHIC && (
             <div className="bg-slate-900/50 p-4 rounded-xl border border-orange-500/30">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                      <label className="text-sm font-bold text-white flex items-center gap-2">
                        <Icon name="Ratio" size={16} className="text-orange-400"/> Khung Hình & Bố Cục
                      </label>
                      <p className="text-xs text-slate-400 mt-1">Chọn hướng trình bày dữ liệu của bạn.</p>
                  </div>
                  <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setInputs(prev => ({ ...prev, selectedRatio: '1:2' }))}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${inputs.selectedRatio === '1:2' ? 'bg-orange-500 text-white border-orange-400 shadow-lg shadow-orange-500/20' : 'bg-dark border-slate-600 text-slate-400 hover:border-slate-500'}`}
                      >
                        <Icon name="Smartphone" size={16} />
                        <span className="text-xs font-bold">Dọc (1:2)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setInputs(prev => ({ ...prev, selectedRatio: '16:9' }))}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${inputs.selectedRatio === '16:9' ? 'bg-orange-500 text-white border-orange-400 shadow-lg shadow-orange-500/20' : 'bg-dark border-slate-600 text-slate-400 hover:border-slate-500'}`}
                      >
                        <Icon name="Monitor" size={16} />
                        <span className="text-xs font-bold">Ngang (16:9)</span>
                      </button>
                  </div>
                </div>
             </div>
          )}

          {/* Prompt Count Selection */}
          <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
             <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                   <label className="text-sm font-bold text-white flex items-center gap-2">
                      <Icon name="Layers" size={16} className="text-primary"/> Số lượng biến thể
                   </label>
                   <p className="text-xs text-slate-400 mt-1">AI sẽ tư duy sâu để tạo ra các prompt khác nhau về góc nhìn/phong cách.</p>
                </div>
                <div className="flex items-center gap-2 bg-dark p-1 rounded-lg border border-slate-600">
                   {[1, 3, 5].map(count => (
                      <button
                        key={count}
                        type="button"
                        onClick={() => setInputs(prev => ({ ...prev, promptCount: count }))}
                        className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${inputs.promptCount === count ? 'bg-primary text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
                      >
                         {count}
                      </button>
                   ))}
                </div>
             </div>
          </div>

          {/* Reference Image and Data File Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Reference Image */}
            <div className="bg-slate-800/50 p-4 rounded-xl border border-dashed border-slate-600">
              <div className="flex flex-col gap-2">
                <div className="flex-1">
                  <label className="text-sm font-medium text-slate-300 flex items-center gap-2 mb-1">
                    <Icon name="ImagePlus" size={16} /> Ảnh tham chiếu
                  </label>
                  <p className="text-xs text-slate-500">Logo/Sản phẩm mẫu.</p>
                </div>
                
                <div className="flex items-center gap-3 w-full">
                  <input 
                    type="file" 
                    ref={referenceInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleReferenceImageUpload}
                  />
                  {inputs.referenceImage ? (
                    <div className="flex items-center gap-3 bg-dark p-2 rounded-lg border border-slate-600 w-full">
                      <img src={inputs.referenceImage} alt="Ref" className="w-10 h-10 object-cover rounded" />
                      <span className="text-xs text-slate-300 truncate flex-1">Đã chọn</span>
                      <button 
                        type="button" 
                        onClick={clearReferenceImage}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Icon name="X" size={16} />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => referenceInputRef.current?.click()}
                      className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs font-medium text-white transition-colors border border-slate-600"
                    >
                      Tải ảnh
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Data File Upload - Highlighted for Infographic & Notebook Style */}
            <div className={`bg-slate-800/50 p-4 rounded-xl border border-dashed transition-all ${selectedCategory === GraphicCategory.INFOGRAPHIC || selectedCategory === GraphicCategory.NOTEBOOK_STYLE ? 'border-orange-500/50 bg-orange-900/10' : 'border-slate-600'}`}>
              <div className="flex flex-col gap-2">
                <div className="flex-1">
                  <label className={`text-sm font-medium flex items-center gap-2 mb-1 ${selectedCategory === GraphicCategory.INFOGRAPHIC || selectedCategory === GraphicCategory.NOTEBOOK_STYLE ? 'text-orange-400' : 'text-slate-300'}`}>
                    <Icon name="FileText" size={16} /> Tải dữ liệu phân tích
                  </label>
                  <p className="text-xs text-slate-500">File Text/CSV/JSON/PDF để AI thống kê.</p>
                </div>
                
                <div className="flex items-center gap-3 w-full">
                  <input 
                    type="file" 
                    ref={dataFileInputRef}
                    className="hidden"
                    accept=".txt,.csv,.json,.md,.pdf"
                    onChange={handleDataFileUpload}
                  />
                  {fileName ? (
                    <div className="flex items-center gap-3 bg-dark p-2 rounded-lg border border-slate-600 w-full">
                      {isReadingFile ? <Icon name="Loader2" size={24} className="text-blue-500 animate-spin" /> : <Icon name="FileCheck" size={24} className="text-green-500" />}
                      <span className="text-xs text-slate-300 truncate flex-1">{fileName}</span>
                      <button 
                        type="button" 
                        onClick={clearDataFile}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Icon name="X" size={16} />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => dataFileInputRef.current?.click()}
                      className={`w-full px-4 py-2 rounded-lg text-xs font-medium transition-colors border ${selectedCategory === GraphicCategory.INFOGRAPHIC || selectedCategory === GraphicCategory.NOTEBOOK_STYLE ? 'bg-orange-600 hover:bg-orange-500 text-white border-orange-400' : 'bg-slate-700 hover:bg-slate-600 text-white border-slate-600'}`}
                    >
                      Tải tệp (.pdf, .txt...)
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isGenerating || isReadingFile}
              className={`w-full py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg
                ${isGenerating || isReadingFile
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-primary to-secondary text-white hover:shadow-primary/50 hover:scale-[1.01] active:scale-[0.99]'
                }`}
            >
              {isGenerating ? (
                <>
                  <Icon name="Loader2" className="animate-spin" /> 
                  {selectedCategory === GraphicCategory.INFOGRAPHIC || selectedCategory === GraphicCategory.NOTEBOOK_STYLE ? 'Đang Phân Tích & Viết Prompt...' : 'Đang Suy Nghĩ & Viết Prompt...'}
                </>
              ) : (
                <>
                  <Icon name={selectedCategory === GraphicCategory.INFOGRAPHIC ? "PieChart" : selectedCategory === GraphicCategory.NOTEBOOK_STYLE ? "StickyNote" : "BrainCircuit"} /> 
                  {selectedCategory === GraphicCategory.INFOGRAPHIC ? 'Phân Tích & Tạo Infographic' : selectedCategory === GraphicCategory.NOTEBOOK_STYLE ? 'Tạo Tài Liệu Notebook Style' : `Tư Duy & Sáng Tạo (${inputs.promptCount} Prompt)`}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PromptBuilder;