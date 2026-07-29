import Image from 'next/image';

export interface WordmarkProps {
  variant?: 'color' | 'white';
  className?: string;
  priority?: boolean;
}

export function Wordmark({ variant = 'color', className = '', priority = false }: WordmarkProps) {
  const filter = variant === 'white' ? 'brightness-0 invert' : '';
  return (
    <Image
      src="/brand/mangeki_logo.svg"
      alt="Mangeki"
      width={274}
      height={69}
      unoptimized
      priority={priority}
      className={`${filter} ${className}`.trim()}
    />
  );
}
