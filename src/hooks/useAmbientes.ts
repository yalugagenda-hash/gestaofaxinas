import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Ambiente } from '../types'

const KEY = ['ambientes']

export function useAmbientes() {
  return useQuery({
    queryKey: KEY,
    queryFn: async () => {
      const { data, error } = await supabase.from('ambientes').select('*').order('nome')
      if (error) throw error
      return data as Ambiente[]
    },
  })
}

export function useAmbienteMutations() {
  const qc = useQueryClient()

  const criar = useMutation({
    mutationFn: async (payload: Partial<Ambiente>) => {
      const { data, error } = await supabase.from('ambientes').insert(payload).select().single()
      if (error) throw error
      return data as Ambiente
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })

  const atualizar = useMutation({
    mutationFn: async ({ id, ...payload }: Partial<Ambiente> & { id: string }) => {
      const { data, error } = await supabase.from('ambientes').update(payload).eq('id', id).select().single()
      if (error) throw error
      return data as Ambiente
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })

  const remover = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('ambientes').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })

  return { criar, atualizar, remover }
}
