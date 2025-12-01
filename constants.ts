import { GraphicCategory } from './types';

export const CATEGORIES = [
  {
    id: GraphicCategory.NOTEBOOK_STYLE,
    label: 'NotebookLM Style',
    description: 'Giao diện tài liệu thông minh, sạch sẽ, tối giản theo phong cách Google Material Design.',
    icon: 'StickyNote',
    gradient: 'from-violet-400 to-fuchsia-300', // Pastel purple/pink vibe typical of NotebookLM
    aspectRatio: '3:4' // Document format
  },
  {
    id: GraphicCategory.INFOGRAPHIC,
    label: 'Infographic Phân Tích',
    description: 'Đồ họa thông tin chuyên sâu, trực quan hóa số liệu và dữ liệu phức tạp.',
    icon: 'PieChart', // PieChart icon matches well
    gradient: 'from-orange-500 to-red-500',
    aspectRatio: '1:2' // Long vertical format typical for infographics
  },
  {
    id: GraphicCategory.POSTER,
    label: 'Poster Quảng Cáo',
    description: 'Áp phích sự kiện, phim ảnh, tuyên truyền với bố cục mạnh mẽ.',
    icon: 'FilePoster',
    gradient: 'from-purple-500 to-indigo-500',
    aspectRatio: '3:4'
  },
  {
    id: GraphicCategory.BANNER,
    label: 'Banner Website',
    description: 'Banner web, social media cover, quảng cáo hiển thị ngang.',
    icon: 'Flag',
    gradient: 'from-blue-400 to-cyan-500',
    aspectRatio: '16:9'
  },
  {
    id: GraphicCategory.TRAVEL,
    label: 'Banner Du Lịch',
    description: 'Quảng bá tour, điểm đến, phong cảnh hùng vĩ và ưu đãi hấp dẫn.',
    icon: 'Plane',
    gradient: 'from-sky-400 to-blue-600',
    aspectRatio: '16:9'
  },
  {
    id: GraphicCategory.MENU,
    label: 'Menu Nhà Hàng',
    description: 'Thực đơn món ăn, đồ uống cho nhà hàng, cafe, quán bar.',
    icon: 'Utensils',
    gradient: 'from-orange-400 to-amber-500',
    aspectRatio: '3:4'
  },
  {
    id: GraphicCategory.CARD,
    label: 'Thiệp Chúc Mừng',
    description: 'Thiệp cưới, sinh nhật, lễ tết, thiệp mời sự kiện trang trọng.',
    icon: 'Gift',
    gradient: 'from-red-400 to-pink-500',
    aspectRatio: '3:4'
  },
  {
    id: GraphicCategory.NEWSPAPER,
    label: 'Dàn Trang Báo',
    description: 'Bố cục tạp chí, newsletter, thiết kế typography biên tập.',
    icon: 'Newspaper',
    gradient: 'from-emerald-400 to-teal-500',
    aspectRatio: '3:4'
  },
  {
    id: GraphicCategory.COVER,
    label: 'Bìa Sách / Album',
    description: 'Bìa sách, bìa album nhạc, podcast artwork.',
    icon: 'BookOpen',
    gradient: 'from-rose-400 to-red-500',
    aspectRatio: '1:1'
  },
  {
    id: GraphicCategory.ARTWORK,
    label: 'Digital Artwork',
    description: 'Minh họa kỹ thuật số, concept art, tranh vẽ nghệ thuật.',
    icon: 'Palette',
    gradient: 'from-pink-500 to-fuchsia-500',
    aspectRatio: '16:9'
  },
  {
    id: GraphicCategory.ISOMETRIC,
    label: '3D Isometric Info',
    description: 'Đồ họa thông tin 3D góc nhìn đẳng trắc, phong cách Unreal Engine 5.',
    icon: 'Box',
    gradient: 'from-violet-500 to-purple-600',
    aspectRatio: '16:9'
  }
];

export const STYLE_PRESETS = [
  'Data Visualization (Trực quan hóa dữ liệu)',
  'Material Design 3 (Google Style)',
  'Minimalist (Tối giản)',
  'Clean UI Interface (Giao diện sạch)',
  'Luxury (Sang trọng)',
  'Modern Tropical (Nhiệt đới hiện đại)',
  'Cyberpunk (Tương lai)',
  'Vintage / Retro (Cổ điển)',
  'Abstract (Trừu tượng)',
  'Corporate (Doanh nghiệp)',
  'Typography-heavy (Tập trung chữ)',
  'Surrealism (Siêu thực)',
  '3D Render Food (Chụp ảnh món ăn 3D)',
  'Calligraphy / Hand-drawn (Viết tay nghệ thuật)',
  'Paper Cutout (Cắt giấy)'
];