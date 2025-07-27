'use client';

import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';

export default function AuthGuard({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      setLoading(false);
      if (!user) {
        router.replace('/login');
      }
    });
    return unsubscribe;
  }, [router]);

  if (loading) {
    return <p>Checking authentication…</p>;
  }

  return <>{children}</>;
}
