-- ==========================================================
-- Schema: Sistema de Inventário Patrimonial
-- Execute este script no SQL Editor do Supabase
-- ==========================================================

create extension if not exists "uuid-ossp";

-- ==========================================================
-- Tabelas
-- ==========================================================

create table if not exists categorias (
  id uuid primary key default uuid_generate_v4(),
  nome text not null,
  descricao text,
  cor text default '#3b82f6',
  created_at timestamptz not null default now()
);

create table if not exists ambientes (
  id uuid primary key default uuid_generate_v4(),
  nome text not null,
  descricao text,
  created_at timestamptz not null default now()
);

create table if not exists itens (
  id uuid primary key default uuid_generate_v4(),
  patrimonio text not null unique,
  nome text not null,
  descricao text,
  categoria_id uuid references categorias(id) on delete set null,
  ambiente_id uuid references ambientes(id) on delete set null,
  estado text not null default 'bom' check (estado in ('novo','bom','regular','ruim','baixado')),
  valor_aquisicao numeric(12,2),
  data_aquisicao date,
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists item_fotos (
  id uuid primary key default uuid_generate_v4(),
  item_id uuid not null references itens(id) on delete cascade,
  url text not null,
  path text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_itens_categoria on itens(categoria_id);
create index if not exists idx_itens_ambiente on itens(ambiente_id);
create index if not exists idx_itens_estado on itens(estado);
create index if not exists idx_item_fotos_item on item_fotos(item_id);

-- ==========================================================
-- Trigger updated_at
-- ==========================================================

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_itens_updated_at on itens;
create trigger trg_itens_updated_at
before update on itens
for each row execute function set_updated_at();

-- ==========================================================
-- Row Level Security
-- ==========================================================

alter table categorias enable row level security;
alter table ambientes enable row level security;
alter table itens enable row level security;
alter table item_fotos enable row level security;

drop policy if exists "categorias_all_authenticated" on categorias;
create policy "categorias_all_authenticated" on categorias
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "ambientes_all_authenticated" on ambientes;
create policy "ambientes_all_authenticated" on ambientes
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "itens_all_authenticated" on itens;
create policy "itens_all_authenticated" on itens
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "item_fotos_all_authenticated" on item_fotos;
create policy "item_fotos_all_authenticated" on item_fotos
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ==========================================================
-- Storage (bucket de fotos)
-- ==========================================================

insert into storage.buckets (id, name, public)
values ('fotos', 'fotos', true)
on conflict (id) do nothing;

drop policy if exists "fotos_select_public" on storage.objects;
create policy "fotos_select_public" on storage.objects
  for select using (bucket_id = 'fotos');

drop policy if exists "fotos_insert_authenticated" on storage.objects;
create policy "fotos_insert_authenticated" on storage.objects
  for insert with check (bucket_id = 'fotos' and auth.role() = 'authenticated');

drop policy if exists "fotos_delete_authenticated" on storage.objects;
create policy "fotos_delete_authenticated" on storage.objects
  for delete using (bucket_id = 'fotos' and auth.role() = 'authenticated');

-- ==========================================================
-- Dados iniciais (opcional)
-- ==========================================================

insert into categorias (nome, descricao, cor) values
  ('Móveis', 'Mesas, cadeiras, armários', '#3b82f6'),
  ('Eletrônicos', 'Computadores, monitores, periféricos', '#8b5cf6'),
  ('Equipamentos', 'Máquinas e equipamentos diversos', '#10b981')
on conflict do nothing;

insert into ambientes (nome, descricao) values
  ('Recepção', 'Área de recepção e espera'),
  ('Sala de Reuniões', 'Sala principal de reuniões'),
  ('Almoxarifado', 'Depósito de materiais')
on conflict do nothing;
