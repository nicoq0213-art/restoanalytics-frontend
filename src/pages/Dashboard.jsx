import { useEffect, useState } from 'react'
import api from '../api/axios'
import KpiCard from '../components/KpiCard'
import AlertPill from '../components/AlertPill'
import StockBar from '../components/StockBar'
import LoadingSpinner from '../components/LoadingSpinner'

const today = () => new Date().toISOString().slice(0, 10)

export default function Dashboard() {
  const [data, setData]     = useState(null)
  const [fecha, setFecha]   = useState(today())
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState('')

  useEffect(() => {
    load()
  }, [fecha])

  async function load() {
    setLoading(true)
    setError('')
    try {
      const { data: d } = await api.get(`/ventas/dashboard?fecha=${fecha}`)
      setData(d)
    } catch {
      setError('No se pudo cargar el dashboard')
    } finally {
      setLoading(false)
    }
  }

  function fmt(n) {
    return '$' + (n || 0).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
  }

  return (
    <div>
      {/* Selector de fecha */}
      <div className="field" style={{ marginBottom: 16 }}>
        <label>Fecha del informe</label>
        <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} max={today()} />
      </div>

      {loading && <LoadingSpinner />}
      {error   && <p style={{ color: 'var(--red-text)', textAlign: 'center', padding: 20 }}>{error}</p>}

      {data && !loading && (
        <>
          {/* KPIs principales */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
            <KpiCard
              label="Venta total"
              value={fmt(data.venta_total)}
              icon="💰"
              accent
            />
            <KpiCard
              label="Unidades"
              value={data.unidades_vendidas}
              sub="vendidas hoy"
              icon="🛒"
            />
            <KpiCard
              label="Margen bruto"
              value={fmt(data.margen_bruto)}
              sub={data.venta_total > 0 ? `${Math.round(data.margen_bruto / data.venta_total * 100)}% del total` : '—'}
              icon="📈"
            />
            <KpiCard
              label="Result. neto"
              value={fmt(data.resultado_neto)}
              sub={`Gastos: ${fmt(data.gastos_operativos)}`}
              icon="🏁"
            />
          </div>

          {/* Top 3 productos */}
          <div className="card">
            <div className="card-title">🏆 Top 3 productos del día</div>
            {data.top_3_productos.length === 0 ? (
              <p className="text-muted text-center" style={{ padding: '12px 0' }}>Sin ventas registradas</p>
            ) : (
              data.top_3_productos.map((p, i) => (
                <div key={p.nombre} className="row-between" style={{
                  padding: '10px 0',
                  borderBottom: i < data.top_3_productos.length - 1 ? '1px solid var(--border)' : 'none',
                }}>
                  <div className="row" style={{ gap: 10 }}>
                    <span style={{
                      width: 26, height: 26,
                      borderRadius: '50%',
                      background: i === 0 ? '#fef3c7' : 'var(--bg)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13, fontWeight: 800,
                      color: i === 0 ? '#92400e' : 'var(--text-muted)',
                    }}>
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}
                    </span>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{p.nombre}</span>
                  </div>
                  <span style={{
                    background: 'var(--bg)',
                    borderRadius: 20,
                    padding: '3px 10px',
                    fontSize: 13,
                    fontWeight: 700,
                    color: 'var(--primary)',
                  }}>
                    ×{p.cantidad}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Stock crítico */}
          <div className="card">
            <div className="row-between" style={{ marginBottom: 10 }}>
              <div className="card-title" style={{ marginBottom: 0 }}>⚠️ Stock crítico</div>
              {data.stock_critico.length > 0 && (
                <AlertPill type="red">{data.stock_critico.length} alertas</AlertPill>
              )}
            </div>

            {data.stock_critico.length === 0 ? (
              <div className="row" style={{ gap: 8 }}>
                <span style={{ fontSize: 20 }}>✅</span>
                <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                  Todo el stock está sobre el umbral
                </span>
              </div>
            ) : (
              data.stock_critico.map((ing, i) => (
                <div key={ing.id} style={{
                  padding: '10px 0',
                  borderBottom: i < data.stock_critico.length - 1 ? '1px solid var(--border)' : 'none',
                }}>
                  <div className="row-between">
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{ing.nombre}</span>
                    <AlertPill type={ing.stock_actual === 0 ? 'red' : 'yellow'}>
                      {ing.stock_actual} {ing.unidad}
                    </AlertPill>
                  </div>
                  <StockBar
                    actual={ing.stock_actual}
                    umbral={ing.umbral_alerta}
                    max={ing.umbral_alerta * 3}
                  />
                  <div className="text-muted" style={{ fontSize: 11, marginTop: 3 }}>
                    Umbral mínimo: {ing.umbral_alerta} {ing.unidad}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Resumen gastos */}
          {data.gastos_operativos > 0 && (
            <div className="card" style={{ background: 'var(--yellow-bg)', border: '1px solid var(--yellow-border)' }}>
              <div className="row" style={{ gap: 10 }}>
                <span style={{ fontSize: 24 }}>💸</span>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--yellow-text)', fontSize: 15 }}>
                    Gastos operativos: {fmt(data.gastos_operativos)}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--yellow-text)', opacity: .8 }}>
                    Descontados del margen en resultado neto
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
