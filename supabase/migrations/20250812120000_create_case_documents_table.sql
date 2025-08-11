create table if not exists case_documents (
  id uuid primary key default uuid_generate_v4(),
  case_id uuid references cases(id) on delete cascade,
  title text,
  content text,
  created_at timestamptz default now()
);
