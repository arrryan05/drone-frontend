// src/app/reports/layout.tsx
import { ReactNode } from 'react';
import AuthGuard from '@/components/AuthGuard';

export default function ReportsLayout({ children }: { children: ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>;
}
