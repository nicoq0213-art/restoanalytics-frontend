export default function KpiCard({ label, value, sub, accent = false, icon }) {
  return (
    <div className="card" style={{
      background: accent ? 'linear-gradient(135deg, #017a72, #01b8a8)' : 'var(--card)',
      color: accent ? '#fff' : 'var(--text)',
      marginBottom: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 12, fontWeight: 600, opacity: accent ? .85 : 1, color: accent ? '#fff' : 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.05em' }}>
          {label}
        </span>
        {icon && <span style={{ fontSize: 20 }}>{icon}</span>}
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, lineHeight: 1.1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, marginTop: 4, opacity: accent ? .8 : 1, color: accent ? '#fff' : 'var(--text-muted)' }}>{sub}</div>}
    </div>
  )
}
