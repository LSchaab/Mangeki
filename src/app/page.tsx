import { Hero } from '@/components/home/Hero';
import { Descripcion } from '@/components/home/Descripcion';
import { ValuesBand } from '@/components/home/ValuesBand';
import { Tendencias } from '@/components/home/Tendencias';
import { Actualizaciones } from '@/components/home/Actualizaciones';
import { TopAutores } from '@/components/home/TopAutores';
import { Newsletter } from '@/components/home/Newsletter';

export default function Home() {
  return (
    <>
      <Hero />
      <Descripcion />
      <ValuesBand />
      <Tendencias />
      <Actualizaciones />
      <TopAutores />
      <Newsletter />
    </>
  );
}
