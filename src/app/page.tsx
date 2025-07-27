'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function HomePage() {

  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, u => setUser(u));
    return unsubscribe;
  }, []);

  return (
    <section style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '2rem',
      fontFamily: 'Arial, sans-serif',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      {/* LEFT: Text & CTA */}
      <div style={{ flex: 1, paddingRight: '2rem' }}>
        <div style={{
          display: 'inline-block',
          background: '#e6f0ff',
          color: '#004080',
          padding: '0.5rem 1rem',
          borderRadius: '999px',
          fontSize: '0.9rem',
          marginBottom: '1rem'
        }}>
          Trusted by 120+ drone pilots
        </div>
        <h1 style={{
          fontSize: '3rem',
          lineHeight: 1.2,
          color: '#003366',
          margin: '0 0 1rem 0'
        }}>
          Elevate Your Drone Mission<br />
          with Real‑Time Insights
        </h1>
        <p style={{
          fontSize: '1.125rem',
          color: '#555',
          lineHeight: 1.6,
          marginBottom: '2rem'
        }}>
          Plan, launch, and monitor missions effortlessly—track progress on a live map and capture high‑res imagery in one unified platform.
        </p>
        <div style={{ textAlign: 'left' }}>
          <button
            onClick={() => router.push(user ? '/missions' : '/login')}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#004080',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            Get Started
          </button>
        </div>
      </div>

      {/* RIGHT: Map + Drone Image */}
      <div style={{
        position: 'relative',
        width: '500px',
        height: '350px',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}>
        <Image
          src="/drone2.png"
          alt="Drone"
          fill
          style={{
            objectFit: 'cover', 
            objectPosition: 'center'
          }}
        />
      </div>

    </section>
  );
}

