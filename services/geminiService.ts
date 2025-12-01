import { GoogleGenAI, Type, Schema } from "@google/genai";
import { PromptInputs, GraphicCategory } from "../types";
import { CATEGORIES } from "../constants";
import { getStoredApiKeys } from "./storageService";

// Key Management Logic
let apiKeys: string[] = [];
let currentKeyIndex = 0;

// Initialize keys from storage or env
const initializeKeys = () => {
  const storedKeys = getStoredApiKeys();
  if (storedKeys.length > 0) {
    apiKeys = storedKeys;
  } else if (process.env.API_KEY) {
    apiKeys = [process.env.API_KEY];
  }
  currentKeyIndex = 0;
};

// Call init immediately
initializeKeys();

// Allow manual reload of keys (called after settings save)
export const reloadApiKeys = () => {
  initializeKeys();
};

const getClient = (): GoogleGenAI => {
  if (apiKeys.length === 0) {
    throw new Error("Chưa cấu hình API Key. Vui lòng vào Cài đặt để thêm Key.");
  }
  // Wrap index to ensure safety
  if (currentKeyIndex >= apiKeys.length) {
    currentKeyIndex = 0;
  }
  return new GoogleGenAI({ apiKey: apiKeys[currentKeyIndex] });
};

// Retry Wrapper Logic
const executeWithRetry = async <T>(operation: (ai: GoogleGenAI) => Promise<T>): Promise<T> => {
  const startKeyIndex = currentKeyIndex;
  
  // We try as many times as we have keys
  for (let attempt = 0; attempt < apiKeys.length; attempt++) {
    try {
      const ai = getClient();
      return await operation(ai);
    } catch (error: any) {
      const isQuotaError = error.status === 429 || 
                           (error.message && error.message.includes("429")) ||
                           (error.toString().includes("Resource has been exhausted"));

      if (isQuotaError) {
        console.warn(`API Key ending in ...${apiKeys[currentKeyIndex].slice(-4)} exhausted. Switching...`);
        
        // Move to next key
        currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
        
        // If we've circled back to the start key, we're out of options
        if (currentKeyIndex === startKeyIndex) {
          throw new Error("Tất cả API Key đều đã hết hạn ngạch (Quota). Vui lòng thử lại sau.");
        }
        // Loop continues with new key
      } else {
        // If it's not a quota error, throw immediately
        throw error;
      }
    }
  }
  throw new Error("Không thể kết nối đến dịch vụ AI.");
};

const promptDetailsSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    style: { type: Type.STRING, description: "Phong cách nghệ thuật" },
    mood: { type: Type.STRING, description: "Cảm xúc/Bầu không khí" },
    colors: { type: Type.STRING, description: "Bảng màu" },
    elements: { type: Type.STRING, description: "Các yếu tố hình ảnh chính" },
  },
  required: ["style", "mood", "colors", "elements"],
};

const multiPromptSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    prompts: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Danh sách các prompt được tối ưu hóa"
    }
  },
  required: ["prompts"]
};

// Helper to clean JSON string from Markdown code blocks
function cleanJsonString(text: string): string {
  if (!text) return "{}";
  let cleaned = text.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
  return cleaned.trim();
}

export const generateOptimizedPrompt = async (
  category: GraphicCategory,
  inputs: PromptInputs
): Promise<string[]> => {
  if (apiKeys.length === 0) throw new Error("API Key missing");

  const categoryInfo = CATEGORIES.find(c => c.id === category);
  
  const targetAr = (category === GraphicCategory.INFOGRAPHIC && inputs.selectedRatio)
    ? inputs.selectedRatio
    : (categoryInfo?.aspectRatio || '16:9');
    
  const count = inputs.promptCount || 1;

  // Build specialized instructions based on category
  let specificCategoryInstruction = '';
  
  if (category === GraphicCategory.ISOMETRIC) {
    specificCategoryInstruction = `Với loại ISOMETRIC, hãy giữ cấu trúc kỹ thuật Unreal Engine 5/3D Render nhưng thay đổi góc độ ánh sáng hoặc cách bố trí vật thể cho mỗi biến thể.`;
  } else if (category === GraphicCategory.INFOGRAPHIC) {
    const layoutDirection = targetAr === '16:9' ? 'NGANG (Horizontal)' : 'DỌC (Vertical)';
    specificCategoryInstruction = `
    ĐẶC BIỆT CHÚ Ý - CHẾ ĐỘ INFOGRAPHIC (TỰ ĐỘNG PHÂN TÍCH DỮ LIỆU):
    Bạn phải đóng vai trò là một DATA ANALYST (Chuyên gia phân tích) kiêm GRAPHIC DESIGNER.
    
    YÊU CẦU BỐ CỤC (LAYOUT): ${layoutDirection}
    - Nếu là DỌC (1:2): Sắp xếp dữ liệu từ trên xuống dưới, theo luồng kể chuyện (Storytelling flow).
    - Nếu là NGANG (16:9): Sắp xếp dữ liệu từ trái sang phải hoặc chia lưới (Grid layout) dạng Dashboard/Slide trình bày.

    NGUỒN DỮ LIỆU CẦN PHÂN TÍCH:
    1. Nội dung từ file tải lên (nếu có).
    2. QUAN TRỌNG: Nội dung trong trường 'Ghi chú thêm' (Additional Info). Hãy coi đây là văn bản báo cáo thô cần được trực quan hóa.
    
    YÊU CẦU BẮT BUỘC TRONG PROMPT KẾT QUẢ:
    1. TRÍCH XUẤT DỮ LIỆU: Đọc hiểu 'Ghi chú thêm' hoặc 'File', trích xuất ra 3-5 con số, mốc thời gian hoặc luận điểm cốt lõi.
    2. MÔ TẢ CỤ THỂ: Prompt KHÔNG ĐƯỢC chỉ nói chung chung là "vẽ biểu đồ". Prompt PHẢI mô tả nội dung dữ liệu. 
       Ví dụ: Thay vì "một biểu đồ tròn", hãy viết "một biểu đồ tròn 3D hiển thị phân khúc 60% màu đỏ và 40% màu xanh, có nhãn ghi chú nội dung [Nội dung trích xuất từ input]".
    3. CẤU TRÚC: Header (Tiêu đề lớn) -> Body (Các Charts/Blocks) -> Footer.
    
    VISUAL STYLE:
    Sử dụng phong cách: "High-end corporate visualization", "Futuristic data interface", hoặc "Clean minimal vector infographics".
    `;
  } else if (category === GraphicCategory.NOTEBOOK_STYLE) {
    const format = inputs.notebookFormat || 'BRIEFING';
    const formatLabels: Record<string, string> = {
      'BRIEFING': 'TÀI LIỆU TÓM TẮT (Briefing Doc) - Dạng văn bản phân cấp rõ ràng với các thẻ highlight.',
      'FAQ': 'CÂU HỎI THƯỜNG GẶP (FAQ) - Dạng danh sách Accordion hoặc thẻ câu hỏi/trả lời.',
      'TIMELINE': 'DÒNG THỜI GIAN (Timeline) - Trục dọc hoặc ngang với các mốc sự kiện được nối kết.',
      'STUDY_GUIDE': 'HƯỚNG DẪN HỌC TẬP (Study Guide) - Dạng Flashcards hoặc ghi chú bên lề.'
    };

    specificCategoryInstruction = `
    ĐẶC BIỆT CHÚ Ý - PHONG CÁCH GOOGLE NOTEBOOKLM:
    Mục tiêu: Tạo ảnh mô phỏng giao diện tài liệu thông minh (Smart Document UI) giống công cụ NotebookLM của Google.
    
    ĐỊNH DẠNG YÊU CẦU: ${formatLabels[format]}
    
    NGUYÊN TẮC THIẾT KẾ (MATERIAL DESIGN 3):
    1. Nền: Màu trắng sạch hoặc xám rất nhạt (#F9F9F9).
    2. Accent Colors: Sử dụng màu Pastel (Tím hoa cà, Xanh mint, Hồng phấn) để làm highlight hoặc nền cho các "Cards".
    3. Typography: Sans-serif hiện đại (như Google Sans, Inter), đen đậm cho tiêu đề, xám đen cho nội dung.
    4. Bố cục: Sử dụng "Card UI" (Giao diện dạng thẻ) với bo góc tròn (Rounded corners - 16px/24px) và đổ bóng cực nhẹ (Soft shadow).
    5. Nội dung:
       - Phải trích xuất dữ liệu từ 'Ghi chú thêm' hoặc 'File' để điền vào mockup.
       - Hiển thị các đoạn text giả lập (Lorem ipsum hoặc tóm tắt ngắn) được tổ chức khoa học.
    
    YÊU CẦU PROMPT:
    Mô tả một giao diện người dùng kỹ thuật số (Digital UI Mockup) hiển thị tài liệu [${format}]. Chi tiết về các khối văn bản, tiêu đề đậm, các thẻ ghi chú màu pastel trôi nổi. Cảm giác thông minh, sạch sẽ, công nghệ cao nhưng thân thiện.
    `;
  } else {
    specificCategoryInstruction = `Đảm bảo tuân thủ bố cục chuẩn của ${categoryInfo?.label}.`;
  }

  let refImageInstruction = "";
  if (inputs.referenceImage) {
    refImageInstruction = "Người dùng CÓ cung cấp ảnh tham chiếu (Logo/Sản phẩm). Hãy đảm bảo mọi prompt đều có hướng dẫn kết hợp ảnh tham chiếu này một cách tự nhiên.";
  }

  const systemInstruction = `
    Bạn là một Chuyên gia Prompt Engineering (Prompt Master) với tư duy thiết kế sâu sắc.
    
    NHIỆM VỤ:
    Phân tích yêu cầu người dùng, sau đó suy nghĩ sâu để tạo ra **${count} PROMPT KHÁC NHAU**.
    Mục tiêu là cung cấp cho người dùng nhiều lựa chọn sáng tạo từ cùng một chủ đề gốc.
    
    YÊU CẦU CHO CÁC BIẾN THỂ (Nếu số lượng > 1):
    - Prompt 1: Bám sát nhất với mô tả gốc và DỮ LIỆU CUNG CẤP, tập trung vào sự chính xác.
    - Prompt 2 (nếu có): Thử nghiệm phong cách nghệ thuật ấn tượng hơn (Lighting, Composition đột phá).
    - Prompt 3 (nếu có): Trừu tượng hóa hoặc thay đổi góc nhìn (Camera angle) để tạo sự mới lạ.
    - Prompt 4-5 (nếu có): Thay đổi bảng màu hoặc mood để tạo cảm giác hoàn toàn khác biệt nhưng vẫn giữ đúng chủ đề.

    CẤU TRÚC PROMPT (Tiếng Việt):
    - [Loại ấn phẩm] + [Chủ đề chi tiết] + [Mô tả dữ liệu/Thống kê cụ thể (nếu có)] + [Mô tả thị giác/Bố cục] + [Ánh sáng/Màu sắc] + [Thông số kỹ thuật/Render style] + --ar ${targetAr}
    
    ${specificCategoryInstruction}
    ${refImageInstruction}
    
    Đầu ra bắt buộc là JSON theo định dạng: { "prompts": ["string", "string", ...] }
  `;

  const userContent = `
    Chủ đề: ${inputs.subject}
    Phong cách mong muốn: ${inputs.style}
    Cảm xúc: ${inputs.mood}
    Màu sắc: ${inputs.colors}
    Chi tiết: ${inputs.elements}
    
    DỮ LIỆU ĐẦU VÀO ĐỂ PHÂN TÍCH (Ưu tiên cho Infographic/Notebook):
    1. Nội dung File: """${inputs.dataFileContent || "Không có"}"""
    2. Ghi chú/Dữ liệu văn bản thêm: """${inputs.additionalInfo || "Không có"}"""
    
    Hãy tạo ra ${count} prompt Tiếng Việt chất lượng cao.
  `;

  return executeWithRetry(async (ai) => {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userContent,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.8,
        responseMimeType: "application/json",
        responseSchema: multiPromptSchema
      }
    });

    const text = response.text;
    if (!text) return ["Không thể tạo nội dung."];

    const parsed = JSON.parse(cleanJsonString(text));
    return parsed.prompts || ["Lỗi định dạng phản hồi."];
  });
};

export const generatePreviewImage = async (prompt: string, aspectRatio: string = "1:1", referenceImageBase64?: string): Promise<string> => {
  if (apiKeys.length === 0) throw new Error("API Key missing");

  return executeWithRetry(async (ai) => {
    const parts: any[] = [{ text: prompt }];
    
    if (referenceImageBase64) {
      const base64Data = referenceImageBase64.split(',')[1] || referenceImageBase64;
      parts.unshift({
        inlineData: {
          mimeType: 'image/png',
          data: base64Data
        }
      });
      parts[1].text = "Dựa trên hình ảnh tham chiếu này: " + prompt;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts },
      config: {
        imageConfig: {
           aspectRatio: aspectRatio
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image data returned");
  });
};

export const suggestDetailsFromSubject = async (subject: string, category: string): Promise<Partial<PromptInputs>> => {
  if (apiKeys.length === 0 || !subject) return {};
  
  return executeWithRetry(async (ai) => {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Gợi ý chi tiết thiết kế đồ họa cho loại ấn phẩm "${category}" với chủ đề: "${subject}".`,
      config: {
        responseMimeType: "application/json",
        responseSchema: promptDetailsSchema,
        systemInstruction: "Bạn là một Giám đốc Sáng tạo. Trả về JSON Tiếng Việt hợp lệ."
      }
    });

    const text = response.text;
    if (text) {
      try {
        return JSON.parse(cleanJsonString(text)) as Partial<PromptInputs>;
      } catch (parseError) {
        return {};
      }
    }
    return {};
  });
};

export const extractDetailsFromImage = async (base64Image: string): Promise<Partial<PromptInputs>> => {
  if (apiKeys.length === 0) return {};

  return executeWithRetry(async (ai) => {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', 
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/png', data: base64Image.split(',')[1] } },
          { text: "Phân tích hình ảnh này và trích xuất các thuộc tính thiết kế. Trả về JSON Tiếng Việt." }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: promptDetailsSchema
      }
    });

    const text = response.text;
    if (text) {
      try {
        return JSON.parse(cleanJsonString(text)) as Partial<PromptInputs>;
      } catch (parseError) {
        return {};
      }
    }
    return {};
  });
};