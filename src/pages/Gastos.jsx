import { useEffect, useState } from 'react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'

const today = () => new Date().toISOString().slice(0, 10)
const emptyForm = () => ({ fecha: today(), descripcion: '', monto: '', categoria: 'servicios' })

const CATEGORIAS = [
  { value: 'servicios',    label: '⚡ Servicios',    color: '#3b82f6' },
  { value: 'personal',     label: '👥 Personal',     color: '#8b5cf6' },
  { value: 'mantenimiento', label: '🔧 Mantenimiento', color: '#f59e0b' },
  { value: 'otros',        label: '📌 Otros',        color: '#64748b' },
]

export default function Gastos() {
  const { isEncargado } = useAuth()
  const [gastos, setGastos]       = useState([])
  const [loading, setLoading]     = useState(true)
  const [form, setForm]           = useState(emptyForm())
  const [saving, setSaving]       = useState(false)
  const [toast, setToast]         = useState(null)
  const [showForm, setShowForm]   = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try {
      const { data } = await api.get('/gastos/')
      setGastos(data)
    } finally {
      setLoading(false)
    }
  }

  async function guardar() {
    if (!form.descripcion || !form.monto) {
      showToast('Completá descripción y monto', 'error')
      return
    }
    setSaving(true)
    try {
      await api.post('/gastos/', {
        fecha: form.fecha,
        descripcion: form.descripcion,
        monto: Number(form.monto),
        categoria: form.categoria,
      })
      showToast('✓ Gasto registrado', 'success')
      setForm(emptyForm())
      setShowForm(false)
      load()
    } catch (err) {
      showToast(err.response?.data?.detail || 'Error', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function eliminar(id) {
    if (!window.confirm('¿Eliminar este gasto?')) return
    try {
      await api.delete(`/gastos/${id}`)
      load()
    } catch { showToast('Error al eliminar', 'error') }
  }

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2800)
  }

  function fmt(n) { return '$' + (n || 0).toLocaleString('es-AR', { minimumFractionDigits: 0 }) }

  function catInfo(val) {
    return CATEGORIAS.find(c => c.value === val) || CATEGORIAS[3]
  }

  // Totales por categoría
  const totalPorCat = CATEGORIAS.map(cat => ({
    ...cat,
    total: gastos.filter(g => g.categoria === cat.value).reduce((s, g) => s + g.monto, 0),
  }))
  const totalGeneral = gastos.reduce((s, g) => s + g.monto, 0)

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <div className="card" style={{ background: 'linear-gradient(135deg,#017a72,#01b8a8)', color:'#fff', marginBottom: 16 }}>
        <div className="row-between">
          <div>
            <div style={{ fontWeight: 800, fontSize: 18 }}>💸 Gastos operativos</div>
            <div style={{ fontSize: 13, opacity: .85, marginTop: 2 }}>Total: {fmt(totalGeneral)}</div>
          </div>
          {isEncargado && (
            <button onClick={() => setShowForm(!showForm)} style={{
              background: 'rgba(255,255,255,0.2)', border: '1.5px solid rgba(255,255,255,0.5)',
              borderRadius: 10, padding: '8px 16px',
              color: '#fff', fontFamily: 'inherit', fontWeight: 700, fontSize: 14, cursor: 'pointer',
            }}>
              {showForm ? '✕ Cerrar' : '+ Nuevo gasto'}
            </button>
          )}
        </div>
      </div>

      {/* Resumen por categoría */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
        {totalPorCat.map(cat => (
          <div key={cat.value} className="card" style={{ marginBottom: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: cat.color }}>{cat.label}</div>
            <div style={{ fontSize: 20, fontWeight: 800, marginTop: 4 }}>{fmt(cat.total)}</div>
          </div>
        ))}
      </div>

      {/* Formulario */}
      {showForm && isEncargado && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Registrar gasto</div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div className="field" style={{ marginBottom: 0 }}>
              <label>Fecha</label>
              <input type="date" value={form.fecha} onChange={e => setForm(p => ({ ...p, fecha: e.target.value }))} />
            </div>
            <div className="field" style={{ marginBottom: 0 }}>
              <label>Categoría</label>
              <select value={form.categoria} onChange={e => setForm(p => ({ ...p, categoria: e.target.value }))}>
                {CATEGORIAS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
          </div>

          <div className="field" style={{ marginTop: 10 }}>
            <label>Descripción</label>
            <input type="text" placeholder="Gas, sueldos, reparación..." value={form.descripcion}
              onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))} />
          </div>

          <div className="field">
            <label>Monto ($)</label>
            <input type="number" min="0" step="0.01" placeholder="0.00" value={form.monto}
              onChange={e => setForm(p => ({ ...p, monto: e.target.value }))} />
          </div>

          <button className="btn btn-primary" onClick={guardar} disabled={saving}>
            {saving ? 'Guardando...' : '✓ Registrar gasto'}
          </button>
        </div>
      )}

      {/* Lista */}
      <div className="card-title">Gastos registrados</div>

      {gastos.length === 0 ? (
        <p className="empty-state">No hay gastos registrados</p>
      ) : (
        gastos.map(g => {
          const cat = catInfo(g.categoria)
          return (
            <div key={g.id} className="card" style={{ borderLeft: `4px solid ${cat.color}` }}>
              <div className="row-between">
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{g.descripcion}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                    {cat.label} · 📅 {g.fecha}
                    {g.registrado_por && ` · 👤 ${g.registrado_por}`}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontWeight: 800, fontSize: 16, color: 'var(--text)' }}>{fmt(g.monto)}</span>
                  {isEncargado && (
                    <button onClick={() => eliminar(g.id)} style={{
                      background: 'var(--red-bg)', color: 'var(--red-text)',
                      border: 'none', borderRadius: 8, padding: '5px 8px',
                      cursor: 'pointer', fontSize: 13, fontFamily: 'inherit',
                    }}>✕</button>
                  )}
                </div>
              </div>
            </div>
          )
        })
      )}

      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
    </div>
  )
}
