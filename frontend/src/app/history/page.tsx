'use client';

import { useEffect, useState } from 'react';
import Navigation from '@/components/Navigation';
import { contentAPI } from '@/lib/api';

interface HistoryFact {
  title: string;
  content: string;
}

export default function HistoryPage() {
  const [facts, setFacts] = useState<HistoryFact[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadFacts = async () => {
      try {
        const response = await contentAPI.getHistory();
        setFacts(response.data.facts);
      } catch (error) {
        console.error('Failed to load history facts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFacts();
  }, []);

  return (
    <>
      <Navigation />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-24 text-center" style={{ background: 'rgba(0, 0, 0, 0.1)' }}>
          <div className="max-w-3xl mx-auto px-8">
            <h1 className="text-5xl font-semibold mb-6" style={{ color: 'var(--text-white)' }}>
              Amsterdam History Fun Facts
            </h1>
            <p className="text-xl" style={{ color: 'var(--text-light-gray)' }}>
              Discover the fascinating stories behind the Venice of the North
            </p>
          </div>
        </section>

        {/* Facts Section */}
        <section className="py-24">
          <div className="max-w-6xl mx-auto px-8">
            {isLoading ? (
              <div className="text-center" style={{ color: 'var(--text-light-gray)' }}>
                <p className="text-xl">Loading fascinating Amsterdam history...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {facts.map((fact, index) => (
                  <div key={index} className="glass-card p-8">
                    <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--accent-gold)' }}>
                      {fact.title}
                    </h3>
                    <p className="leading-relaxed" style={{ color: 'var(--text-light-gray)' }}>
                      {fact.content}
                    </p>
                  </div>
                ))}
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
