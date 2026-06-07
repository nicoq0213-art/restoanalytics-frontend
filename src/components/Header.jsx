import { useAuth } from '../context/AuthContext'

export default function Header({ title }) {
  const { user } = useAuth()

  return (
    <header style={{
      background: 'linear-gradient(160deg, #017a72, #01b8a8)',
      padding: '12px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexShrink: 0,
      height: 'var(--header-h)',
      position: 'sticky',
      top: 0,
      zIndex: 10,
    }}>
      {/* Logo + título */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <img src="/logo.png" width="36" height="36" alt="logo" style={{ borderRadius: '8px' }} />
        <div>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 15, lineHeight: 1.1 }}>
            {title || 'Resto Analytics'}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 11 }}>
            {user?.username} · {user?.rol}
          </div>
        </div>
      </div>

      {/* Badge EN VIVO */}
      <div style={{
        background: 'rgba(255,255,255,0.18)',
        border: '1px solid rgba(255,255,255,0.35)',
        borderRadius: 20,
        padding: '3px 10px',
        display: 'flex', alignItems: 'center', gap: 5,
      }}>
        <span style={{
          width: 7, height: 7,
          borderRadius: '50%',
          background: '#00ffea',
          display: 'inline-block',
          animation: 'pulse-dot 1.5s infinite',
        }} />
        <span style={{ color: '#fff', fontSize: 11, fontWeight: 700, letterSpacing: '.06em' }}>EN VIVO</span>
        <style>{`
          @keyframes pulse-dot {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: .5; transform: scale(.8); }
          }
        `}</style>
      </div>
    </header>
  )
}
