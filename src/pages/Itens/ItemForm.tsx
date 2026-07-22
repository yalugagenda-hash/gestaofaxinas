import { FormEvent, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Upload, X } from 'lucide-react'
import { useItem, useItemMutations } from '../../hooks/useItens'
import { useCategorias } from '../../hooks/useCategorias'
import { useAmbientes } from '../../hooks/useAmbientes'
import PhotoUpload from '../../components/PhotoUpload'
import type { EstadoItem, ItemFoto } from '../../types'

interface PendingFoto {
  file: File
  preview: string
}

export default function ItemForm() {
  const { id } = useParams()
  const isEdit = !!id
  const navigate = useNavigate()

  const { data: item } = useItem(id)
  const { data: categorias } = useCategorias()
  const { data: ambientes } = useAmbientes()
  const { criar, atualizar, uploadFotos, removerFoto } = useItemMutations()

  const [patrimonio, setPatrimonio] = useState('')
  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [categoriaId, setCategoriaId] = useState('')
  const [ambienteId, setAmbienteId] = useState('')
  const [estado, setEstado] = useState<EstadoItem>('bom')
  const [valorAquisicao, setValorAquisicao] = useState('')
  const [dataAquisicao, setDataAquisicao] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [saving, setSaving] = useState(false)

  // Fotos escolhidas antes de o item existir no banco (modo criação)
  const [pendingFotos, setPendingFotos] = useState<PendingFoto[]>([])
  const pendingInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (item) {
      setPatrimonio(item.patrimonio)
      setNome(item.nome)
      setDescricao(item.descricao || '')
      setCategoriaId(item.categoria_id || '')
      setAmbienteId(item.ambiente_id || '')
      setEstado(item.estado)
      setValorAquisicao(item.valor_aquisicao ? String(item.valor_aquisicao) : '')
      setDataAquisicao(item.data_aquisicao || '')
      setObservacoes(item.observacoes || '')
    }
  }, [item])

  // Libera as URLs de pré-visualização ao desmontar o componente
  useEffect(() => {
    return () => {
      pendingFotos.forEach((p) => URL.revokeObjectURL(p.preview))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handlePendingFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    const novas = Array.from(files).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }))
    setPendingFotos((prev) => [...prev, ...novas])
    if (pendingInputRef.current) pendingInputRef.current.value = ''
  }

  function removePendingFoto(index: number) {
    setPendingFotos((prev) => {
      const alvo = prev[index]
      if (alvo) URL.revokeObjectURL(alvo.preview)
      return prev.filter((_, i) => i !== index)
    })
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        patrimonio,
        nome,
        descricao,
        categoria_id: categoriaId || null,
        ambiente_id: ambienteId || null,
        estado,
        valor_aquisicao: valorAquisicao ? Number(valorAquisicao) : null,
        data_aquisicao: dataAquisicao || null,
        observacoes,
      }

      if (isEdit && id) {
        await atualizar.mutateAsync({ id, ...payload })
        navigate(`/itens/${id}`)
      } else {
        const novo = await criar.mutateAsync(payload)

        // Envia as fotos que ficaram pendentes durante a criação
        if (pendingFotos.length > 0) {
          await uploadFotos.mutateAsync({
            itemId: novo.id,
            files: pendingFotos.map((p) => p.file),
          })
        }

        navigate(`/itens/${novo.id}`)
      }
    } finally {
      setSaving(false)
    }
  }

  function handleUpload(files: File[]) {
    if (!id) return
    uploadFotos.mutate({ itemId: id, files })
  }

  function handleRemoveFoto(foto: ItemFoto) {
    if (!id) return
    removerFoto.mutate({ fotoId: foto.id, path: foto.path, itemId: id })
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft size={16} /> Voltar
      </button>

      <h1 className="text-2xl font-bold">{isEdit ? 'Editar item' : 'Novo item'}</h1>

      <form onSubmit={handleSubmit} className="card space-y-5 p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Nº de patrimônio</label>
            <input className="input" required value={patrimonio} onChange={(e) => setPatrimonio(e.target.value)} />
          </div>
          <div>
            <label className="label">Nome do item</label>
            <input className="input" required value={nome} onChange={(e) => setNome(e.target.value)} />
          </div>
        </div>

        <div>
          <label className="label">Descrição</label>
          <textarea className="input" rows={3} value={descricao} onChange={(e) => setDescricao(e.target.value)} />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="label">Categoria</label>
            <select className="input" value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)}>
              <option value="">Selecione...</option>
              {categorias?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Ambiente</label>
            <select className="input" value={ambienteId} onChange={(e) => setAmbienteId(e.target.value)}>
              <option value="">Selecione...</option>
              {ambientes?.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nome}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Estado de conservação</label>
            <select className="input" value={estado} onChange={(e) => setEstado(e.target.value as EstadoItem)}>
              <option value="novo">Novo</option>
              <option value="bom">Bom</option>
              <option value="regular">Regular</option>
              <option value="ruim">Ruim</option>
              <option value="baixado">Baixado</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Valor de aquisição (R$)</label>
            <input
              type="number"
              step="0.01"
              className="input"
              value={valorAquisicao}
              onChange={(e) => setValorAquisicao(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Data de aquisição</label>
            <input type="date" className="input" value={dataAquisicao} onChange={(e) => setDataAquisicao(e.target.value)} />
          </div>
        </div>

        <div>
          <label className="label">Observações</label>
          <textarea className="input" rows={2} value={observacoes} onChange={(e) => setObservacoes(e.target.value)} />
        </div>

        <div>
          <label className="label">Fotos</label>

          {isEdit ? (
            <PhotoUpload
              fotos={item?.fotos || []}
              onUpload={handleUpload}
              onRemove={handleRemoveFoto}
              uploading={uploadFotos.isPending}
            />
          ) : (
            <div>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                {pendingFotos.map((p, index) => (
                  <div key={p.preview} className="group relative aspect-square overflow-hidden rounded-lg border border-gray-200">
                    <img src={p.preview} alt="Pré-visualização" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePendingFoto(index)}
                      className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => pendingInputRef.current?.click()}
                  className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-gray-300 text-gray-400 hover:border-brand-400 hover:text-brand-500"
                >
                  <Upload size={20} />
                  <span className="text-xs">Adicionar</span>
                </button>
              </div>
              <input
                ref={pendingInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handlePendingFiles(e.target.files)}
              />
              <p className="mt-2 text-xs text-gray-400">
                As fotos selecionadas serão enviadas automaticamente ao salvar o item.
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
          <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>
            Cancelar
          </button>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  )
}
