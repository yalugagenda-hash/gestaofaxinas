import { Search } from 'lucide-react'
import type { Categoria, Ambiente, ItemFiltros } from '../types'

export default function SearchFilter({
  filtros,
  onChange,
  categorias,
  ambientes,
}: {
  filtros: ItemFiltros
  onChange: (f: ItemFiltros) => void
  categorias: Categoria[]
  ambientes: Ambiente[]
}) {
  return (
    <div className="card flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
      <div className="relative flex-1">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          className="input pl-9"
          placeholder="Buscar por nome ou nº de patrimônio..."
          value={filtros.busca || ''}
          onChange={(e) => onChange({ ...filtros, busca: e.target.value })}
        />
      </div>
      <select
        className="input lg:w-48"
        value={filtros.categoria_id || ''}
        onChange={(e) => onChange({ ...filtros, categoria_id: e.target.value })}
      >
        <option value="">Todas categorias</option>
        {categorias.map((c) => (
          <option key={c.id} value={c.id}>
            {c.nome}
          </option>
        ))}
      </select>
      <select
        className="input lg:w-48"
        value={filtros.ambiente_id || ''}
        onChange={(e) => onChange({ ...filtros, ambiente_id: e.target.value })}
      >
        <option value="">Todos ambientes</option>
        {ambientes.map((a) => (
          <option key={a.id} value={a.id}>
            {a.nome}
          </option>
        ))}
      </select>
      <select
        className="input lg:w-40"
        value={filtros.estado || ''}
        onChange={(e) => onChange({ ...filtros, estado: e.target.value as ItemFiltros['estado'] })}
      >
        <option value="">Todos estados</option>
        <option value="novo">Novo</option>
        <option value="bom">Bom</option>
        <option value="regular">Regular</option>
        <option value="ruim">Ruim</option>
        <option value="baixado">Baixado</option>
      </select>
    </div>
  )
}
