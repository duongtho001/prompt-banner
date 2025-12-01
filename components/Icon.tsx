import React, { useEffect } from 'react';

// Simple wrapper to render icons since we are using the script tag version of Lucide
// In a real build environment, we would import { Name } from 'lucide-react'
interface IconProps {
  name: string;
  className?: string;
  size?: number;
}

const Icon: React.FC<IconProps> = ({ name, className = "", size = 24 }) => {
  // We use a data attribute to identify icons for replacement
  return <i data-lucide={name} className={className} style={{ width: size, height: size, display: 'inline-block' }}></i>;
};

export default Icon;
