import React, { useState, useEffect } from 'react';
import Icon from './Icon';
import { getStoredApiKeys, saveApiKeys } from '../services/storageService';
import { reloadApiKeys } from '../services/geminiService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [keysInput, setKeysInput] = useState('');
  
  useEffect(() => {
    if (isOpen) {
      const keys = getStoredApiKeys();
      setKeysInput(keys.join('\n'));
      if ((window as any).lucide) {
        setTimeout(() => (window as any).lucide.createIcons(), 100);
      }
    }
  }, [isOpen]);

  const handleSave = () => {
    const keysArray = keysInput.split('\n');
    saveApiKeys(keysArray);
    reloadApiKeys(); // Notify service to update
    alert("Đã lưu cấu hình API Key thành công!");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-opacity duration-300">
      <div className="bg-surface border border-slate-700 rounded-2xl shadow-2xl max-w-lg w-full flex flex-col animate-[fade-in_0.3s_ease-out]">
        {/* Header */}
        <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-900/50 rounded-t-2xl">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Icon name="Settings" className="text-slate-400" size={24} /> Cài Đặt API
          </h2>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-white transition-colors p-1 rounded-md hover:bg-slate-700"
          >
            <Icon name="X" size={24} />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg">
             <h3 className="text-sm font-bold text-blue-400 mb-1 flex items-center gap-2">
                <Icon name="Info" size={16}/> Cơ chế hoạt động
             </h3>
             <p className="text-xs text-slate-400 leading-relaxed">
                Hệ thống hỗ trợ nhập nhiều API Key. Nếu một Key bị hết hạn ngạch (Lỗi 429), hệ thống sẽ <strong>tự động chuyển sang Key tiếp theo</strong> trong danh sách để đảm bảo quá trình tạo không bị gián đoạn.
             </p>
          </div>

          <div className="space-y-2">
             <label className="block text-sm font-bold text-slate-300">Danh sách Gemini API Key</label>
             <p className="text-xs text-slate-500">Nhập mỗi key trên một dòng.</p>
             <textarea 
               value={keysInput}
               onChange={(e) => setKeysInput(e.target.value)}
               placeholder="AIzaSy..."
               className="w-full h-48 bg-dark border border-slate-600 rounded-lg p-4 text-sm font-mono text-white placeholder-slate-600 focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
             />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-700 bg-slate-800/50 rounded-b-2xl flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-slate-400 hover:text-white font-medium text-sm transition-colors"
          >
            Hủy bỏ
          </button>
          <button 
            onClick={handleSave}
            className="px-6 py-2 bg-gradient-to-r from-primary to-secondary hover:shadow-lg text-white rounded-lg font-bold text-sm transition-all transform hover:scale-105"
          >
            Lưu Cấu Hình
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;