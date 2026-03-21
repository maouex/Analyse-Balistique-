import { type ReactNode, type CSSProperties } from 'react';
import './GlitchText.css';

interface GlitchTextProps {
  children: ReactNode;
  speed?: number;
  enableShadows?: boolean;
  enableOnHover?: boolean;
  className?: string;
}

export default function GlitchText({
  children,
  speed = 1,
  enableShadows = true,
  enableOnHover = false,
  className = '',
}: GlitchTextProps) {
  const inlineStyles = {
    '--after-duration': `${speed * 3}s`,
    '--before-duration': `${speed * 2}s`,
    '--after-shadow': enableShadows ? '-5px 0 #ff0040' : 'none',
    '--before-shadow': enableShadows ? '5px 0 #00e5ff' : 'none',
  } as CSSProperties;

  const hoverClass = enableOnHover ? 'enable-on-hover' : '';

  return (
    <div
      className={`glitch ${hoverClass} ${className}`}
      style={inlineStyles}
      data-text={typeof children === 'string' ? children : undefined}
    >
      {children}
    </div>
  );
}
