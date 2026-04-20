import type { CSSProperties, ReactNode } from 'react';
import { useFitScale } from '../logic/useFitScale';

interface Props {
  children: ReactNode;
  className?: string;
}

export function FitToViewport({ children, className }: Props) {
  const { ref, scale } = useFitScale();
  const style: CSSProperties = scale < 1 ? ({ zoom: scale } as CSSProperties) : {};
  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}
