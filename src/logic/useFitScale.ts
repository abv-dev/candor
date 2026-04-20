import { useLayoutEffect, useRef, useState } from 'react';

export function useFitScale(margin = 32) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    let rafId = 0;
    const measure = () => {
      rafId = 0;
      const prev = el.style.zoom;
      el.style.zoom = '1';
      const natW = el.scrollWidth;
      const natH = el.scrollHeight;
      el.style.zoom = prev;

      const availW = Math.max(300, window.innerWidth - margin);
      const availH = Math.max(300, window.innerHeight - margin);
      const next = Math.min(1, availW / natW, availH / natH);
      setScale((p) => (Math.abs(p - next) < 0.005 ? p : next));
    };
    const schedule = () => { if (!rafId) rafId = requestAnimationFrame(measure); };

    measure();
    const ro = new ResizeObserver(schedule);
    ro.observe(el);
    window.addEventListener('resize', schedule);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      ro.disconnect();
      window.removeEventListener('resize', schedule);
    };
  }, [margin]);

  return { ref, scale };
}
