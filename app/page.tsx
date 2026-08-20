import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import DemoCard from '@/components/DemoCard';
import FeatureCard from '@/components/FeatureCard';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <DemoCard />
      <FeatureCard />
      <Footer />
    </main>
  );
}