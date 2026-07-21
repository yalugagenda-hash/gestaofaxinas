import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, QrCode, Pencil, Trash2, Image as ImageIcon } from 'lucide-react'
import { useItens, useItemMutations } from '../../hooks/useItens'
import { useCategorias } from '../../hooks/useCategorias'
import { useAmbientes } from '../../hooks/useAmbientes'
import SearchFilter from '../../components/SearchFilter'
import ConfirmDialog from '../../components/ConfirmDialog'
import QRCodeModal from '../../components/QRCodeModal'
import type { Item, ItemFiltros } from '../../types'

const ESTADO_BADGE: Record<string, string> = {
  novo: 'bg-emerald-100 text-emerald-700',
  bom: 'bg-blue-100 text-blue-700',
  regular: 'bg-amber-100 text-amber-700',
  ruim: 'bg-orange-100 text-orange-700',
  baixado: 'bg-red-100 text-red-700',
}

export default function ItensList() {
  const [filtros, setFiltros] = useState<ItemFiltros>({})
  const { data: itens, isLoading } = useItens(filtros)
  const { data: categorias } = useCategorias()
  const { data: ambientes } = useAmbientes()
  const { remover } = useItemMutations()

  const [deleting, setDeleting] = useState<Item | null>(null)
  const [qrItem, setQrItem] = useState<Item | null>(null)

  const listaCategorias = useMemo(() => categorias || [], [categorias])
  const listaAmbientes = useMemo(() => ambientes || [], [ambientes])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Itens</h1>
        <Link to="/itens/novo" className="btn-primary">
          <Plus size={16} /> Novo item
        </Link>
      </div>

      <SearchFilter filtros={filtros} onChange={setFiltros} categorias={listaCategorias} ambientes={listaAmbientes} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {itens?.map((item) => (
          <div key={item.id} className="card overflow-hidden">
            <div className="flex h-36 items-center justify-center bg-gray-100">
              {item.fotos && item.fotos.length > 0 ? (
                <img src={item.fotos[0].url} alt={item.nome} className="h-full w-full object-cover" />
              ) : (
                <ImageIcon className="text-gray-300" size={32} />
              )}
            </div>
            <div className="p-4">
              <div className="mb-1 flex items-start justify-between gap-2">
                <Link to={`/itens/${item.id}`} className="font-semibold hover:text-brand-600">
                  {item.nome}
                </Link>
                <span className={`whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ${ESTADO_BADGE[item.estado]}`}>
                  {item.estado}
                </span>
              </div>
              <p className="text-xs text-gray-500">Patrimônio: {item.patrimonio}</p>
              <p className="text-xs text-gray-500">
                {item.categoria?.nome || 'Sem categoria'} • {item.ambiente?.nome || 'Sem ambiente'}
              </p>

              <div className="mt-3 flex justify-end gap-2 border-t border-gray-100 pt-3">
                <button onClick={() => setQrItem(item)} className="text-gray-500 hover:text-brand-600" title="QR Code">
                  <QrCode size={16} />
                </button>
                <Link to={`/itens/${item.id}/editar`} className="text-gray-500 hover:text-brand-600" title="Editar">
                  <Pencil size={16} />
                </Link>
                <button onClick={() => setDeleting(item)} className="text-gray-500 hover:text-red-600" title="Excluir">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {!isLoading && itens?.length === 0 && (
        <div className="card p-10 text-center text-gray-400">Nenhum item encontrado.</div>
      )}

      {deleting && (
        <ConfirmDialog
          title="Excluir item"
          message={`Tem certeza que deseja excluir "${deleting.nome}"?`}
          onCancel={() => setDeleting(null)}
          onConfirm={async () => {
            await remover.mutateAsync(deleting.id)
            setDeleting(null)
          }}
          loading={remover.isPending}
        />
      )}

      {qrItem && <QRCodeModal item={qrItem} onClose={() => setQrItem(null)} />}
    </div>
  )
}
