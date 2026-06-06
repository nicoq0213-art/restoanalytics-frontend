import { useEffect, useState } from 'react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import StockBar from '../components/StockBar'
import AlertPill from '../components/AlertPill'
import LoadingSpinner from '../components/LoadingSpinner'

export default function Stock() {
  const { isEncargado } = useAuth()
  const [ingredientes, setIngredientes] = useState([])
  const [loading, setLoading]           = useState(true)
  const [modal, setModal]               = useState(null) // { ing, cantidad, motivo }
  const [saving, setSaving]             = useState(false)
  const [toast, setToast]               = useState(null)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try {
      const { data } = await api.get('/stock/')
      setIngredientes(data)
    } finally {
      setLoading(false)
    }
  }

  async function ajustar() {
    if (!modal.cantidad || modal.cantidad === 0) return
    setSaving(true)
    try {
      await api.post('/stock/ajuste', {
        ingrediente_id: modal.ing.id,
        cantidad: Number(modal.cantidad),
        motivo: modal.motivo || 'Ajuste manual',
      })
      showToast('✓ Stock actualizado', 'success')
      setModal(null)
      load()
    } catch (err) {
      showToast(err.response?.data?.detail || 'Error al ajustar', 'error')
    } finally {
      setSaving(false)
    }
  }

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2800)
  }

  function estadoStock(ing) {
    if (ing.stock_actual <= ing.umbral_alerta)       return 'red'
    if (ing.stock_actual <= ing.umbral_alerta * 1.5) return 'yellow'
    return 'green'
  }

  if (loading) return <LoadingSpinner />

  const criticos = ingredientes.filter(i => i.stock_actual <= i.umbral_alerta)
  const bajos    = ingredientes.filter(i => i.stock_actual > i.umbral_alerta && i.stock_actual <= i.umbral_alerta * 1.5)

  return (
    <div>
      {/* Resumen */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
        <div className="card" style={{ textAlign: 'center', background: criticos.length > 0 ? 'var(--red-bg)' : 'var(--card)' }}>
          <div style={{ fontSize: 26, fontWeight: 800, color: criticos.length > 0 ? 'var(--red-text)' : 'var(--primary)' }}>
            {criticos.length}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Críticos</div>
        </div>
        <div className="card" style={{ textAlign: 'center', background: bajos.length > 0 ? 'var(--yellow-bg)' : 'var(--card)' }}>
          <div style={{ fontSize: 26, fontWeight: 800, color: bajos.length > 0 ? 'var(--yellow-text)' : 'var(--primary)' }}>
            {bajos.length}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Bajo umbral</div>
        </div>
      </div>

      <div className="card-title">Todos los ingredientes</div>

      {ingredientes.map(ing => {
        const estado = estadoStock(ing)
        return (
          <div key={ing.id} className="card">
            <div className="row-between" style={{ marginBottom: 6 }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{ing.nombre}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Umbral: {ing.umbral_alerta} {ing.unidad}
                  {ing.precio_promedio_compra > 0 && ` · $${ing.precio_promedio_compra.toLocaleString('es-AR')}/kg`}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <AlertPill type={estado}>
                  {ing.stock_actual} {ing.unidad}
                </AlertPill>
                {isEncargado && (
                  <button
                    onClick={() => setModal({ ing, cantidad: '', motivo: '' })}
                    style={{
                      display: 'block',
                      marginTop: 6,
                      marginLeft: 'auto',
                      background: 'var(--bg)',
                      border: '1px solid var(--border)',
                      borderRadius: 6,
                      padding: '3px 10px',
                      fontSize: 12,
                      fontWeight: 600,
                      color: 'var(--primary)',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    + Ajustar
                  </button>
                )}
              </div>
            </div>
            <StockBar
              actual={ing.stock_actual}
              umbral={ing.umbral_alerta}
              max={ing.umbral_alerta * 4}
            />
          </div>
        )
      })}

      {/* Modal ajuste */}
      {modal && (
        <>
          <div
            onClick={() => setModal(null)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,.5)', zIndex: 50 }}
          />
          <div style={{
            position: 'fixed', bottom: 0, left: '50%',
            transform: 'translateX(-50%)',
            width: '100%', maxWidth: 480,
            background: '#fff',
            borderRadius: '20px 20px 0 0',
            padding: '20px 20px 32px',
            zIndex: 60,
          }}>
            <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 16 }}>
              Ajustar: {modal.ing.nombre}
            </div>

            <div className="field">
              <label>Cantidad ({modal.ing.unidad}) — positivo suma, negativo descuenta</label>
              <input
                type="number"
                step="0.1"
                value={modal.cantidad}
                onChange={e => setModal(p => ({ ...p, cantidad: e.target.value }))}
                placeholder="Ej: 5 o -2.5"
                autoFocus
              />
            </div>

            <div className="field">
              <label>Motivo</label>
              <input
                type="text"
                value={modal.motivo}
                onChange={e => setModal(p => ({ ...p, motivo: e.target.value }))}
                placeholder="Llegada de mercadería, corrección..."
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancelar</button>
              <button className="btn btn-primary" onClick={ajustar} disabled={saving}>
                {saving ? 'Guardando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </>
      )}

      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
    </div>
  )
}
