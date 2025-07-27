export default function ChartCard({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '0.75rem',
        padding: '1.5rem',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
      }}
    >
      <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>
        {title}
      </h3>
      {children}
    </div>
  );
}