import { useState, useEffect } from 'react'
import api from '../api/axios'
import LoadingSpinner from '../components/LoadingSpinner'

// ── Tab Rentabilidad ─────────────────────────────────────────
function TabRentabilidad() {
  const [periodo, setPeriodo] = useState('dia')
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [periodo])

  async function load() {
    setLoading(true)
    try {
      const { data: d } = await api.get(`/rentabilidad/${periodo}`)
      setData(d)
    } finally {
      setLoading(false)
    }
  }

  function fmt(n) {
    return '$' + (n || 0).toLocaleString('es-AR', { minimumFractionDigits: 0 })
  }

  return (
    <div>
      <div className="tabs">
        {['dia', 'semana', 'mes'].map(p => (
          <button key={p} className={`tab-btn ${periodo === p ? 'active' : ''}`} onClick={() => setPeriodo(p)}>
            {p === 'dia' ? 'Hoy' : p === 'semana' ? 'Semana' : 'Mes'}
          </button>
        ))}
      </div>

      {loading ? <LoadingSpinner /> : data && (
        <>
          {/* KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
            {[
              { label: 'Ingresos', value: fmt(data.total_ingresos), icon: '💰' },
              { label: 'Margen bruto', value: fmt(data.total_margen_bruto), icon: '📈' },
              { label: 'Gastos', value: fmt(data.gastos_operativos), icon: '💸' },
              { label: 'Resultado neto', value: fmt(data.resultado_neto), icon: '🏁', accent: true },
            ].map(k => (
              <div key={k.label} className="card" style={{
                marginBottom: 0,
                background: k.accent ? (data.resultado_neto >= 0 ? 'linear-gradient(135deg,#017a72,#01b8a8)' : 'var(--red-bg)') : 'var(--card)',
                color: k.accent ? (data.resultado_neto >= 0 ? '#fff' : 'var(--red-text)') : 'var(--text)',
              }}>
                <div style={{ fontSize: 11, fontWeight: 600, opacity: .75, textTransform: 'uppercase', letterSpacing: '.05em' }}>{k.label}</div>
                <div style={{ fontSize: 22, fontWeight: 800, marginTop: 4 }}>{k.value}</div>
              </div>
            ))}
          </div>

          {/* Tabla por producto */}
          <div className="card">
            <div className="card-title">Por producto</div>
            {data.por_producto.length === 0 ? (
              <p className="empty-state">Sin ventas en este período</p>
            ) : (
              data.por_producto.map((p, i) => (
                <div key={p.nombre} style={{
                  padding: '12px 0',
                  borderBottom: i < data.por_producto.length - 1 ? '1px solid var(--border)' : 'none',
                }}>
                  <div className="row-between" style={{ marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{p.nombre}</span>
                    <span style={{
                      background: p.porcentaje_margen >= 30 ? 'var(--green-bg)' : p.porcentaje_margen >= 15 ? 'var(--yellow-bg)' : 'var(--red-bg)',
                      color: p.porcentaje_margen >= 30 ? 'var(--green-text)' : p.porcentaje_margen >= 15 ? 'var(--yellow-text)' : 'var(--red-text)',
                      borderRadius: 20, padding: '2px 9px', fontSize: 12, fontWeight: 700,
                    }}>
                      {p.porcentaje_margen}%
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 4 }}>
                    {[
                      { label: 'Precio', val: fmt(p.precio_venta) },
                      { label: 'Costo', val: fmt(p.costo_receta) },
                      { label: 'Margen', val: fmt(p.margen_unitario) },
                      { label: 'Uds', val: `×${p.unidades_vendidas}` },
                    ].map(c => (
                      <div key={c.label} style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>{c.label}</div>
                        <div style={{ fontSize: 12, fontWeight: 700 }}>{c.val}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  )
}

// ── Tab Delivery ─────────────────────────────────────────────
function TabDelivery() {
  const [data, setData]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [rango, setRango] = useState('semana')

  useEffect(() => { load() }, [rango])

  async function load() {
    setLoading(true)
    const hoy   = new Date()
    const hasta = hoy.toISOString().slice(0, 10)
    const dias  = rango === 'semana' ? 6 : rango === 'mes' ? 29 : 0
    const desde = new Date(hoy - dias * 86400000).toISOString().slice(0, 10)
    try {
      const { data: d } = await api.get(`/ventas/por-canal?fecha_desde=${desde}&fecha_hasta=${hasta}`)
      setData(d)
    } finally {
      setLoading(false)
    }
  }

  function fmt(n) { return '$' + (n || 0).toLocaleString('es-AR', { minimumFractionDigits: 0 }) }

  const total = data ? (data.mostrador.total + data.delivery.total) : 0
  const mostPct = total > 0 ? Math.round(data.mostrador.total / total * 100) : 0
  const delPct  = total > 0 ? Math.round(data.delivery.total  / total * 100) : 0

  return (
    <div>
      <div className="tabs">
        {['dia', 'semana', 'mes'].map(p => (
          <button key={p} className={`tab-btn ${rango === p ? 'active' : ''}`} onClick={() => setRango(p)}>
            {p === 'dia' ? 'Hoy' : p === 'semana' ? '7 días' : '30 días'}
          </button>
        ))}
      </div>

      {loading ? <LoadingSpinner /> : data && (
        <>
          {/* Comparativa */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
            <div className="card" style={{ marginBottom: 0, textAlign: 'center', borderTop: '4px solid var(--primary)' }}>
              <div style={{ fontSize: 22 }}>🏪</div>
              <div style={{ fontWeight: 700, fontSize: 13, marginTop: 4, color: 'var(--text-muted)' }}>Mostrador</div>
              <div style={{ fontWeight: 800, fontSize: 22, color: 'var(--primary)' }}>{fmt(data.mostrador.total)}</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--primary)', opacity: .6 }}>{mostPct}%</div>
            </div>
            <div className="card" style={{ marginBottom: 0, textAlign: 'center', borderTop: '4px solid #01b8a8' }}>
              <div style={{ fontSize: 22 }}>🛵</div>
              <div style={{ fontWeight: 700, fontSize: 13, marginTop: 4, color: 'var(--text-muted)' }}>Delivery</div>
              <div style={{ fontWeight: 800, fontSize: 22, color: '#01b8a8' }}>{fmt(data.delivery.total)}</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#01b8a8', opacity: .6 }}>{delPct}%</div>
            </div>
          </div>

          {/* Barra proporcional */}
          <div className="card">
            <div className="card-title">Distribución de ventas</div>
            <div style={{ display: 'flex', height: 18, borderRadius: 9, overflow: 'hidden' }}>
              <div style={{ width: `${mostPct}%`, background: 'var(--primary)', transition: 'width .4s' }} />
              <div style={{ width: `${delPct}%`, background: '#01b8a8' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 12, color: 'var(--text-muted)' }}>
              <span style={{ color: 'var(--primary)', fontWeight: 600 }}>🏪 {mostPct}% mostrador</span>
              <span style={{ color: '#01b8a8', fontWeight: 600 }}>🛵 {delPct}% delivery</span>
            </div>
          </div>

          {/* Top productos por canal */}
          {[
            { canal: 'Mostrador', icon: '🏪', color: 'var(--primary)', top: data.mostrador.top_productos },
            { canal: 'Delivery',  icon: '🛵', color: '#01b8a8',        top: data.delivery.top_productos },
          ].map(({ canal, icon, color, top }) => (
            <div key={canal} className="card">
              <div className="card-title">{icon} Top {canal}</div>
              {top.length === 0 ? (
                <p className="empty-state">Sin ventas</p>
              ) : (
                top.slice(0, 4).map(([nombre, cant], i) => (
                  <div key={nombre} className="row-between" style={{
                    padding: '8px 0',
                    borderBottom: i < Math.min(top.length, 4) - 1 ? '1px solid var(--border)' : 'none',
                  }}>
                    <span style={{ fontSize: 14, fontWeight: 500 }}>{nombre}</span>
                    <span style={{
                      background: 'var(--bg)',
                      borderRadius: 20,
                      padding: '2px 10px',
                      fontSize: 13,
                      fontWeight: 700,
                      color,
                    }}>×{cant}</span>
                  </div>
                ))
              )}
            </div>
          ))}
        </>
      )}
    </div>
  )
}

// ── Página principal ─────────────────────────────────────────
export default function Analisis() {
  const [tab, setTab] = useState('rentabilidad')

  return (
    <div>
      <div className="card" style={{ background: 'linear-gradient(135deg,#017a72,#01b8a8)', color:'#fff', marginBottom: 16 }}>
        <div style={{ fontWeight: 800, fontSize: 18 }}>📊 Análisis</div>
        <div style={{ fontSize: 13, opacity: .85, marginTop: 2 }}>Rentabilidad y canales de venta</div>
      </div>

      <div className="tabs">
        <button className={`tab-btn ${tab === 'rentabilidad' ? 'active' : ''}`} onClick={() => setTab('rentabilidad')}>
          💹 Rentabilidad
        </button>
        <button className={`tab-btn ${tab === 'delivery' ? 'active' : ''}`} onClick={() => setTab('delivery')}>
          🛵 vs Mostrador
        </button>
      </div>

      {tab === 'rentabilidad' ? <TabRentabilidad /> : <TabDelivery />}
    </div>
  )
}
