export default function StockBar({ actual, umbral, max }) {
  const safeMax = max || Math.max(umbral * 3, actual * 1.5, 1)
  const pct = Math.min(100, (actual / safeMax) * 100)
  const critico = actual <= umbral
  const bajo    = actual <= umbral * 1.5 && !critico

  const color = critico ? '#ef4444' : bajo ? '#f59e0b' : 'var(--primary)'

  return (
    <div>
      <div style={{
        height: 8,
        background: 'var(--border)',
        borderRadius: 4,
        overflow: 'hidden',
        marginTop: 6,
      }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: color,
          borderRadius: 4,
          transition: 'width .4s ease',
        }} />
      </div>
    </div>
  )
}
