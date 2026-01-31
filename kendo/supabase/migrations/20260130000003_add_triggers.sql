-- Phone sanitization (remove hyphens)
create or replace function public.sanitize_phone()
returns trigger as $$
begin
  if new.phone is not null then
    new.phone = replace(new.phone, '-', '');
  end if;
  if new.guardian_phone is not null then
    new.guardian_phone = replace(new.guardian_phone, '-', '');
  end if;
  return new;
end;
$$ language plpgsql;

-- Apply sanitization triggers
create trigger sanitize_phone_profiles
before insert or update on public.profiles
for each row execute function public.sanitize_phone();

create trigger sanitize_phone_signup_requests
before insert or update on public.signup_requests
for each row execute function public.sanitize_phone();

-- Auto create profile on signup approval
create or replace function public.handle_signup_approval()
returns trigger as $$
begin
  if (new.status = 'approved' and (old.status is null or old.status != 'approved')) then
    insert into public.profiles (
      user_id, dojo_id, role, name, phone, is_adult, guardian_phone, created_at
    ) values (
      new.user_id,
      new.dojo_id,
      'member',
      new.name,
      new.phone,
      new.is_adult,
      new.guardian_phone,
      now()
    );
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_signup_approval
after insert or update on public.signup_requests
for each row execute function public.handle_signup_approval();

-- Auto set payment amount
create or replace function public.set_default_payment_amount()
returns trigger as $$
begin
  if (new.amount is null) then
    select default_fee into new.amount
    from public.dojos
    where id = new.dojo_id;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger set_payment_amount
before insert on public.payments
for each row execute function public.set_default_payment_amount();
