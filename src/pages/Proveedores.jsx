import { useEffect, useState } from 'react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'

const today = () => new Date().toISOString().slice(0, 10)
const emptyForm = () => ({ fecha: today(), proveedor: '', ingrediente_id: '', cantidad: '', precio_total: '' })

export default function Proveedores() {
  const { isEncargado } = useAuth()
  const [compras, setCompras]         = useState([])
  const [ingredientes, setIngredientes] = useState([])
  const [loading, setLoading]         = useState(true)
  const [form, setForm]               = useState(emptyForm())
  const [saving, setSaving]           = useState(false)
  const [toast, setToast]             = useState(null)
  const [showForm, setShowForm]       = useState(false)

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    setLoading(true)
    try {
      const [{ data: c }, { data: i }] = await Promise.all([
        api.get('/proveedores/'),
        api.get('/stock/'),
      ])
      setCompras(c)
      setIngredientes(i)
    } finally {
      setLoading(false)
    }
  }

  async function guardar() {
    if (!form.proveedor || !form.ingrediente_id || !form.cantidad || !form.precio_total) {
      showToast('Completá todos los campos', 'error')
      return
    }
    setSaving(true)
    try {
      await api.post('/proveedores/', {
        fecha: form.fecha,
        proveedor: form.proveedor,
        ingrediente_id: Number(form.ingrediente_id),
        cantidad: Number(form.cantidad),
        precio_total: Number(form.precio_total),
      })
      showToast('✓ Compra registrada y stock actualizado', 'success')
      setForm(emptyForm())
      setShowForm(false)
      loadAll()
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

  function fmt(n) { return '$' + (n || 0).toLocaleString('es-AR', { minimumFractionDigits: 0 }) }

  const precioUnitario = form.cantidad && form.precio_total
    ? (Number(form.precio_total) / Number(form.cantidad)).toFixed(2)
    : null

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <div className="card" style={{ background: 'linear-gradient(135deg,#017a72,#01b8a8)', color:'#fff', marginBottom: 16 }}>
        <div className="row-between">
          <div>
            <div style={{ fontWeight: 800, fontSize: 18 }}>🚚 Proveedores</div>
            <div style={{ fontSize: 13, opacity: .85, marginTop: 2 }}>Registro de compras de mercadería</div>
          </div>
          {isEncargado && (
            <button onClick={() => setShowForm(!showForm)} style={{
              background: 'rgba(255,255,255,0.2)', border: '1.5px solid rgba(255,255,255,0.5)',
              borderRadius: 10, padding: '8px 16px',
              color: '#fff', fontFamily: 'inherit', fontWeight: 700, fontSize: 14, cursor: 'pointer',
            }}>
              {showForm ? '✕ Cerrar' : '+ Nueva compra'}
            </button>
          )}
        </div>
      </div>

      {/* Formulario */}
      {showForm && isEncargado && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Nueva compra</div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div className="field" style={{ marginBottom: 0 }}>
              <label>Fecha</label>
              <input type="date" value={form.fecha} onChange={e => setForm(p => ({ ...p, fecha: e.target.value }))} />
            </div>
            <div className="field" style={{ marginBottom: 0 }}>
              <label>Proveedor</label>
              <input type="text" placeholder="Nombre del proveedor" value={form.proveedor}
                onChange={e => setForm(p => ({ ...p, proveedor: e.target.value }))} />
            </div>
          </div>

          <div className="field" style={{ marginTop: 10 }}>
            <label>Ingrediente</label>
            <select value={form.ingrediente_id} onChange={e => setForm(p => ({ ...p, ingrediente_id: e.target.value }))}>
              <option value="">Seleccionar...</option>
              {ingredientes.map(i => (
                <option key={i.id} value={i.id}>{i.nombre} ({i.unidad})</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div className="field" style={{ marginBottom: 0 }}>
              <label>Cantidad</label>
              <input type="number" step="0.1" min="0.01" placeholder="Ej: 10"
                value={form.cantidad} onChange={e => setForm(p => ({ ...p, cantidad: e.target.value }))} />
            </div>
            <div className="field" style={{ marginBottom: 0 }}>
              <label>Precio total ($)</label>
              <input type="number" min="0" placeholder="Ej: 28000"
                value={form.precio_total} onChange={e => setForm(p => ({ ...p, precio_total: e.target.value }))} />
            </div>
          </div>

          {precioUnitario && (
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
              Precio unitario calculado: <strong>${precioUnitario}</strong> por unidad
            </div>
          )}

          <button className="btn btn-primary" onClick={guardar} disabled={saving} style={{ marginTop: 14 }}>
            {saving ? 'Guardando...' : '✓ Registrar compra'}
          </button>
        </div>
      )}

      {/* Historial */}
      <div className="card-title">Compras registradas</div>

      {compras.length === 0 ? (
        <p className="empty-state">Aún no hay compras registradas</p>
      ) : (
        compras.map((c) => (
          <div key={c.id} className="card">
            <div className="row-between" style={{ marginBottom: 4 }}>
              <div style={{ fontWeight: 600, fontSize: 15 }}>{c.proveedor}</div>
              <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: 15 }}>{fmt(c.precio_total)}</div>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', fontSize: 13, color: 'var(--text-muted)' }}>
              <span>📦 {c.ingrediente_nombre}</span>
              <span>· {c.cantidad} unid.</span>
              <span>· 📅 {c.fecha}</span>
              {c.registrado_por && <span>· 👤 {c.registrado_por}</span>}
            </div>
          </div>
        ))
      )}

      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
    </div>
  )
}
