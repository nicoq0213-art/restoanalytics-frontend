import { useLocation, useNavigate } from 'react-router-dom'

const NAV_ITEMS = [
  { path: '/',         label: 'Inicio',   icon: '🏠' },
  { path: '/ventas',   label: 'Ventas',   icon: '💰' },
  { path: '/stock',    label: 'Stock',    icon: '📦' },
  { path: '/analisis', label: 'Análisis', icon: '📊' },
  { path: '__mas__',   label: 'Más',      icon: '⚙️' },
]

export default function BottomNav({ onMasClick }) {
  const location = useLocation()
  const navigate = useNavigate()

  const masRoutes = ['/caja', '/gastos', '/productos', '/proveedores', '/informe']
  const masActive = masRoutes.some(r => location.pathname.startsWith(r))

  function handleClick(item) {
    if (item.path === '__mas__') {
      onMasClick()
    } else {
      navigate(item.path)
    }
  }

  function isActive(item) {
    if (item.path === '__mas__') return masActive
    if (item.path === '/') return location.pathname === '/'
    return location.pathname.startsWith(item.path)
  }

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100%',
      maxWidth: 480,
      height: 'var(--nav-h)',
      background: 'var(--card)',
      borderTop: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      zIndex: 20,
      boxShadow: '0 -4px 20px rgba(1,122,114,0.08)',
    }}>
      {NAV_ITEMS.map((item) => {
        const active = isActive(item)
        return (
          <button
            key={item.path}
            onClick={() => handleClick(item)}
            style={{
              flex: 1,
              height: '100%',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              position: 'relative',
              transition: 'opacity .15s',
              fontFamily: 'inherit',
            }}
          >
            {/* Punto activo arriba del ícono */}
            <div style={{
              position: 'absolute',
              bottom: 6,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 5, height: 5,
              borderRadius: '50%',
              background: active ? 'var(--primary)' : 'transparent',
              transition: 'background .2s',
            }} />

            <span style={{ fontSize: 22, lineHeight: 1 }}>{item.icon}</span>
            <span style={{
              fontSize: 10,
              fontWeight: active ? 700 : 500,
              color: active ? 'var(--primary)' : 'var(--text-muted)',
              letterSpacing: '.02em',
            }}>
              {item.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
