create table if not exists court_reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  case_id uuid references cases(id),
  remind_at timestamptz not null,
  notes text,
  created_at timestamptz default now()
);

alter table court_reminders enable row level security;

create policy court_reminders_select on court_reminders for select using (auth.uid() = user_id);
create policy court_reminders_insert on court_reminders for insert with check (auth.uid() = user_id);
create policy court_reminders_update on court_reminders for update using (auth.uid() = user_id);
create policy court_reminders_delete on court_reminders for delete using (auth.uid() = user_id);

create table if not exists court_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  case_id uuid references cases(id),
  document_url text not null,
  description text,
  created_at timestamptz default now()
);

alter table court_documents enable row level security;

create policy court_documents_select on court_documents for select using (auth.uid() = user_id);
create policy court_documents_insert on court_documents for insert with check (auth.uid() = user_id);
create policy court_documents_update on court_documents for update using (auth.uid() = user_id);
create policy court_documents_delete on court_documents for delete using (auth.uid() = user_id);
