-- Create consent events table
create table if not exists public.consent_events (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete cascade,
  consent boolean not null,
  recorded_at timestamptz not null default now()
);

-- Add consent and deletion flags to profiles
alter table public.profiles
  add column if not exists consent boolean default false,
  add column if not exists delete_requested boolean default false,
  add column if not exists anonymized boolean default false;

-- Trigger to log consent changes
create or replace function public.log_consent_change()
returns trigger as $$
begin
  insert into public.consent_events(profile_id, consent)
  values (new.id, new.consent);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_consent_change
after update of consent on public.profiles
for each row
when (new.consent is distinct from old.consent)
execute function public.log_consent_change();
