'use client';

import { useState } from 'react';
import { auth } from '@/lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push('/missions');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f7f9fc',
      fontFamily: 'Arial, sans-serif'
    }}>
      <section style={{
        width: '100%',
        maxWidth: '400px',
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#202124' }}>
          Create your account
        </h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>
            Email
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.5rem',
                marginTop: '0.3rem',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            />
          </label>

          <label style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>
            Password
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.5rem',
                marginTop: '0.3rem',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            />
          </label>

          {error && (
            <p style={{ color: 'red', marginBottom: '1rem', fontSize: '0.875rem' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            style={{
              padding: '0.75rem',
              backgroundColor: '#1a73e8',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '1rem',
              marginBottom: '1rem'
            }}
          >
            Sign Up
          </button>
        </form>

        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '0.9rem' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: '#1a73e8', textDecoration: 'none' }}>
              Sign in
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
