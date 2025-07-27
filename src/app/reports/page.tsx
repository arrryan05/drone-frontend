'use client';

import { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { Bar, Pie, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  LineElement,
  PointElement,
  TimeScale,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Summary } from '@/types/dtos';
import ChartCard from '@/components/ChartCard';
import SummaryCard from '@/components/SummaryCard';

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  LineElement,
  PointElement,
  TimeScale,
  Title,
  Tooltip,
  Legend
);


const defaultSummary: Summary = {
  totalMissions: 0,
  completed: 0,
  aborted: 0,
  averageDurationSec: 0,
  averageAltitude: 0,
  durations: [],
  altitudes: [],
  durationsOverTime: []
};

export default function ReportsPage() {
  const [summary, setSummary] = useState<Summary>(defaultSummary);

  useEffect(() => {
    const fetchSummary = async () => {
      const token = await getAuth().currentUser?.getIdToken();
      if (!token) return;
      const res = await fetch('http://localhost:4000/reports/summary', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setSummary({ ...defaultSummary, ...data });
    };
    fetchSummary();
  }, []);

  const barData = {
    labels: summary.durations.map((_, i) => `Mission ${i + 1}`),
    datasets: [
      {
        label: 'Duration (sec)',
        data: summary.durations,
        backgroundColor: '#3B82F6'
      }
    ]
  };

  const altitudeData = {
    labels: summary.altitudes.map((_, i) => `Mission ${i + 1}`),
    datasets: [
      {
        label: 'Altitude (m)',
        data: summary.altitudes,
        backgroundColor: '#10B981'
      }
    ]
  };

  const pieData = {
    labels: ['Completed', 'Aborted'],
    datasets: [
      {
        data: [summary.completed, summary.aborted],
        backgroundColor: ['#10B981', '#EF4444']
      }
    ]
  };

  const lineData = {
    labels: summary.durationsOverTime.map((d) =>
      new Date(d.createdAt).toLocaleDateString()
    ),
    datasets: [
      {
        label: 'Mission Duration (sec)',
        data: summary.durationsOverTime.map((d) => d.durationSec),
        fill: false,
        borderColor: '#F59E0B',
        tension: 0.3
      }
    ]
  };

  return (
    <main
      style={{
        fontFamily: 'system-ui, sans-serif',
        backgroundColor: '#F9FAFB',
        padding: '2rem',
        minHeight: '100vh'
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '1.5rem' }}>
          📊 Mission Reports Dashboard
        </h1>

        {/* Summary Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem'
          }}
        >
          <SummaryCard title="Total Missions" value={summary.totalMissions} />
          <SummaryCard title="Completed" value={summary.completed} color="#10B981" />
          <SummaryCard title="Aborted" value={summary.aborted} color="#EF4444" />
          <SummaryCard
            title="Avg Duration"
            value={`${Math.floor(summary.averageDurationSec / 60)}m ${
              summary.averageDurationSec % 60
            }s`}
          />
          <SummaryCard title="Avg Altitude" value={`${summary.averageAltitude}m`} />
        </div>

        {/* Charts */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '2rem'
          }}
        >
          <ChartCard title="🕒 Durations per Mission">
            <Bar data={barData} />
          </ChartCard>

          <ChartCard title="⛰️ Altitudes per Mission">
            <Bar data={altitudeData} />
          </ChartCard>

          <ChartCard title="🧭 Completion Ratio">
            <Pie data={pieData} />
          </ChartCard>

          <ChartCard title="📈 Duration Over Time">
            <Line data={lineData} />
          </ChartCard>
        </div>
      </div>
    </main>
  );
}





