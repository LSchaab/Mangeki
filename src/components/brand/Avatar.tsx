import Image from 'next/image';

export interface AvatarProps {
  src?: string;
  alt: string;
  size?: number;
}

export function Avatar({ src = '/brand/profile_icon.svg', alt, size = 40 }: AvatarProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      unoptimized
      className="rounded-full object-cover"
    />
  );
}
