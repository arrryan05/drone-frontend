import AuthGuard from '@/components/AuthGuard';
import { ReactNode } from 'react';

export const metadata = { title: 'Missions' };

export default function MissionsLayout({ children }: { children: ReactNode }) {
  return(
    <AuthGuard>{children}</AuthGuard>
  )
}

   
