
import React, { useEffect } from 'react';
import Icon from './Icon';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (isOpen && (window as any).lucide) {
      (window as any).lucide.createIcons();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-opacity duration-300">
      <div className="bg-surface border border-slate-700 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto flex flex-col relative animate-[fade-in_0.3s_ease-out]">
        {/* Header */}
        <div className="p-6 border-b border-slate-700 flex justify-between items-center sticky top-0 bg-surface z-10">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Icon name="BookOpen" className="text-primary" size={24} /> Hướng Dẫn Sử Dụng
          </h2>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-white transition-colors p-1 rounded-md hover:bg-slate-700"
          >
            <Icon name="X" size={24} />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-8 overflow-y-auto custom-scrollbar">
          {/* Step 1 */}
          <div className="flex gap-4 group">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-800 border border-primary/50 text-primary flex items-center justify-center font-bold text-lg shadow-lg group-hover:bg-primary group-hover:text-white transition-colors">1</div>
            <div>
              <h3 className="font-bold text-white text-lg mb-2 group-hover:text-primary transition-colors">Chọn Loại Ấn Phẩm</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Bắt đầu bằng việc chọn đúng loại hình bạn muốn thiết kế (Poster, Banner, Menu, v.v.). 
                <br/>
                <span className="text-xs text-slate-500 italic mt-1 block">
                  *Mỗi loại sẽ có tỷ lệ khung hình chuẩn riêng (ví dụ: Menu là dọc 3:4, Banner Travel là ngang 16:9).
                </span>
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-4 group">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-800 border border-secondary/50 text-secondary flex items-center justify-center font-bold text-lg shadow-lg group-hover:bg-secondary group-hover:text-white transition-colors">2</div>
            <div>
              <h3 className="font-bold text-white text-lg mb-2 group-hover:text-secondary transition-colors">Nhập Thông Tin Thông Minh</h3>
              <p className="text-slate-400 text-sm mb-3">
                Nhập chủ đề chính (ví dụ: "Poster nhạc Jazz"). Bạn có 3 cách để điền chi tiết:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                   <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs mb-1">
                     <Icon name="PenTool" size={14}/> Thủ công
                   </div>
                   <p className="text-xs text-slate-500">Tự nhập ý tưởng của bạn vào các ô.</p>
                </div>
                <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                   <div className="flex items-center gap-2 text-pink-400 font-semibold text-xs mb-1">
                     <Icon name="Sparkles" size={14}/> Gợi ý AI
                   </div>
                   <p className="text-xs text-slate-500">Nhấn "Gợi ý" để AI tự điền Phong cách & Màu sắc.</p>
                </div>
                <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 col-span-1 sm:col-span-2">
                   <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs mb-1">
                     <Icon name="ScanEye" size={14}/> Quét ảnh mẫu
                   </div>
                   <p className="text-xs text-slate-500">Tải ảnh mẫu lên để AI học hỏi phong cách từ đó.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-4 group">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-800 border border-orange-500/50 text-orange-500 flex items-center justify-center font-bold text-lg shadow-lg group-hover:bg-orange-500 group-hover:text-white transition-colors">3</div>
            <div>
              <h3 className="font-bold text-white text-lg mb-2 group-hover:text-orange-500 transition-colors">Ảnh Tham Chiếu (Nâng Cao)</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Nếu bạn muốn thiết kế có chứa <strong>Logo, Mã QR, hoặc Hình sản phẩm</strong> cụ thể:
                <br/>
                Hãy tải ảnh lên ở mục <strong>"Ảnh tham chiếu"</strong> cuối form. AI sẽ cố gắng lồng ghép ảnh này vào bản xem trước một cách tự nhiên nhất.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex gap-4 group">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-800 border border-blue-500/50 text-blue-500 flex items-center justify-center font-bold text-lg shadow-lg group-hover:bg-blue-500 group-hover:text-white transition-colors">4</div>
            <div>
              <h3 className="font-bold text-white text-lg mb-2 group-hover:text-blue-500 transition-colors">Tạo & Trực Quan Hóa</h3>
              <ul className="space-y-2 text-slate-400 text-sm list-disc list-inside">
                <li>Nhấn nút <span className="text-white font-bold bg-gradient-to-r from-primary to-secondary px-2 py-0.5 rounded text-xs">Tạo Prompt Ngay</span> để nhận đoạn lệnh chi tiết.</li>
                <li>Sau đó nhấn <span className="text-white font-bold bg-slate-700 px-2 py-0.5 rounded text-xs">Xem trước hình ảnh (AI)</span> để Gemini vẽ phác thảo ngay lập tức.</li>
                <li>Bạn có thể sao chép prompt để dùng trên Midjourney, Leonardo.ai hoặc tải ảnh về máy.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-700 bg-slate-800/50">
          <button 
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 text-white rounded-xl font-bold transition-all transform hover:scale-[1.01] active:scale-[0.99] shadow-lg"
          >
            Đã Hiểu, Bắt Đầu Ngay!
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuideModal;
