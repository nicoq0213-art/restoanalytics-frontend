export default function AlertPill({ type = 'red', children }) {
  const styles = {
    red:    { background: 'var(--red-bg)',    color: 'var(--red-text)',    border: '1px solid var(--red-border)' },
    yellow: { background: 'var(--yellow-bg)', color: 'var(--yellow-text)', border: '1px solid var(--yellow-border)' },
    green:  { background: 'var(--green-bg)',  color: 'var(--green-text)',  border: '1px solid #86efac' },
  }
  return (
    <span className="badge" style={styles[type] || styles.red}>
      {children}
    </span>
  )
}
