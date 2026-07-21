import { useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeft, Pencil, QrCode, Image as ImageIcon } from 'lucide-react'
import { useItem } from '../../hooks/useItens'
import QRCodeModal from '../../components/QRCodeModal'

const ESTADO_BADGE: Record<string, string> = {
  novo: 'bg-emerald-100 text-emerald-700',
  bom: 'bg-blue-100 text-blue-700',
  regular: 'bg-amber-100 text-amber-700',
  ruim: 'bg-orange-100 text-orange-700',
  baixado: 'bg-red-100 text-red-700',
}

function formatBRL(v?: number | null) {
  if (v === null || v === undefined) return '-'
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function ItemDetalhe() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: item, isLoading } = useItem(id)
  const [showQr, setShowQr] = useState(false)

  if (isLoading) return <div className="text-gray-500">Carregando...</div>
  if (!item) return <div className="text-gray-500">Item não encontrado.</div>

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft size={16} /> Voltar
      </button>

      <div className="card p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{item.nome}</h1>
            <p className="text-sm text-gray-500">Patrimônio: {item.patrimonio}</p>
          </div>
          <span className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${ESTADO_BADGE[item.estado]}`}>
            {item.estado}
          </span>
        </div>

        <div className="mt-4 flex gap-2">
          <Link to={`/itens/${item.id}/editar`} className="btn-secondary">
            <Pencil size={16} /> Editar
          </Link>
          <button className="btn-secondary" onClick={() => setShowQr(true)}>
            <QrCode size={16} /> QR Code
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs text-gray-400">Categoria</p>
            <p className="text-sm">{item.categoria?.nome || '-'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Ambiente</p>
            <p className="text-sm">{item.ambiente?.nome || '-'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Valor de aquisição</p>
            <p className="text-sm">{formatBRL(item.valor_aquisicao)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Data de aquisição</p>
            <p className="text-sm">{item.data_aquisicao || '-'}</p>
          </div>
        </div>

        {item.descricao && (
          <div className="mt-4">
            <p className="text-xs text-gray-400">Descrição</p>
            <p className="text-sm text-gray-700">{item.descricao}</p>
          </div>
        )}

        {item.observacoes && (
          <div className="mt-4">
            <p className="text-xs text-gray-400">Observações</p>
            <p className="text-sm text-gray-700">{item.observacoes}</p>
          </div>
        )}

        <div className="mt-6">
          <p className="mb-2 text-xs text-gray-400">Fotos</p>
          {item.fotos && item.fotos.length > 0 ? (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {item.fotos.map((f) => (
                <a key={f.id} href={f.url} target="_blank" rel="noreferrer" className="aspect-square overflow-hidden rounded-lg border border-gray-200">
                  <img src={f.url} alt={item.nome} className="h-full w-full object-cover" />
                </a>
              ))}
            </div>
          ) : (
            <div className="flex h-24 items-center justify-center rounded-lg border border-dashed border-gray-300 text-gray-300">
              <ImageIcon size={24} />
            </div>
          )}
        </div>
      </div>

      {showQr && <QRCodeModal item={item} onClose={() => setShowQr(false)} />}
    </div>
  )
}
