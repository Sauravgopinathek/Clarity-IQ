import React from 'react';
import { Info } from 'lucide-react';

type InfoButtonProps = {
  onClick: () => void;
  size?: number;
  color?: string;
  hoverColor?: string;
  title?: string;
};

const buttonStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '4px',
  borderRadius: '6px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.2s ease',
  marginLeft: '6px',
  verticalAlign: 'middle',
};

export default function InfoButton({
  onClick,
  size = 14,
  color = '#64748b',
  hoverColor = '#818cf8',
  title = 'Click for explanation',
}: InfoButtonProps) {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <button
      style={{
        ...buttonStyle,
        backgroundColor: isHovered ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
        transform: isHovered ? 'scale(1.15)' : 'scale(1)',
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={title}
      aria-label={title}
    >
      <Info size={size} color={isHovered ? hoverColor : color} />
    </button>
  );
}
