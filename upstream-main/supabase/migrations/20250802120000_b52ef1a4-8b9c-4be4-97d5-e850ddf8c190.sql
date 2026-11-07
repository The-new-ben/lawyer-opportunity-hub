create extension if not exists pg_net;

create or replace function public.auto_assign_lawyer()
returns trigger as $$
declare
  v_lawyer_id uuid;
  v_url text;
  v_payload jsonb;
begin
  select id into v_lawyer_id
  from public.lawyers
  where availability_status = 'available'
    and specializations @> array[new.legal_category]
  order by rating desc
  limit 1;

  if v_lawyer_id is not null then
    new.assigned_lawyer_id := v_lawyer_id;
    v_url := current_setting('app.settings.assignment_webhook', true);
    if coalesce(v_url, '') <> '' then
      v_payload := jsonb_build_object('lead_id', new.id);
      perform net.http_post(
        url := v_url,
        headers := '{"Content-Type":"application/json"}'::jsonb,
        body := v_payload::text
      );
    end if;
  end if;

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_auto_assign on public.leads;
create trigger trg_auto_assign
before insert on public.leads
for each row
when (new.assigned_lawyer_id is null)
execute function public.auto_assign_lawyer();
