import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate   = useNavigate()
  const [form, setForm]     = useState({ username: '', password: '' })
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [showPass, setShowPass] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.username, form.password)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || 'Usuario o contraseña incorrectos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'linear-gradient(160deg, #017a72 0%, #01b8a8 45%, #f2fafa 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 20px',
    }}>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <img src="/logo.png" alt="Resto Analytics" style={{ borderRadius: '20px', width: '80px', height: '80px', margin: '0 auto 14px', display: 'block' }} />
        <h1 style={{ color: '#fff', fontSize: 26, fontWeight: 800, letterSpacing: '-.02em' }}>
          Resto Analytics
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 4 }}>
          Sistema de gestión · Pizzería
        </p>
      </div>

      {/* Card formulario */}
      <div style={{
        width: '100%', maxWidth: 380,
        background: '#fff',
        borderRadius: 18,
        padding: 28,
        boxShadow: '0 12px 48px rgba(1,122,114,0.22)',
      }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, color: 'var(--text)' }}>
          Iniciar sesión
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Usuario</label>
            <input
              type="text"
              placeholder="admin / encargado"
              value={form.username}
              onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
              autoCapitalize="none"
              autoCorrect="off"
              required
            />
          </div>

          <div className="field">
            <label>Contraseña</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                required
                style={{ paddingRight: 44 }}
              />
              <button
                type="button"
                onClick={() => setShowPass(p => !p)}
                style={{
                  position: 'absolute',
                  right: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 20,
                  lineHeight: 1,
                  padding: 2,
                }}
              >
                {showPass ? '🙉' : '🙈'}
              </button>
            </div>
          </div>

          {error && (
            <div style={{
              background: 'var(--red-bg)',
              color: 'var(--red-text)',
              border: '1px solid var(--red-border)',
              borderRadius: 8,
              padding: '10px 14px',
              fontSize: 13,
              marginBottom: 14,
            }}>
              ⚠️ {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 18 }}>
          Un producto de NexBoards Analytics
        </p>
      </div>
    </div>
  )
}
