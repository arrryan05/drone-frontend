// 'use client';

// import { useEffect, useState } from 'react';
// import { auth } from '@/lib/firebase';
// import { onAuthStateChanged, User } from 'firebase/auth';
// import { useRouter } from 'next/navigation';

// interface MissionListItem {
//   id: string;
//   pattern: string;
//   altitude: number;
//   overlap: number;
// }

// export default function MissionsPage() {
//   const [missions, setMissions] = useState<MissionListItem[]>([]);
//   const [error, setError] = useState<string | null>(null);
//   const router = useRouter();

//   useEffect(() => {
//     let unsubscribe: () => void;

//     unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
//       if (!user) {
//         router.replace('/login');
//         return;
//       }
//       try {
//         const token = await user.getIdToken(true);
//         const res = await fetch('http://localhost:4000/missions', {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         if (!res.ok) {
//           const body = await res.json().catch(() => ({} as any));
//           throw new Error(body.error || `HTTP ${res.status}`);
//         }
//         const data = await res.json();
//         if (!Array.isArray(data)) throw new Error('Unexpected API response');
//         setMissions(data);
//       } catch (err: any) {
//         console.error('Failed to load missions:', err);
//         setError(err.message);
//       }
//     });

//     return () => unsubscribe();
//   }, [router]);

//   if (error) {
//     return (
//       <main style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
//         <h1>Your Missions</h1>
//         <p style={{ color: 'red' }}>Error: {error}</p>
//       </main>
//     );
//   }

//   return (
//     <main style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
//       <h1>Your Missions</h1>
//       <button
//         onClick={() => router.push('/missions/new')}
//         style={{
//           padding: '0.5rem 1rem',
//           margin: '1rem 0',
//           backgroundColor: '#004080',
//           color: 'white',
//           border: 'none',
//           cursor: 'pointer',
//           borderRadius: '4px'
//         }}
//       >
//         ➕ New Mission
//       </button>

//       {missions.length === 0 ? (
//         <p>No missions yet.</p>
//       ) : (
//         <table style={{
//           width: '100%',
//           borderCollapse: 'collapse',
//           marginTop: '1rem'
//         }}>
//           <thead>
//             <tr>
//               <th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '2px solid #ddd' }}>ID</th>
//               <th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '2px solid #ddd' }}>Pattern</th>
//               <th style={{ textAlign: 'right', padding: '0.5rem', borderBottom: '2px solid #ddd' }}>Altitude (m)</th>
//               <th style={{ textAlign: 'right', padding: '0.5rem', borderBottom: '2px solid #ddd' }}>Overlap (%)</th>
//             </tr>
//           </thead>
//           <tbody>
//             {missions.map((m) => (
//               <tr
//                 key={m.id}
//                 style={{
//                   cursor: 'pointer',
//                   transition: 'background-color 0.2s'
//                 }}
//                 onClick={() => router.push(`/missions/${m.id}`)}
//                 onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f5f5f5')}
//                 onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
//               >
//                 <td style={{ padding: '0.5rem', borderBottom: '1px solid #eee' }}>{m.id}</td>
//                 <td style={{ padding: '0.5rem', borderBottom: '1px solid #eee' }}>{m.pattern}</td>
//                 <td style={{ padding: '0.5rem', textAlign: 'right', borderBottom: '1px solid #eee' }}>
//                   {m.altitude}
//                 </td>
//                 <td style={{ padding: '0.5rem', textAlign: 'right', borderBottom: '1px solid #eee' }}>
//                   {m.overlap}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       )}
//     </main>
//   );
// }

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
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      if (!user) {
        router.replace('/login');
        return;
      }
      try {
        const token = await user.getIdToken(true);
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

  return (
    <main style={{
      fontFamily: 'system-ui, sans-serif',
      backgroundColor: '#f9fafb',
      minHeight: '100vh',
      padding: '2rem',
    }}>
      <div style={{
        maxWidth: '1100px',
        margin: '0 auto',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        padding: '2rem',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
        }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Your Missions</h1>
          <button
            onClick={() => router.push('/missions/new')}
            style={{
              backgroundColor: '#003366',
              color: '#fff',
              padding: '0.6rem 1rem',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.3s',
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#1d4ed8'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#2563eb'}
          >
            + New Mission
          </button>
        </div>

        {error && (
          <p style={{ color: 'red', marginBottom: '1rem' }}>Error: {error}</p>
        )}

        {missions.length === 0 ? (
          <p>No missions found.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.95rem',
            }}>
              <thead>
                <tr style={{ backgroundColor: '#f3f4f6' }}>
                  <th style={thStyle}>ID</th>
                  <th style={thStyle}>Pattern</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Altitude (m)</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Overlap (%)</th>
                </tr>
              </thead>
              <tbody>
                {missions.map((m) => (
                  <tr
                    key={m.id}
                    style={{
                      transition: 'background 0.2s',
                      cursor: 'pointer',
                    }}
                    onClick={() => router.push(`/missions/${m.id}`)}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f9fafb'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td style={tdStyle}>{m.id}</td>
                    <td style={tdStyle}>{m.pattern}</td>
                    <td style={{ ...tdStyle, textAlign: 'right' }}>{m.altitude}</td>
                    <td style={{ ...tdStyle, textAlign: 'right' }}>{m.overlap}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '0.75rem',
  fontWeight: 600,
  color: '#374151',
  borderBottom: '2px solid #e5e7eb',
};

const tdStyle: React.CSSProperties = {
  padding: '0.75rem',
  borderBottom: '1px solid #e5e7eb',
  color: '#1f2937',
};
