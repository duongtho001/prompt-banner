import React, { useEffect, useState } from 'react';
import { GeneratedResult } from '../types';
import { getLibrary, removeFromLibrary } from '../services/storageService';
import { CATEGORIES } from '../constants';
import Icon from './Icon';

interface LibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (result: GeneratedResult) => void;
}

const LibraryModal: React.FC<LibraryModalProps> = ({ isOpen, onClose, onSelect }) => {
  const [items, setItems] = useState<GeneratedResult[]>([]);
  const [filter, setFilter] = useState<string>('ALL');

  useEffect(() => {
    if (isOpen) {
      setItems(getLibrary());
      if ((window as any).lucide) {
        setTimeout(() => (window as any).lucide.createIcons(), 100);
      }
    }
  }, [isOpen]);

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Bạn có chắc chắn muốn xóa thiết kế này không?")) {
      const updated = removeFromLibrary(id);
      setItems(updated);
    }
  };

  const filteredItems = filter === 'ALL' ? items : items.filter(item => item.category === filter);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md transition-opacity duration-300">
      <div className="bg-surface border border-slate-700 rounded-2xl shadow-2xl max-w-6xl w-full h-[90vh] flex flex-col overflow-hidden animate-fade-in-up">
        <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 rounded-lg">
              <Icon name="Library" className="text-indigo-400" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Thư Viện Thiết Kế</h2>
              <p className="text-xs text-slate-400">Lưu trữ {items.length} bộ prompt gần nhất</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-700"
          >
            <Icon name="X" size={24} />
          </button>
        </div>

        <div className="px-6 py-3 border-b border-slate-700 overflow-x-auto flex gap-2 bg-slate-800/30 no-scrollbar">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all
              ${filter === 'ALL' ? 'bg-white text-slate-900' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
          >
            Tất cả
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2
                ${filter === cat.id 
                  ? `bg-gradient-to-r ${cat.gradient} text-white shadow-lg` 
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
            >
              <Icon name={cat.icon} size={12} />
              {cat.label}
            </button>
          ))}
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 bg-dark/50 custom-scrollbar">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4">
              <Icon name="Ghost" size={64} className="opacity-20" />
              <p>Chưa có thiết kế nào được lưu.</p>
              <button onClick={onClose} className="text-primary hover:underline">Tạo ngay thiết kế đầu tiên!</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => {
                const categoryInfo = CATEGORIES.find(c => c.id === item.category);
                // Handle both array and legacy string format
                const displayPrompt = Array.isArray(item.prompts) ? item.prompts[0] : (item as any).optimizedPrompt || "";
                
                return (
                  <div 
                    key={item.id}
                    onClick={() => onSelect(item)}
                    className="group bg-surface border border-slate-700 rounded-xl overflow-hidden hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 transition-all cursor-pointer flex flex-col h-[320px]"
                  >
                    <div className="h-40 bg-slate-900 relative overflow-hidden">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt="Preview" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${categoryInfo?.gradient || 'from-slate-700 to-slate-800'} opacity-30 group-hover:opacity-50 transition-opacity flex items-center justify-center`}>
                           <Icon name={categoryInfo?.icon || 'Image'} size={48} className="text-white/50" />
                        </div>
                      )}
                      
                      <div className="absolute top-3 left-3">
                        <span className="px-2 py-1 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-bold text-white border border-white/10 uppercase tracking-wide">
                          {categoryInfo?.label}
                        </span>
                      </div>

                      <button 
                        onClick={(e) => handleDelete(e, item.id)}
                        className="absolute top-3 right-3 p-2 bg-red-500/80 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        title="Xóa"
                      >
                        <Icon name="Trash2" size={14} />
                      </button>
                    </div>

                    <div className="p-4 flex flex-col flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-white text-sm line-clamp-1" title={item.originalInputs.subject}>
                          {item.originalInputs.subject}
                        </h3>
                        <span className="text-[10px] text-slate-500 whitespace-nowrap ml-2">
                           {new Date(item.createdAt).toLocaleDateString('vi-VN', {day: '2-digit', month: '2-digit'})}
                        </span>
                      </div>
                      
                      <p className="text-xs text-slate-400 line-clamp-3 mb-4 font-mono bg-slate-900/50 p-2 rounded border border-slate-800 flex-1">
                        {displayPrompt}
                      </p>

                      <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-800">
                         <span className="flex items-center gap-1">
                           <Icon name="Layers" size={12} /> {Array.isArray(item.prompts) ? item.prompts.length : 1} biến thể
                         </span>
                         <span className="text-primary group-hover:translate-x-1 transition-transform flex items-center gap-1">
                           Chi tiết <Icon name="ArrowRight" size={12} />
                         </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LibraryModal;