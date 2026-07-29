import Image from 'next/image';

export interface WordmarkProps {
  variant?: 'color' | 'white';
  className?: string;
}

export function Wordmark({ variant = 'color', className = '' }: WordmarkProps) {
  const filter = variant === 'white' ? 'brightness-0 invert' : '';
  return (
    <Image
      src="/brand/mangeki_logo.svg"
      alt="Mangeki"
      width={274}
      height={69}
      unoptimized
      priority
      className={`${filter} ${className}`.trim()}
    />
  );
}
