import Image from "next/image";
import Link from "next/link";
import Navigation from "@/components/Navigation";

export default function Home() {
  return (
    <>
      <Navigation />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="hero">
          <div className="hero-container">
            <div className="mb-12">
              <Image 
                src="/amsterdam-flag.svg" 
                alt="Amsterdam city flag" 
                width={120}
                height={90}
                className="hero-flag-image mx-auto"
              />
            </div>
            <h1 className="hero-title">Welcome to Amsterdam</h1>
            <p className="hero-subtitle">
              Discover the Venice of the North – a city where history flows through every canal and culture blooms on every corner.
            </p>
            <div className="hero-cta">
              <Link href="/history" className="cta-button">
                Explore History
              </Link>
              <Link href="/water" className="cta-button secondary">
                Discover Water Life
              </Link>
              <Link href="/calculator" className="cta-button">
                Try Calculator
              </Link>
            </div>
          </div>
        </section>

        {/* Intro Section */}
        <section className="py-24" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
          <div className="max-w-3xl mx-auto px-8 text-center">
            <h2 className="text-4xl font-semibold mb-8">A City Like No Other</h2>
            <p className="text-lg leading-relaxed" style={{ color: 'var(--text-light-gray)' }}>
              Welcome to Amsterdam, where 17th-century charm meets modern innovation. 
              With over 100 kilometers of canals, world-class museums, and a vibrant cultural scene, 
              Amsterdam offers an unforgettable experience for every visitor.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer 
        className="py-8 text-center border-t"
        style={{ 
          background: 'rgba(0, 0, 0, 0.2)',
          borderColor: 'rgba(255, 255, 255, 0.1)'
        }}
      >
        <div className="max-w-6xl mx-auto px-8">
          <p className="text-sm" style={{ color: 'var(--text-gray)' }}>
            &copy; 2024 Amsterdam Discovery Site. Built with ❤️ for learning.
          </p>
        </div>
      </footer>
    </>
  );
}