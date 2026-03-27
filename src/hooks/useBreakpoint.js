import { useEffect, useState } from 'react';

export function useBreakpoint(bp = 960) {
  const [below, setBelow] = useState(
    () => typeof window !== 'undefined' && window.innerWidth <= bp
  );
  useEffect(() => {
    const fn = () => setBelow(window.innerWidth <= bp);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, [bp]);
  return below;
}
