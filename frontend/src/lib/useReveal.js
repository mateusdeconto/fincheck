import { useEffect, useRef, useState } from 'react';

/**
 * Hook que retorna [ref, isInView]. Marca o elemento como "revelado"
 * uma única vez quando ele entra no viewport.
 *
 * Usar com a classe `.reveal` no CSS para aplicar a animação.
 */
export function useReveal(options = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true);
            obs.disconnect();
          }
        });
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.1, ...options }
    );

    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return [ref, inView];
}
