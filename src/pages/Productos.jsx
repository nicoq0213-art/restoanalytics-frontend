import { useEffect, useState } from 'react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'

const emptyForm = () => ({
  nombre: '', precio_venta: '', activo: true, recetas: [],
})

export default function Productos() {
  const { isDueno } = useAuth()
  const [productos, setProductos]     = useState([])
  const [ingredientes, setIngredientes] = useState([])
  const [loading, setLoading]         = useState(true)
  const [modal, setModal]             = useState(null) // null | { modo: 'nuevo'|'editar', form, productoId }
  const [saving, setSaving]           = useState(false)
  const [toast, setToast]             = useState(null)
  const [expanded, setExpanded]       = useState(null)

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    setLoading(true)
    try {
      const [{ data: prods }, { data: ings }] = await Promise.all([
        api.get('/productos/?solo_activos=false'),
        api.get('/stock/'),
      ])
      setProductos(prods)
      setIngredientes(ings)
    } finally {
      setLoading(false)
    }
  }

  function abrirNuevo() {
    setModal({ modo: 'nuevo', form: emptyForm(), productoId: null })
  }

  function abrirEditar(p) {
    setModal({
      modo: 'editar',
      productoId: p.id,
      form: {
        nombre: p.nombre,
        precio_venta: p.precio_venta,
        activo: p.activo,
        recetas: p.recetas.map(r => ({ ingrediente_id: r.ingrediente_id, cantidad: r.cantidad })),
      },
    })
  }

  function addIngredienteReceta() {
    setModal(m => ({ ...m, form: { ...m.form, recetas: [...m.form.recetas, { ingrediente_id: '', cantidad: '' }] } }))
  }

  function updateRecetaItem(i, campo, val) {
    setModal(m => {
      const recetas = [...m.form.recetas]
      recetas[i] = { ...recetas[i], [campo]: val }
      return { ...m, form: { ...m.form, recetas } }
    })
  }

  function removeRecetaItem(i) {
    setModal(m => {
      const recetas = m.form.recetas.filter((_, idx) => idx !== i)
      return { ...m, form: { ...m.form, recetas } }
    })
  }

  async function guardar() {
    const { form, modo, productoId } = modal
    if (!form.nombre || !form.precio_venta) {
      showToast('Completá nombre y precio', 'error')
      return
    }
    const payload = {
      nombre: form.nombre,
      precio_venta: Number(form.precio_venta),
      activo: form.activo,
      recetas: form.recetas
        .filter(r => r.ingrediente_id && r.cantidad)
        .map(r => ({ ingrediente_id: Number(r.ingrediente_id), cantidad: Number(r.cantidad) })),
    }
    setSaving(true)
    try {
      if (modo === 'nuevo') await api.post('/productos/', payload)
      else await api.put(`/productos/${productoId}`, payload)
      showToast('✓ Producto guardado', 'success')
      setModal(null)
      loadAll()
    } catch (err) {
      showToast(err.response?.data?.detail || 'Error al guardar', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function desactivar(id) {
    if (!window.confirm('¿Desactivar este producto?')) return
    try {
      await api.delete(`/productos/${id}`)
      loadAll()
    } catch { showToast('Error al desactivar', 'error') }
  }

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2800)
  }

  function costo(recetas) {
    return recetas.reduce((sum, r) => {
      const ing = ingredientes.find(i => i.id === r.ingrediente_id)
      return sum + (ing ? ing.precio_promedio_compra * r.cantidad : 0)
    }, 0)
  }

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <div className="card" style={{ background: 'linear-gradient(135deg,#017a72,#01b8a8)', color:'#fff', marginBottom: 16 }}>
        <div className="row-between">
          <div>
            <div style={{ fontWeight: 800, fontSize: 18 }}>🍕 Productos</div>
            <div style={{ fontSize: 13, opacity: .85, marginTop: 2 }}>Menú y recetas</div>
          </div>
          {isDueno && (
            <button onClick={abrirNuevo} style={{
              background: 'rgba(255,255,255,0.2)',
              border: '1.5px solid rgba(255,255,255,0.5)',
              borderRadius: 10, padding: '8px 16px',
              color: '#fff', fontFamily: 'inherit',
              fontWeight: 700, fontSize: 14, cursor: 'pointer',
            }}>+ Nuevo</button>
          )}
        </div>
      </div>

      {!isDueno && (
        <div className="card" style={{ background: 'var(--yellow-bg)', border: '1px solid var(--yellow-border)', marginBottom: 12 }}>
          <span style={{ fontSize: 13, color: 'var(--yellow-text)' }}>
            👁 Vista solo lectura — Solo el dueño puede modificar productos y recetas.
          </span>
        </div>
      )}

      {productos.map(p => {
        const costoP = costo(p.recetas)
        const margen = p.precio_venta - costoP
        const isExp  = expanded === p.id

        return (
          <div key={p.id} className="card" style={{ opacity: p.activo ? 1 : .55 }}>
            <div className="row-between" style={{ cursor: 'pointer' }} onClick={() => setExpanded(isExp ? null : p.id)}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>
                  {!p.activo && '⚫ '}
                  {p.nombre}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                  Precio: <strong style={{ color: 'var(--primary)' }}>${p.precio_venta.toLocaleString('es-AR')}</strong>
                  {costoP > 0 && ` · Costo: $${costoP.toFixed(0)} · Margen: $${margen.toFixed(0)}`}
                </div>
              </div>
              <span style={{ fontSize: 18, color: 'var(--text-muted)' }}>{isExp ? '▲' : '▼'}</span>
            </div>

            {isExp && (
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                <div className="card-title">Receta</div>
                {p.recetas.length === 0 ? (
                  <p className="text-muted">Sin receta cargada</p>
                ) : (
                  p.recetas.map(r => (
                    <div key={r.ingrediente_id} className="row-between" style={{ padding: '5px 0', fontSize: 14 }}>
                      <span>{r.ingrediente_nombre}</span>
                      <span style={{ fontWeight: 600 }}>{r.cantidad} {r.unidad}</span>
                    </div>
                  ))
                )}

                {isDueno && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12 }}>
                    <button className="btn btn-ghost" onClick={() => abrirEditar(p)} style={{ fontSize: 13, padding: '9px' }}>
                      ✏️ Editar
                    </button>
                    {p.activo && (
                      <button className="btn btn-danger" onClick={() => desactivar(p.id)} style={{ fontSize: 13, padding: '9px' }}>
                        🗑 Desactivar
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}

      {/* Modal ABM */}
      {modal && (
        <>
          <div onClick={() => setModal(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,.5)', zIndex: 50 }} />
          <div style={{
            position: 'fixed', bottom: 0, left: '50%',
            transform: 'translateX(-50%)',
            width: '100%', maxWidth: 480,
            background: '#fff', borderRadius: '20px 20px 0 0',
            padding: '20px 20px 32px',
            zIndex: 60, maxHeight: '85dvh', overflowY: 'auto',
          }}>
            <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 16 }}>
              {modal.modo === 'nuevo' ? '➕ Nuevo producto' : '✏️ Editar producto'}
            </div>

            <div className="field">
              <label>Nombre</label>
              <input value={modal.form.nombre} onChange={e => setModal(m => ({ ...m, form: { ...m.form, nombre: e.target.value } }))} />
            </div>
            <div className="field">
              <label>Precio de venta ($)</label>
              <input type="number" value={modal.form.precio_venta} onChange={e => setModal(m => ({ ...m, form: { ...m.form, precio_venta: e.target.value } }))} />
            </div>

            <div className="card-title" style={{ marginTop: 12 }}>Ingredientes de la receta</div>
            {modal.form.recetas.map((r, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                <select value={r.ingrediente_id} onChange={e => updateRecetaItem(i, 'ingrediente_id', e.target.value)}>
                  <option value="">Seleccionar...</option>
                  {ingredientes.map(ing => <option key={ing.id} value={ing.id}>{ing.nombre} ({ing.unidad})</option>)}
                </select>
                <input
                  type="number" step="0.01" placeholder="Cant."
                  value={r.cantidad}
                  onChange={e => updateRecetaItem(i, 'cantidad', e.target.value)}
                  style={{ width: 70, padding: '10px 8px', border: '1.5px solid var(--border)', borderRadius: 8, fontFamily: 'inherit', fontSize: 14 }}
                />
                <button onClick={() => removeRecetaItem(i)} style={{
                  background: 'var(--red-bg)', color: 'var(--red-text)',
                  border: 'none', borderRadius: 8, padding: '10px', cursor: 'pointer', fontSize: 14,
                }}>✕</button>
              </div>
            ))}
            <button className="btn btn-ghost" onClick={addIngredienteReceta} style={{ marginBottom: 16, fontSize: 13 }}>
              + Agregar ingrediente
            </button>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancelar</button>
              <button className="btn btn-primary" onClick={guardar} disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </>
      )}

      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
    </div>
  )
}
