export default function SummaryCard({
  title,
  value,
  color = '#374151'
}: {
  title: string;
  value: string | number;
  color?: string;
}) {
  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '0.75rem',
        padding: '1.25rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
      }}
    >
      <div style={{ color: '#6B7280', fontSize: '0.85rem' }}>{title}</div>
      <div style={{ fontSize: '1.5rem', fontWeight: 600, color }}>{value}</div>
    </div>
  );
}