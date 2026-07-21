import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Categoria } from '../types'

const KEY = ['categorias']

export function useCategorias() {
  return useQuery({
    queryKey: KEY,
    queryFn: async () => {
      const { data, error } = await supabase.from('categorias').select('*').order('nome')
      if (error) throw error
      return data as Categoria[]
    },
  })
}

export function useCategoriaMutations() {
  const qc = useQueryClient()

  const criar = useMutation({
    mutationFn: async (payload: Partial<Categoria>) => {
      const { data, error } = await supabase.from('categorias').insert(payload).select().single()
      if (error) throw error
      return data as Categoria
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })

  const atualizar = useMutation({
    mutationFn: async ({ id, ...payload }: Partial<Categoria> & { id: string }) => {
      const { data, error } = await supabase.from('categorias').update(payload).eq('id', id).select().single()
      if (error) throw error
      return data as Categoria
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })

  const remover = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('categorias').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })

  return { criar, atualizar, remover }
}
