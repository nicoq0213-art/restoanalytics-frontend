import { useEffect, useState } from 'react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'

const today = () => new Date().toISOString().slice(0, 10)

export default function Caja() {
  const { isEncargado } = useAuth()
  const [fecha, setFecha]     = useState(today())
  const [caja, setCaja]       = useState(null)
  const [efectivo, setEfectivo] = useState('')
  const [tarjeta, setTarjeta] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [toast, setToast]     = useState(null)

  useEffect(() => { load() }, [fecha])

  async function load() {
    setLoading(true)
    try {
      const { data } = await api.get(`/caja/${fecha}`)
      setCaja(data)
      if (data.id !== 0) {
        setEfectivo(data.efectivo)
        setTarjeta(data.tarjeta)
      } else {
        setEfectivo('')
        setTarjeta('')
      }
    } catch {
      setCaja(null)
    } finally {
      setLoading(false)
    }
  }

  async function guardar() {
    if (efectivo === '' || tarjeta === '') {
      showToast('Ingresá efectivo y tarjeta', 'error')
      return
    }
    setSaving(true)
    try {
      const { data } = await api.post('/caja/', {
        fecha,
        efectivo: Number(efectivo),
        tarjeta: Number(tarjeta),
      })
      setCaja(data)
      showToast('✓ Caja guardada', 'success')
    } catch (err) {
      showToast(err.response?.data?.detail || 'Error al guardar', 'error')
    } finally {
      setSaving(false)
    }
  }

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2800)
  }

  function fmt(n) {
    return '$' + (n || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  const totalDeclarado = (Number(efectivo) || 0) + (Number(tarjeta) || 0)
  const diferencia = caja ? caja.diferencia : (totalDeclarado - (caja?.total_sistema || 0))

  return (
    <div>
      <div className="card" style={{ background: 'linear-gradient(135deg,#017a72,#01b8a8)', color:'#fff', marginBottom: 16 }}>
        <div style={{ fontWeight: 800, fontSize: 18 }}>🧾 Caja diaria</div>
        <div style={{ fontSize: 13, opacity: .85, marginTop: 2 }}>Cierre y comparativa con ventas</div>
      </div>

      {/* Fecha */}
      <div className="card">
        <div className="field" style={{ marginBottom: 0 }}>
          <label>Fecha de cierre</label>
          <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} max={today()} />
        </div>
      </div>

      {loading ? <LoadingSpinner /> : (
        <>
          {/* Total sistema */}
          {caja && (
            <div className="card" style={{ background: 'var(--bg)', border: '1.5px solid var(--border)' }}>
              <div className="card-title">Total según ventas cargadas</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--primary)' }}>
                {fmt(caja.total_sistema)}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                Calculado automáticamente desde las ventas del día
              </div>
            </div>
          )}

          {/* Formulario de carga */}
          {isEncargado && (
            <div className="card">
              <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 14 }}>Lo declarado en caja</div>

              <div className="field">
                <label>💵 Efectivo cobrado ($)</label>
                <input
                  type="number" min="0" step="0.01" placeholder="0.00"
                  value={efectivo}
                  onChange={e => setEfectivo(e.target.value)}
                />
              </div>

              <div className="field">
                <label>💳 Tarjeta cobrada ($)</label>
                <input
                  type="number" min="0" step="0.01" placeholder="0.00"
                  value={tarjeta}
                  onChange={e => setTarjeta(e.target.value)}
                />
              </div>

              {(efectivo !== '' || tarjeta !== '') && (
                <div style={{ marginBottom: 14 }}>
                  <div className="row-between" style={{ fontSize: 14, color: 'var(--text-muted)' }}>
                    <span>Efectivo</span><span>{fmt(Number(efectivo) || 0)}</span>
                  </div>
                  <div className="row-between" style={{ fontSize: 14, color: 'var(--text-muted)', margin: '4px 0' }}>
                    <span>Tarjeta</span><span>{fmt(Number(tarjeta) || 0)}</span>
                  </div>
                  <div className="divider" style={{ margin: '8px 0' }} />
                  <div className="row-between" style={{ fontSize: 16, fontWeight: 700 }}>
                    <span>Total declarado</span>
                    <span style={{ color: 'var(--primary)' }}>{fmt(totalDeclarado)}</span>
                  </div>
                </div>
              )}

              <button className="btn btn-primary" onClick={guardar} disabled={saving}>
                {saving ? 'Guardando...' : '✓ Guardar cierre de caja'}
              </button>
            </div>
          )}

          {/* Resultado */}
          {caja && caja.id !== 0 && (
            <div className="card" style={{
              background: caja.diferencia === 0 ? 'var(--green-bg)'
                : caja.diferencia > 0 ? 'var(--yellow-bg)' : 'var(--red-bg)',
              border: `1.5px solid ${caja.diferencia === 0 ? '#86efac'
                : caja.diferencia > 0 ? 'var(--yellow-border)' : 'var(--red-border)'}`,
            }}>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8, color: 'var(--text)' }}>
                {caja.diferencia === 0 ? '✅ Caja balanceada'
                  : caja.diferencia > 0 ? '⚠️ Sobrante en caja'
                  : '🚨 Faltante en caja'}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, textAlign: 'center' }}>
                {[
                  { label: 'Declarado', val: fmt(caja.efectivo + caja.tarjeta) },
                  { label: 'Sistema',   val: fmt(caja.total_sistema) },
                  { label: 'Diferencia', val: fmt(caja.diferencia),
                    color: caja.diferencia === 0 ? 'var(--green-text)' : caja.diferencia > 0 ? 'var(--yellow-text)' : 'var(--red-text)' },
                ].map(c => (
                  <div key={c.label}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{c.label}</div>
                    <div style={{ fontWeight: 800, fontSize: 16, color: c.color || 'var(--text)' }}>{c.val}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
    </div>
  )
}
