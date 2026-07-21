import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase, FOTOS_BUCKET } from '../lib/supabase'
import type { Item, ItemFiltros } from '../types'

const SELECT = '*, categoria:categorias(*), ambiente:ambientes(*), fotos:item_fotos(*)'

export function useItens(filtros: ItemFiltros) {
  return useQuery({
    queryKey: ['itens', filtros],
    queryFn: async () => {
      let query = supabase.from('itens').select(SELECT).order('created_at', { ascending: false })

      if (filtros.busca) {
        query = query.or(`nome.ilike.%${filtros.busca}%,patrimonio.ilike.%${filtros.busca}%`)
      }
      if (filtros.categoria_id) query = query.eq('categoria_id', filtros.categoria_id)
      if (filtros.ambiente_id) query = query.eq('ambiente_id', filtros.ambiente_id)
      if (filtros.estado) query = query.eq('estado', filtros.estado)

      const { data, error } = await query
      if (error) throw error
      return data as unknown as Item[]
    },
  })
}

export function useItem(id?: string) {
  return useQuery({
    queryKey: ['item', id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase.from('itens').select(SELECT).eq('id', id).single()
      if (error) throw error
      return data as unknown as Item
    },
  })
}

export function useItemMutations() {
  const qc = useQueryClient()

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['itens'] })
    qc.invalidateQueries({ queryKey: ['dashboard'] })
  }

  const criar = useMutation({
    mutationFn: async (payload: Partial<Item>) => {
      const { data, error } = await supabase.from('itens').insert(payload).select().single()
      if (error) throw error
      return data as Item
    },
    onSuccess: invalidate,
  })

  const atualizar = useMutation({
    mutationFn: async ({ id, ...payload }: Partial<Item> & { id: string }) => {
      const { data, error } = await supabase
        .from('itens')
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as Item
    },
    onSuccess: (_data, vars) => {
      invalidate()
      qc.invalidateQueries({ queryKey: ['item', vars.id] })
    },
  })

  const remover = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('itens').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: invalidate,
  })

  const uploadFotos = useMutation({
    mutationFn: async ({ itemId, files }: { itemId: string; files: File[] }) => {
      for (const file of files) {
        const ext = file.name.split('.').pop()
        const path = `${itemId}/${crypto.randomUUID()}.${ext}`
        const { error: uploadError } = await supabase.storage.from(FOTOS_BUCKET).upload(path, file)
        if (uploadError) throw uploadError

        const { data: publicUrl } = supabase.storage.from(FOTOS_BUCKET).getPublicUrl(path)

        const { error: insertError } = await supabase.from('item_fotos').insert({
          item_id: itemId,
          url: publicUrl.publicUrl,
          path,
        })
        if (insertError) throw insertError
      }
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['item', vars.itemId] })
      qc.invalidateQueries({ queryKey: ['itens'] })
    },
  })

  const removerFoto = useMutation({
    mutationFn: async ({ fotoId, path, itemId }: { fotoId: string; path: string; itemId: string }) => {
      await supabase.storage.from(FOTOS_BUCKET).remove([path])
      const { error } = await supabase.from('item_fotos').delete().eq('id', fotoId)
      if (error) throw error
      return itemId
    },
    onSuccess: (itemId) => {
      qc.invalidateQueries({ queryKey: ['item', itemId] })
      qc.invalidateQueries({ queryKey: ['itens'] })
    },
  })

  return { criar, atualizar, remover, uploadFotos, removerFoto }
}
