import Image from 'next/image';

export function Hero() {
  return (
    <section className="bg-white">
      {/* The banner artwork is self-contained (illustration + copy + store
          badges are all baked into the image), so we let it run edge-to-edge. */}
      <Image
        src="/hero2.webp"
        alt="¿Sabías que tenemos una app? Adéntrate en el universo Mangeki"
        width={2638}
        height={1080}
        unoptimized
        priority
        className="h-auto w-full object-cover"
      />
    </section>
  );
}
