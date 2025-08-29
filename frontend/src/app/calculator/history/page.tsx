'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { calculatorAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

interface Calculation {
  id: number;
  expression: string;
  result: number;
  timestamp: string;
}

interface HistoryData {
  calculations: Calculation[];
  statistics: {
    total: number;
    operations: { [key: string]: number };
  };
}

export default function CalculationHistoryPage() {
  const { user } = useAuth();
  const [historyData, setHistoryData] = useState<HistoryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await calculatorAPI.getHistory();
        setHistoryData(response.data);
      } catch (error: unknown) {
        setError(error.response?.data?.error || 'Failed to load calculation history');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [user]);

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getOperationSymbol = (operation: string) => {
    switch (operation) {
      case '+': return '+';
      case '-': return '−';
      case '*': return '×';
      case '/': return '÷';
      default: return operation;
    }
  };

  const getOperationName = (operation: string) => {
    switch (operation) {
      case '+': return 'Addition';
      case '-': return 'Subtraction';
      case '*': return 'Multiplication';
      case '/': return 'Division';
      default: return operation;
    }
  };

  return (
    <>
      <Navigation />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-24 text-center" style={{ background: 'rgba(0, 0, 0, 0.1)' }}>
          <div className="max-w-3xl mx-auto px-8">
            <h1 className="text-5xl font-semibold mb-6" style={{ color: 'var(--text-white)' }}>
              Calculation History
            </h1>
            <p className="text-xl" style={{ color: 'var(--text-light-gray)' }}>
              Review all your past calculations and statistics
            </p>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-24">
          <div className="max-w-6xl mx-auto px-8">
            {!user ? (
              <div className="text-center">
                <div className="auth-container">
                  <h3 className="text-2xl font-semibold mb-4" style={{ color: 'var(--accent-gold)' }}>
                    Login Required
                  </h3>
                  <p className="mb-6" style={{ color: 'var(--text-light-gray)' }}>
                    Please log in to view your calculation history.
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Link href="/login" className="cta-button">
                      Login
                    </Link>
                    <Link href="/register" className="cta-button secondary">
                      Sign Up
                    </Link>
                  </div>
                </div>
              </div>
            ) : isLoading ? (
              <div className="text-center">
                <div className="glass-card">
                  <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--accent-gold)' }}>
                    Loading History...
                  </h3>
                  <p style={{ color: 'var(--text-light-gray)' }}>
                    Fetching your calculation data
                  </p>
                </div>
              </div>
            ) : error ? (
              <div className="text-center">
                <div className="glass-card">
                  <h3 className="text-xl font-semibold mb-4" style={{ color: '#ff6b6b' }}>
                    Error Loading History
                  </h3>
                  <p className="mb-6" style={{ color: 'var(--text-light-gray)' }}>
                    {error}
                  </p>
                  <Link href="/calculator" className="cta-button">
                    Back to Calculator
                  </Link>
                </div>
              </div>
            ) : historyData && historyData.calculations.length === 0 ? (
              <div className="text-center">
                <div className="glass-card">
                  <h3 className="text-2xl font-semibold mb-4" style={{ color: 'var(--accent-gold)' }}>
                    No Calculations Yet
                  </h3>
                  <p className="mb-6" style={{ color: 'var(--text-light-gray)' }}>
                    You haven't performed any calculations yet. Start calculating to see your history here!
                  </p>
                  <Link href="/calculator" className="cta-button">
                    Go to Calculator
                  </Link>
                </div>
              </div>
            ) : historyData ? (
              <>
                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                  <div className="glass-card text-center">
                    <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--accent-gold)' }}>
                      Total Calculations
                    </h3>
                    <p className="text-3xl font-bold" style={{ color: 'var(--text-white)' }}>
                      {historyData.statistics.total}
                    </p>
                  </div>
                  
                  {Object.entries(historyData.statistics.operations).map(([operation, count]) => (
                    <div key={operation} className="glass-card text-center">
                      <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--accent-gold)' }}>
                        {getOperationName(operation)}
                      </h3>
                      <p className="text-3xl font-bold" style={{ color: 'var(--text-white)' }}>
                        {count}
                      </p>
                      <p className="text-sm opacity-75" style={{ color: 'var(--text-light-gray)' }}>
                        {getOperationSymbol(operation)} operations
                      </p>
                    </div>
                  ))}
                </div>

                {/* Calculations Table */}
                <div className="glass-card">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold" style={{ color: 'var(--accent-gold)' }}>
                      Recent Calculations
                    </h2>
                    <Link href="/calculator" className="cta-button secondary">
                      New Calculation
                    </Link>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr style={{ borderBottom: '2px solid rgba(255, 255, 255, 0.1)' }}>
                          <th className="text-left py-3 px-4 font-semibold" style={{ color: 'var(--text-white)' }}>
                            Expression
                          </th>
                          <th className="text-left py-3 px-4 font-semibold" style={{ color: 'var(--text-white)' }}>
                            Result
                          </th>
                          <th className="text-left py-3 px-4 font-semibold" style={{ color: 'var(--text-white)' }}>
                            Date & Time
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {historyData.calculations.map((calc, index) => (
                          <tr 
                            key={calc.id}
                            style={{ 
                              borderBottom: index < historyData.calculations.length - 1 ? '1px solid rgba(255, 255, 255, 0.05)' : 'none'
                            }}
                          >
                            <td className="py-4 px-4">
                              <span className="font-mono text-lg" style={{ color: 'var(--text-white)' }}>
                                {calc.expression}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <span className="font-bold text-xl" style={{ color: 'var(--accent-gold)' }}>
                                {calc.result}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <span className="text-sm" style={{ color: 'var(--text-light-gray)' }}>
                                {formatDate(calc.timestamp)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : null}
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
