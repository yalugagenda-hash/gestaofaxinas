export interface Categoria {
  id: string
  nome: string
  descricao?: string | null
  cor?: string | null
  created_at: string
}

export interface Ambiente {
  id: string
  nome: string
  descricao?: string | null
  created_at: string
}

export type EstadoItem = 'novo' | 'bom' | 'regular' | 'ruim' | 'baixado'

export interface ItemFoto {
  id: string
  item_id: string
  url: string
  path: string
  created_at: string
}

export interface Item {
  id: string
  patrimonio: string
  nome: string
  descricao?: string | null
  categoria_id: string | null
  ambiente_id: string | null
  estado: EstadoItem
  valor_aquisicao?: number | null
  data_aquisicao?: string | null
  observacoes?: string | null
  created_at: string
  updated_at: string
  categoria?: Categoria | null
  ambiente?: Ambiente | null
  fotos?: ItemFoto[]
}

export interface ItemFiltros {
  busca?: string
  categoria_id?: string
  ambiente_id?: string
  estado?: EstadoItem | ''
}
