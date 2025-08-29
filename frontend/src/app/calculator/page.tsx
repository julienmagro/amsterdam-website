'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import { calculatorAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

interface CalculationResult {
  result: number;
  expression: string;
  calculation_id: number;
  timestamp: string;
}


export default function CalculatorPage() {
  const { user } = useAuth();
  const [num1, setNum1] = useState<string>('');
  const [num2, setNum2] = useState<string>('');
  const [operation, setOperation] = useState<string>('+');
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('Please log in to use the calculator');
      return;
    }

    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await calculatorAPI.calculate({
        num1: parseFloat(num1),
        num2: parseFloat(num2),
        operation
      });

      setResult(response.data);
    } catch (error: unknown) {
      setError(error.response?.data?.error || 'Calculation failed');
    } finally {
      setIsLoading(false);
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
              Amsterdam Calculator
            </h1>
            <p className="text-xl" style={{ color: 'var(--text-light-gray)' }}>
              Perform calculations and save your calculation history
            </p>
          </div>
        </section>

        {/* Calculator Section */}
        <section className="py-24">
          <div className="calculator-container">
            {!user ? (
              <div className="text-center">
                <h3 className="text-2xl font-semibold mb-4" style={{ color: 'var(--accent-gold)' }}>
                  Login Required
                </h3>
                <p className="mb-6" style={{ color: 'var(--text-light-gray)' }}>
                  Please log in to use the calculator and save your calculation history.
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
            ) : (
              <>
                <h2 className="text-3xl font-semibold mb-8 text-center" style={{ color: 'var(--accent-gold)' }}>
                  Welcome, {user.first_name}!
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="num1" className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-white)' }}>
                        First Number
                      </label>
                      <input
                        type="number"
                        id="num1"
                        value={num1}
                        onChange={(e) => setNum1(e.target.value)}
                        className="form-input"
                        placeholder="Enter first number"
                        required
                        step="any"
                      />
                    </div>

                    <div>
                      <label htmlFor="operation" className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-white)' }}>
                        Operation
                      </label>
                      <select
                        id="operation"
                        value={operation}
                        onChange={(e) => setOperation(e.target.value)}
                        className="form-input"
                      >
                        <option value="+">Addition (+)</option>
                        <option value="-">Subtraction (-)</option>
                        <option value="*">Multiplication (×)</option>
                        <option value="/">Division (÷)</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="num2" className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-white)' }}>
                        Second Number
                      </label>
                      <input
                        type="number"
                        id="num2"
                        value={num2}
                        onChange={(e) => setNum2(e.target.value)}
                        className="form-input"
                        placeholder="Enter second number"
                        required
                        step="any"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Calculating...' : 'Calculate'}
                  </button>
                </form>

                {/* Error Display */}
                {error && (
                  <div className="calc-result error mt-6">
                    <h3 className="text-xl font-semibold mb-2">Error</h3>
                    <p>{error}</p>
                  </div>
                )}

                {/* Result Display */}
                {result && (
                  <div className="calc-result success mt-6">
                    <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-white)' }}>
                      Result
                    </h3>
                    <p className="text-2xl font-bold mb-2" style={{ color: 'var(--accent-gold)' }}>
                      {result.expression}
                    </p>
                    <p className="text-sm opacity-75">
                      Calculated on {new Date(result.timestamp).toLocaleString()}
                    </p>
                  </div>
                )}

                {/* Calculator Info */}
                <div className="mt-8 p-6 rounded-xl" style={{ 
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderLeft: '4px solid var(--accent-gold)'
                }}>
                  <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--accent-gold)' }}>
                    Calculator Features
                  </h3>
                  <ul className="space-y-2" style={{ color: 'var(--text-light-gray)' }}>
                    <li>• <strong>All Operations:</strong> Addition, subtraction, multiplication, and division</li>
                    <li>• <strong>Decimal Support:</strong> Works with both whole numbers and decimals</li>
                    <li>• <strong>History Tracking:</strong> All calculations are saved to your account</li>
                    <li>• <strong>Error Handling:</strong> Division by zero and invalid inputs are handled gracefully</li>
                  </ul>
                  
                  <div className="mt-6">
                    <Link 
                      href="/calculator/history" 
                      className="inline-block py-2 px-4 rounded-xl font-medium transition-all duration-300"
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '2px solid rgba(255, 255, 255, 0.3)',
                        color: 'var(--text-white)'
                      }}
                    >
                      View Calculation History
                    </Link>
                  </div>
                </div>
              </>
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
