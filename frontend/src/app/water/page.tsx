'use client';

import { useEffect, useState } from 'react';
import Navigation from '@/components/Navigation';
import { contentAPI } from '@/lib/api';

interface FishSpecies {
  name: string;
  description: string;
}

interface WaterContent {
  intro: string;
  fish_species: FishSpecies[];
  ecosystem_facts: string[];
}

export default function WaterPage() {
  const [content, setContent] = useState<WaterContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadContent = async () => {
      try {
        const response = await contentAPI.getWater();
        setContent(response.data);
      } catch (error) {
        console.error('Failed to load water content:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();
  }, []);

  return (
    <>
      <Navigation />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-24 text-center" style={{ background: 'rgba(0, 0, 0, 0.1)' }}>
          <div className="max-w-3xl mx-auto px-8">
            <h1 className="text-5xl font-semibold mb-6" style={{ color: 'var(--text-white)' }}>
              Amsterdam Water Life
            </h1>
            <p className="text-xl" style={{ color: 'var(--text-light-gray)' }}>
              Explore the aquatic ecosystem of Amsterdam's famous canals
            </p>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-24">
          <div className="max-w-6xl mx-auto px-8">
            {isLoading ? (
              <div className="text-center" style={{ color: 'var(--text-light-gray)' }}>
                <p className="text-xl">Loading water life information...</p>
              </div>
            ) : content ? (
              <>
                {/* Introduction */}
                <div className="text-center mb-12">
                  <p className="text-lg leading-relaxed max-w-3xl mx-auto" style={{ color: 'var(--text-light-gray)' }}>
                    {content.intro}
                  </p>
                </div>

                {/* Fish Species */}
                <div className="mb-16">
                  <h2 className="text-4xl font-semibold text-center mb-8" style={{ color: 'var(--accent-gold)' }}>
                    Fish Species in Amsterdam Canals
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {content.fish_species.map((fish, index) => (
                      <div key={index} className="history-card">
                        <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-white)' }}>
                          {fish.name}
                        </h3>
                        <p className="text-sm" style={{ color: 'var(--text-light-gray)' }}>
                          {fish.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ecosystem Facts */}
                <div>
                  <h2 className="text-4xl font-semibold text-center mb-8" style={{ color: 'var(--accent-gold)' }}>
                    Ecosystem & Conservation
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {content.ecosystem_facts.map((fact, index) => (
                      <div key={index} className="glass-card p-6 text-center">
                        <p className="text-sm" style={{ color: 'var(--text-light-gray)' }}>
                          {fact}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Conservation Info */}
                <div className="mt-16 text-center">
                  <div className="max-w-3xl mx-auto">
                    <p className="text-lg leading-relaxed" style={{ color: 'var(--text-light-gray)' }}>
                      Amsterdam continues to invest in water quality improvements and canal ecosystem preservation, 
                      ensuring that these historic waterways remain a vibrant habitat for aquatic life while 
                      serving the city's transportation and cultural needs.
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center" style={{ color: 'var(--text-light-gray)' }}>
                <p>Failed to load water life content.</p>
              </div>
            )}
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
