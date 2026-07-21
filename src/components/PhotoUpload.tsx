import { useRef, useState } from 'react'
import { Upload, Trash2, Loader2 } from 'lucide-react'
import type { ItemFoto } from '../types'

export default function PhotoUpload({
  fotos,
  onUpload,
  onRemove,
  uploading,
}: {
  fotos: ItemFoto[]
  onUpload: (files: File[]) => void
  onRemove: (foto: ItemFoto) => void
  uploading?: boolean
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [removingId, setRemovingId] = useState<string | null>(null)

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    onUpload(Array.from(files))
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {fotos.map((foto) => (
          <div key={foto.id} className="group relative aspect-square overflow-hidden rounded-lg border border-gray-200">
            <img src={foto.url} alt="Foto do item" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => {
                setRemovingId(foto.id)
                onRemove(foto)
              }}
              className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
            >
              {removingId === foto.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-gray-300 text-gray-400 hover:border-brand-400 hover:text-brand-500"
        >
          {uploading ? <Loader2 size={20} className="animate-spin" /> : <Upload size={20} />}
          <span className="text-xs">{uploading ? 'Enviando...' : 'Adicionar'}</span>
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  )
}
