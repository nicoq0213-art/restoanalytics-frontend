import { useEffect, useState, useCallback } from 'react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'

const today = () => new Date().toISOString().slice(0, 10)

export default function Ventas() {
  const { isEncargado } = useAuth()
  const [productos, setProductos] = useState([])
  const [fecha, setFecha]         = useState(today())
  const [canal, setCanal]         = useState('mostrador')
  const [cantidades, setCantidades] = useState({})
  const [loading, setLoading]     = useState(true)
  const [saving, setSaving]       = useState(false)
  const [toast, setToast]         = useState(null)

  useEffect(() => { loadProductos() }, [])

  async function loadProductos() {
    setLoading(true)
    try {
      const { data } = await api.get('/productos/?solo_activos=true')
      setProductos(data)
      const init = {}
      data.forEach(p => { init[p.id] = 0 })
      setCantidades(init)
    } finally {
      setLoading(false)
    }
  }

  const setCant = useCallback((id, val) => {
    setCantidades(prev => ({ ...prev, [id]: Math.max(0, val) }))
  }, [])

  function totalItems() {
    return Object.values(cantidades).reduce((a, b) => a + b, 0)
  }

  async function handleSubmit() {
    const items = Object.entries(cantidades)
      .filter(([, c]) => c > 0)
      .map(([id, c]) => ({ producto_id: Number(id), cantidad: c, canal }))

    if (items.length === 0) {
      showToast('Agregá al menos un producto', 'error')
      return
    }

    setSaving(true)
    try {
      await api.post('/ventas/', { fecha, items })
      showToast(`✓ ${items.length} venta(s) guardadas`, 'success')
      // Reset cantidades
      const reset = {}
      productos.forEach(p => { reset[p.id] = 0 })
      setCantidades(reset)
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
    return '$' + n.toLocaleString('es-AR', { minimumFractionDigits: 0 })
  }

  if (loading) return <LoadingSpinner />

  return (
    <div>
      {/* Encabezado */}
      <div className="card" style={{ background: 'linear-gradient(135deg,#017a72,#01b8a8)', color:'#fff', marginBottom: 16 }}>
        <div style={{ fontWeight: 800, fontSize: 18 }}>💰 Cargar ventas</div>
        <div style={{ fontSize: 13, opacity: .85, marginTop: 2 }}>Seleccioná fecha, canal y unidades</div>
      </div>

      {/* Fecha y canal */}
      <div className="card">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="field" style={{ marginBottom: 0 }}>
            <label>Fecha</label>
            <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} max={today()} />
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <label>Canal</label>
            <select value={canal} onChange={e => setCanal(e.target.value)}>
              <option value="mostrador">🏪 Mostrador</option>
              <option value="delivery">🛵 Delivery</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de productos */}
      <div className="card-title" style={{ marginTop: 4 }}>Productos del menú</div>

      {productos.map(p => {
        const cant = cantidades[p.id] || 0
        return (
          <div key={p.id} className="card" style={{
            display: 'flex', alignItems: 'center', gap: 12,
            border: cant > 0 ? '1.5px solid var(--primary)' : '1.5px solid transparent',
            transition: 'border-color .15s',
          }}>
            {/* Info producto */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {p.nombre}
              </div>
              <div style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 700 }}>
                {fmt(p.precio_venta)}
              </div>
              {cant > 0 && (
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                  Subtotal: {fmt(p.precio_venta * cant)}
                </div>
              )}
            </div>

            {/* Stepper */}
            <div className="stepper">
              <button
                className="stepper-btn"
                onClick={() => setCant(p.id, cant - 1)}
                style={{ background: cant > 0 ? 'var(--bg)' : 'var(--border)', opacity: cant === 0 ? .4 : 1 }}
              >−</button>
              <span className="stepper-val" style={{ color: cant > 0 ? 'var(--primary)' : 'var(--text)' }}>
                {cant}
              </span>
              <button className="stepper-btn" onClick={() => setCant(p.id, cant + 1)}>+</button>
            </div>
          </div>
        )
      })}

      {/* Resumen y botón */}
      {totalItems() > 0 && (
        <div className="card" style={{ background: 'var(--bg)', border: '1.5px solid var(--primary)' }}>
          <div className="row-between" style={{ marginBottom: 10 }}>
            <span style={{ fontWeight: 600 }}>Total a registrar</span>
            <span style={{ fontWeight: 800, fontSize: 18, color: 'var(--primary)' }}>
              {fmt(
                Object.entries(cantidades).reduce((sum, [id, c]) => {
                  const p = productos.find(x => x.id === Number(id))
                  return sum + (p ? p.precio_venta * c : 0)
                }, 0)
              )}
            </span>
          </div>
          <div className="row-between" style={{ marginBottom: 12, fontSize: 13, color: 'var(--text-muted)' }}>
            <span>{totalItems()} unidades · Canal: {canal === 'mostrador' ? '🏪 Mostrador' : '🛵 Delivery'}</span>
          </div>
        </div>
      )}

      {isEncargado && (
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={saving || totalItems() === 0}
          style={{ marginTop: 8 }}
        >
          {saving ? 'Guardando...' : `Guardar ${totalItems() > 0 ? `(${totalItems()}) ` : ''}ventas →`}
        </button>
      )}

      {!isEncargado && (
        <p className="text-muted text-center" style={{ padding: 16 }}>Solo el encargado puede cargar ventas.</p>
      )}

      {toast && (
        <div className={`toast ${toast.type}`}>{toast.msg}</div>
      )}
    </div>
  )
}
