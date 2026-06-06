import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import Header from './Header'
import BottomNav from './BottomNav'
import { useAuth } from '../context/AuthContext'

const MAS_ITEMS = [
  { path: '/caja',        label: 'Caja diaria',       icon: '🧾', desc: 'Cierre de caja' },
  { path: '/gastos',      label: 'Gastos operativos', icon: '💸', desc: 'Registro de egresos' },
  { path: '/productos',   label: 'Productos',         icon: '🍕', desc: 'ABM menú y recetas' },
  { path: '/proveedores', label: 'Proveedores',       icon: '🚚', desc: 'Compras de mercadería' },
  { path: '/informe',     label: 'Informe PDF',       icon: '📄', desc: 'Exportar resumen' },
]

export default function Layout() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const navigate = useNavigate()
  const { logout } = useAuth()

  function goTo(path) {
    navigate(path)
    setDrawerOpen(false)
  }

  return (
    <div className="app-shell">
      <Header />

      {/* Contenido principal */}
      <main className="page-content">
        <Outlet />
      </main>

      {/* Bottom nav */}
      <BottomNav onMasClick={() => setDrawerOpen(true)} />

      {/* Drawer overlay */}
      {drawerOpen && (
        <div
          onClick={() => setDrawerOpen(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(15,23,42,0.45)',
            zIndex: 30,
            animation: 'fadeIn .15s ease',
          }}
        />
      )}

      {/* Drawer panel */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: `translateX(-50%) translateY(${drawerOpen ? '0' : '110%'})`,
        width: '100%',
        maxWidth: 480,
        background: 'var(--card)',
        borderRadius: '20px 20px 0 0',
        zIndex: 40,
        transition: 'transform .28s cubic-bezier(.4,0,.2,1)',
        boxShadow: '0 -8px 40px rgba(1,122,114,0.18)',
        paddingBottom: 'env(safe-area-inset-bottom, 0)',
      }}>
        {/* Handle bar */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--border)' }} />
        </div>

        {/* Título drawer */}
        <div style={{ padding: '4px 20px 12px', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--primary)' }}>⚙️ Más opciones</span>
        </div>

        {/* Opciones */}
        <div style={{ padding: '8px 0' }}>
          {MAS_ITEMS.map((item) => (
            <button
              key={item.path}
              onClick={() => goTo(item.path)}
              style={{
                width: '100%',
                padding: '14px 20px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                fontFamily: 'inherit',
                textAlign: 'left',
                transition: 'background .12s',
              }}
              onTouchStart={e => e.currentTarget.style.background = 'var(--bg)'}
              onTouchEnd={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{
                width: 44, height: 44,
                borderRadius: 12,
                background: 'var(--bg)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, flexShrink: 0,
              }}>
                {item.icon}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--text)' }}>{item.label}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.desc}</div>
              </div>
              <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: 18 }}>›</span>
            </button>
          ))}

          {/* Cerrar sesión */}
          <div style={{ margin: '8px 16px 16px', borderTop: '1px solid var(--border)', paddingTop: 12 }}>
            <button
              onClick={() => { logout(); setDrawerOpen(false) }}
              style={{
                width: '100%',
                padding: '12px 20px',
                border: 'none',
                borderRadius: 10,
                background: 'var(--red-bg)',
                color: 'var(--red-text)',
                fontFamily: 'inherit',
                fontWeight: 600,
                fontSize: 15,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              🚪 Cerrar sesión
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
      `}</style>
    </div>
  )
}
