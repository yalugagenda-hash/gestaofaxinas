import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './routes/ProtectedRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ItensList from './pages/Itens/ItensList'
import ItemForm from './pages/Itens/ItemForm'
import ItemDetalhe from './pages/Itens/ItemDetalhe'
import CategoriasList from './pages/Categorias/CategoriasList'
import AmbientesList from './pages/Ambientes/AmbientesList'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/itens" element={<ItensList />} />
          <Route path="/itens/novo" element={<ItemForm />} />
          <Route path="/itens/:id" element={<ItemDetalhe />} />
          <Route path="/itens/:id/editar" element={<ItemForm />} />
          <Route path="/categorias" element={<CategoriasList />} />
          <Route path="/ambientes" element={<AmbientesList />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
