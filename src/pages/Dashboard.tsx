import { Package, Tags, MapPin, DollarSign } from 'lucide-react'
import { useDashboard } from '../hooks/useDashboard'

const ESTADO_LABEL: Record<string, string> = {
  novo: 'Novo',
  bom: 'Bom',
  regular: 'Regular',
  ruim: 'Ruim',
  baixado: 'Baixado',
}

const ESTADO_COLOR: Record<string, string> = {
  novo: 'bg-emerald-500',
  bom: 'bg-blue-500',
  regular: 'bg-amber-500',
  ruim: 'bg-orange-500',
  baixado: 'bg-red-500',
}

function formatBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function Dashboard() {
  const { data, isLoading } = useDashboard()

  if (isLoading || !data) {
    return <div className="text-gray-500">Carregando painel...</div>
  }

  const cards = [
    { label: 'Total de itens', value: data.totalItens, icon: Package, color: 'bg-brand-600' },
    { label: 'Categorias', value: data.totalCategorias, icon: Tags, color: 'bg-purple-600' },
    { label: 'Ambientes', value: data.totalAmbientes, icon: MapPin, color: 'bg-teal-600' },
    { label: 'Valor total', value: formatBRL(data.valorTotal), icon: DollarSign, color: 'bg-emerald-600' },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card flex items-center gap-4 p-5">
            <div className={`rounded-lg ${color} p-3 text-white`}>
              <Icon size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">{label}</p>
              <p className="text-xl font-bold">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-1">
          <h2 className="mb-4 font-semibold">Itens por estado</h2>
          <div className="space-y-3">
            {Object.entries(data.porEstado).map(([estado, total]) => (
              <div key={estado} className="flex items-center gap-3">
                <span className={`h-2.5 w-2.5 rounded-full ${ESTADO_COLOR[estado] || 'bg-gray-400'}`} />
                <span className="flex-1 text-sm text-gray-600">{ESTADO_LABEL[estado] || estado}</span>
                <span className="text-sm font-semibold">{total}</span>
              </div>
            ))}
            {Object.keys(data.porEstado).length === 0 && (
              <p className="text-sm text-gray-400">Nenhum item cadastrado.</p>
            )}
          </div>
        </div>

        <div className="card p-5 lg:col-span-1">
          <h2 className="mb-4 font-semibold">Itens por categoria</h2>
          <div className="space-y-3">
            {data.porCategoria.map((c) => (
              <div key={c.nome} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{c.nome}</span>
                <span className="font-semibold">{c.total}</span>
              </div>
            ))}
            {data.porCategoria.length === 0 && <p className="text-sm text-gray-400">Sem dados.</p>}
          </div>
        </div>

        <div className="card p-5 lg:col-span-1">
          <h2 className="mb-4 font-semibold">Itens por ambiente</h2>
          <div className="space-y-3">
            {data.porAmbiente.map((a) => (
              <div key={a.nome} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{a.nome}</span>
                <span className="font-semibold">{a.total}</span>
              </div>
            ))}
            {data.porAmbiente.length === 0 && <p className="text-sm text-gray-400">Sem dados.</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
