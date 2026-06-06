import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Ventas from './pages/Ventas'
import Stock from './pages/Stock'
import Analisis from './pages/Analisis'
import Caja from './pages/Caja'
import Gastos from './pages/Gastos'
import Productos from './pages/Productos'
import Proveedores from './pages/Proveedores'
import Informe from './pages/Informe'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="ventas"     element={<Ventas />} />
          <Route path="stock"      element={<Stock />} />
          <Route path="analisis"   element={<Analisis />} />
          <Route path="caja"       element={<Caja />} />
          <Route path="gastos"     element={<Gastos />} />
          <Route path="productos"  element={<Productos />} />
          <Route path="proveedores" element={<Proveedores />} />
          <Route path="informe"    element={<Informe />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
