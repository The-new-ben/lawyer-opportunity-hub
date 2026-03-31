-- Create notification_preferences table
create table public.notification_preferences (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  email boolean default true,
  whatsapp boolean default true,
  in_app boolean default true,
  digest_frequency text default 'realtime' check (digest_frequency in ('realtime','daily','weekly')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create trigger update_notification_preferences_updated_at
before update on public.notification_preferences
for each row execute function update_updated_at_column();
