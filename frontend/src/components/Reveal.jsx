import { useReveal } from '../lib/useReveal.js';

/**
 * <Reveal> — wrapper que faz fade-in + slide-up quando entra no viewport.
 * Suporta delay para staggering de filhos.
 *
 * Uso:
 *   <Reveal>...</Reveal>
 *   <Reveal delay={100}>...</Reveal>
 *   <Reveal as="section" delay={200}>...</Reveal>
 */
export default function Reveal({ children, delay = 0, as: Tag = 'div', className = '', ...rest }) {
  const [ref, inView] = useReveal();
  const style = delay ? { transitionDelay: `${delay}ms` } : undefined;
  return (
    <Tag
      ref={ref}
      className={`reveal ${inView ? 'reveal-in' : ''} ${className}`}
      style={style}
      {...rest}
    >
      {children}
    </Tag>
  );
}
