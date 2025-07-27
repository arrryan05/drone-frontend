'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });

    return () => unsubscribe(); // cleanup on unmount
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  return (
    <html lang="en">
      <head />
      <body style={{ margin: 0, fontFamily: 'Arial, sans-serif' }}>
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '56px',
          padding: '0 1.5rem',
          backgroundColor: '#003366',
          color: 'white',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          fontSize: '0.9rem'
        }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', color: 'white', textDecoration: 'none' }}>
            <span style={{ fontSize: '1.25rem', marginRight: '0.5rem' }}>🚀</span>
            <span style={{ fontWeight: 600 }}>Drone Mission Manager</span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link
              href="/missions"
              style={{
                color: 'white',
                textDecoration: 'none',
                padding: '0.25rem 0.5rem',
                borderRadius: '4px',
                transition: 'background-color 0.2s',
                cursor: 'pointer'
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              Missions
            </Link>
            <Link
              href="/reports"
              style={{
                color: 'white',
                textDecoration: 'none',
                padding: '0.25rem 0.5rem',
                borderRadius: '4px',
                transition: 'background-color 0.2s',
                cursor: 'pointer'
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              Reports
            </Link>

            {user ? (
              <button
                onClick={handleLogout}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px',
                  transition: 'background-color 0.2s',
                  fontSize: '0.9rem'
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                Logout
              </button>
            ) : (
              <Link
                href="/login"
                style={{
                  color: 'white',
                  textDecoration: 'none',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px',
                  transition: 'background-color 0.2s',
                  cursor: 'pointer'
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                Login
              </Link>
            )}
          </div>
        </nav>
        <main style={{ padding: '1.5rem' }}>{children}</main>
      </body>
    </html>
  );
}
