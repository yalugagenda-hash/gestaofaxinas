import { useState, FormEvent } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { useCategorias, useCategoriaMutations } from '../../hooks/useCategorias'
import Modal from '../../components/Modal'
import ConfirmDialog from '../../components/ConfirmDialog'
import type { Categoria } from '../../types'

export default function CategoriasList() {
  const { data: categorias, isLoading } = useCategorias()
  const { criar, atualizar, remover } = useCategoriaMutations()

  const [editing, setEditing] = useState<Categoria | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [deleting, setDeleting] = useState<Categoria | null>(null)

  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [cor, setCor] = useState('#3b82f6')

  function openNew() {
    setEditing(null)
    setNome('')
    setDescricao('')
    setCor('#3b82f6')
    setShowForm(true)
  }

  function openEdit(c: Categoria) {
    setEditing(c)
    setNome(c.nome)
    setDescricao(c.descricao || '')
    setCor(c.cor || '#3b82f6')
    setShowForm(true)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (editing) {
      await atualizar.mutateAsync({ id: editing.id, nome, descricao, cor })
    } else {
      await criar.mutateAsync({ nome, descricao, cor })
    }
    setShowForm(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Categorias</h1>
        <button className="btn-primary" onClick={openNew}>
          <Plus size={16} /> Nova categoria
        </button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Descrição</th>
              <th className="px-4 py-3 w-24">Ações</th>
            </tr>
          </thead>
          <tbody>
            {categorias?.map((c) => (
              <tr key={c.id} className="border-b border-gray-100 last:border-0">
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: c.cor || '#3b82f6' }} />
                    {c.nome}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">{c.descricao || '-'}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(c)} className="text-gray-500 hover:text-brand-600">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => setDeleting(c)} className="text-gray-500 hover:text-red-600">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!isLoading && categorias?.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-gray-400">
                  Nenhuma categoria cadastrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <Modal title={editing ? 'Editar categoria' : 'Nova categoria'} onClose={() => setShowForm(false)} size="sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Nome</label>
              <input className="input" required value={nome} onChange={(e) => setNome(e.target.value)} />
            </div>
            <div>
              <label className="label">Descrição</label>
              <textarea className="input" rows={2} value={descricao} onChange={(e) => setDescricao(e.target.value)} />
            </div>
            <div>
              <label className="label">Cor</label>
              <input type="color" className="h-10 w-16 rounded border border-gray-300" value={cor} onChange={(e) => setCor(e.target.value)} />
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>
                Cancelar
              </button>
              <button type="submit" className="btn-primary" disabled={criar.isPending || atualizar.isPending}>
                Salvar
              </button>
            </div>
          </form>
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          title="Excluir categoria"
          message={`Tem certeza que deseja excluir "${deleting.nome}"? Itens vinculados ficarão sem categoria.`}
          onCancel={() => setDeleting(null)}
          onConfirm={async () => {
            await remover.mutateAsync(deleting.id)
            setDeleting(null)
          }}
          loading={remover.isPending}
        />
      )}
    </div>
  )
}
