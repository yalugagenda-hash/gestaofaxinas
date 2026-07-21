import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export interface DashboardData {
  totalItens: number
  totalCategorias: number
  totalAmbientes: number
  valorTotal: number
  porEstado: Record<string, number>
  porCategoria: { nome: string; total: number }[]
  porAmbiente: { nome: string; total: number }[]
}

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async (): Promise<DashboardData> => {
      const [itensRes, categoriasRes, ambientesRes] = await Promise.all([
        supabase.from('itens').select('estado, valor_aquisicao, categoria:categorias(nome), ambiente:ambientes(nome)'),
        supabase.from('categorias').select('id', { count: 'exact', head: true }),
        supabase.from('ambientes').select('id', { count: 'exact', head: true }),
      ])

      if (itensRes.error) throw itensRes.error

      const itens = itensRes.data as any[]

      const porEstado: Record<string, number> = {}
      const porCategoriaMap: Record<string, number> = {}
      const porAmbienteMap: Record<string, number> = {}
      let valorTotal = 0

      for (const item of itens) {
        porEstado[item.estado] = (porEstado[item.estado] || 0) + 1
        valorTotal += Number(item.valor_aquisicao) || 0

        const catNome = item.categoria?.nome || 'Sem categoria'
        porCategoriaMap[catNome] = (porCategoriaMap[catNome] || 0) + 1

        const ambNome = item.ambiente?.nome || 'Sem ambiente'
        porAmbienteMap[ambNome] = (porAmbienteMap[ambNome] || 0) + 1
      }

      return {
        totalItens: itens.length,
        totalCategorias: categoriasRes.count || 0,
        totalAmbientes: ambientesRes.count || 0,
        valorTotal,
        porEstado,
        porCategoria: Object.entries(porCategoriaMap).map(([nome, total]) => ({ nome, total })),
        porAmbiente: Object.entries(porAmbienteMap).map(([nome, total]) => ({ nome, total })),
      }
    },
  })
}
