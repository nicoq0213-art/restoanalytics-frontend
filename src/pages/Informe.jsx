import { useState } from 'react'
import api from '../api/axios'

const today = () => new Date().toISOString().slice(0, 10)

const PERIODOS = [
  { value: 'dia',    label: 'Hoy',      icon: '📅', desc: 'Informe del día seleccionado' },
  { value: 'semana', label: '7 días',   icon: '📆', desc: 'Últimos 7 días' },
  { value: 'mes',    label: 'Este mes', icon: '🗓', desc: 'Desde el 1° del mes actual' },
]

export default function Informe() {
  const [periodo, setPeriodo] = useState('dia')
  const [fecha, setFecha]     = useState(today())
  const [loading, setLoading] = useState(false)
  const [toast, setToast]     = useState(null)

  async function descargar() {
    setLoading(true)
    try {
      const response = await api.get(`/pdf/informe?periodo=${periodo}&fecha=${fecha}`, {
        responseType: 'blob',
      })
      const url = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))
      const a   = document.createElement('a')
      a.href    = url
      a.download = `informe_${periodo}_${fecha}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      showToast('✓ PDF descargado', 'success')
    } catch {
      showToast('Error al generar el PDF', 'error')
    } finally {
      setLoading(false)
    }
  }

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2800)
  }

  return (
    <div>
      <div className="card" style={{ background: 'linear-gradient(135deg,#017a72,#01b8a8)', color:'#fff', marginBottom: 16 }}>
        <div style={{ fontWeight: 800, fontSize: 18 }}>📄 Informe PDF</div>
        <div style={{ fontSize: 13, opacity: .85, marginTop: 2 }}>
          Generá un resumen ejecutivo del período
        </div>
      </div>

      {/* Selector de período */}
      <div className="card-title">Período del informe</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
        {PERIODOS.map(p => (
          <button
            key={p.value}
            onClick={() => setPeriodo(p.value)}
            style={{
              background: periodo === p.value ? 'var(--primary)' : 'var(--card)',
              border: `2px solid ${periodo === p.value ? 'var(--primary)' : 'var(--border)'}`,
              borderRadius: 'var(--radius-card)',
              padding: '14px 16px',
              display: 'flex', alignItems: 'center', gap: 14,
              cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
              transition: 'all .15s',
            }}
          >
            <span style={{ fontSize: 28 }}>{p.icon}</span>
            <div>
              <div style={{
                fontWeight: 700, fontSize: 16,
                color: periodo === p.value ? '#fff' : 'var(--text)',
              }}>{p.label}</div>
              <div style={{
                fontSize: 12,
                color: periodo === p.value ? 'rgba(255,255,255,.8)' : 'var(--text-muted)',
              }}>{p.desc}</div>
            </div>
            {periodo === p.value && (
              <span style={{ marginLeft: 'auto', color: '#fff', fontSize: 18 }}>✓</span>
            )}
          </button>
        ))}
      </div>

      {/* Fecha de referencia */}
      <div className="card">
        <div className="field" style={{ marginBottom: 0 }}>
          <label>Fecha de referencia</label>
          <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} max={today()} />
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
          {periodo === 'dia'    && `Se generará el informe del ${fecha}`}
          {periodo === 'semana' && `Se generarán los últimos 7 días hasta el ${fecha}`}
          {periodo === 'mes'    && `Se generará desde el 1° del mes hasta el ${fecha}`}
        </div>
      </div>

      {/* Contenido del informe */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-title">El PDF incluye</div>
        {[
          { icon: '💰', text: 'Ventas totales y unidades vendidas' },
          { icon: '🏆', text: 'Top productos del período' },
          { icon: '📦', text: 'Estado de stock (ingredientes críticos)' },
          { icon: '📈', text: 'Rentabilidad por producto (margen y %)' },
          { icon: '🧾', text: 'Resultado de caja del período' },
        ].map(i => (
          <div key={i.text} className="row" style={{ padding: '6px 0', gap: 12 }}>
            <span style={{ fontSize: 20, flexShrink: 0 }}>{i.icon}</span>
            <span style={{ fontSize: 14 }}>{i.text}</span>
          </div>
        ))}
      </div>

      <button
        className="btn btn-primary"
        onClick={descargar}
        disabled={loading}
        style={{ fontSize: 16 }}
      >
        {loading ? (
          '⏳ Generando PDF...'
        ) : (
          '⬇ Descargar PDF'
        )}
      </button>

      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
    </div>
  )
}
