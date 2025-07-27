'use client';

import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useRouter } from 'next/navigation';

interface MissionListItem {
  id: string;
  pattern: string;
  altitude: number;
  overlap: number;
}

export default function MissionsPage() {
  const [missions, setMissions] = useState<MissionListItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    let unsubscribe: () => void;

    // Wait until Firebase Auth tells us the user is signed in
    unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      if (!user) {
        // Not signed in? Kick them back to login
        router.replace('/login');
        return;
      }

      try {
        // Force-refresh the token to be sure it's valid
        const token = await user.getIdToken(/* forceRefresh */ true);

        // Now make the API call with a valid Bearer token
        const res = await fetch('http://localhost:4000/missions', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({} as any));
          throw new Error(body.error || `HTTP ${res.status}`);
        }

        const data = await res.json();
        if (!Array.isArray(data)) throw new Error('Unexpected API response');

        setMissions(data);
      } catch (err: any) {
        console.error('Failed to load missions:', err);
        setError(err.message);
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (error) {
    return (
      <main style={{ padding: '2rem' }}>
        <h1>Your Missions</h1>
        <p style={{ color: 'red' }}>Error: {error}</p>
      </main>
    );
  }

  return (
    <main style={{ padding: '2rem' }}>
      <h1>Your Missions</h1>
      <button onClick={() => router.push('/missions/new')}>➕ New Mission</button>

      {missions.length === 0 ? (
        <p style={{ marginTop: '1rem' }}>No missions yet.</p>
      ) : (
        <ul style={{ marginTop: '1rem' }}>
          {missions.map((m) => (
            <li key={m.id}>
              <a href={`/missions/${m.id}`}>
                {m.id} — {m.pattern} @ {m.altitude}m (overlap: {m.overlap}%)
              </a>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
