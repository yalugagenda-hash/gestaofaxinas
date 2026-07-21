import { useState, FormEvent } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { useAmbientes, useAmbienteMutations } from '../../hooks/useAmbientes'
import Modal from '../../components/Modal'
import ConfirmDialog from '../../components/ConfirmDialog'
import type { Ambiente } from '../../types'

export default function AmbientesList() {
  const { data: ambientes, isLoading } = useAmbientes()
  const { criar, atualizar, remover } = useAmbienteMutations()

  const [editing, setEditing] = useState<Ambiente | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [deleting, setDeleting] = useState<Ambiente | null>(null)

  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')

  function openNew() {
    setEditing(null)
    setNome('')
    setDescricao('')
    setShowForm(true)
  }

  function openEdit(a: Ambiente) {
    setEditing(a)
    setNome(a.nome)
    setDescricao(a.descricao || '')
    setShowForm(true)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (editing) {
      await atualizar.mutateAsync({ id: editing.id, nome, descricao })
    } else {
      await criar.mutateAsync({ nome, descricao })
    }
    setShowForm(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Ambientes</h1>
        <button className="btn-primary" onClick={openNew}>
          <Plus size={16} /> Novo ambiente
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
            {ambientes?.map((a) => (
              <tr key={a.id} className="border-b border-gray-100 last:border-0">
                <td className="px-4 py-3">{a.nome}</td>
                <td className="px-4 py-3 text-gray-500">{a.descricao || '-'}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(a)} className="text-gray-500 hover:text-brand-600">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => setDeleting(a)} className="text-gray-500 hover:text-red-600">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!isLoading && ambientes?.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-gray-400">
                  Nenhum ambiente cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <Modal title={editing ? 'Editar ambiente' : 'Novo ambiente'} onClose={() => setShowForm(false)} size="sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Nome</label>
              <input className="input" required value={nome} onChange={(e) => setNome(e.target.value)} />
            </div>
            <div>
              <label className="label">Descrição</label>
              <textarea className="input" rows={2} value={descricao} onChange={(e) => setDescricao(e.target.value)} />
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
          title="Excluir ambiente"
          message={`Tem certeza que deseja excluir "${deleting.nome}"? Itens vinculados ficarão sem ambiente.`}
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
