-- Patch: prevent users from self-promoting via the profiles UPDATE policy.
-- Run once in the Supabase SQL Editor.

create or replace function protect_is_admin()
returns trigger as $$
begin
  if new.is_admin is distinct from old.is_admin
     and auth.uid() is not null
     and not exists (select 1 from profiles where id = auth.uid() and is_admin) then
    new.is_admin := old.is_admin;
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists protect_is_admin_trigger on profiles;
create trigger protect_is_admin_trigger
  before update on profiles
  for each row execute procedure protect_is_admin();
