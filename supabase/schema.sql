create table public.products (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (length(trim(name)) > 0),
  category text not null default '',
  price integer not null check (price >= 0),
  stock integer not null default 0 check (stock >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (owner_id, name)
);

create table public.sales (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  payment_method text not null check (payment_method in ('現金', 'カード', 'QR Pay')),
  subtotal integer not null check (subtotal >= 0),
  service_fee integer not null check (service_fee >= 0),
  total integer not null check (total = subtotal + service_fee),
  created_at timestamptz not null default now()
);

create table public.sale_items (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  sale_id uuid not null references public.sales(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  unit_price integer not null check (unit_price >= 0),
  quantity integer not null check (quantity > 0)
);

alter table public.products enable row level security;
alter table public.sales enable row level security;
alter table public.sale_items enable row level security;

create policy "Users manage their products" on public.products
  for all to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "Users read their sales" on public.sales
  for select to authenticated
  using (owner_id = auth.uid());
create policy "Users create their sales" on public.sales
  for insert to authenticated
  with check (owner_id = auth.uid());

create policy "Users read their sale items" on public.sale_items
  for select to authenticated
  using (owner_id = auth.uid());
create policy "Users create their sale items" on public.sale_items
  for insert to authenticated
  with check (owner_id = auth.uid());

grant select, insert, update, delete on public.products to authenticated;
grant select, insert on public.sales to authenticated;
grant select, insert on public.sale_items to authenticated;

create or replace function public.adjust_inventory(p_product_id uuid, p_delta integer)
returns integer
language plpgsql
set search_path = ''
as $$
declare
  updated_stock integer;
begin
  if auth.uid() is null or p_delta = 0 then
    raise exception 'Invalid inventory adjustment';
  end if;

  update public.products
  set stock = stock + p_delta
  where id = p_product_id
    and owner_id = auth.uid()
    and stock + p_delta >= 0
  returning stock into updated_stock;

  if updated_stock is null then
    raise exception 'Product not found or stock would become negative';
  end if;

  return updated_stock;
end;
$$;

create or replace function public.complete_sale(p_payment_method text, p_items jsonb)
returns uuid
language plpgsql
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  sale_id uuid;
  item jsonb;
  current_product public.products%rowtype;
  item_quantity integer;
  sale_subtotal integer := 0;
  sale_fee integer;
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;
  if p_payment_method not in ('現金', 'カード', 'QR Pay') then
    raise exception 'Invalid payment method';
  end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'At least one item is required';
  end if;

  for item in select value from jsonb_array_elements(p_items)
  loop
    item_quantity := (item->>'quantity')::integer;
    if item_quantity <= 0 then
      raise exception 'Quantity must be positive';
    end if;

    select * into current_product
    from public.products
    where id = (item->>'product_id')::uuid
      and owner_id = current_user_id
      and is_active
    for update;

    if not found or current_product.stock < item_quantity then
      raise exception 'Product is unavailable or stock is insufficient';
    end if;

    sale_subtotal := sale_subtotal + current_product.price * item_quantity;
  end loop;

  sale_fee := round(sale_subtotal * 0.08)::integer;
  insert into public.sales (owner_id, payment_method, subtotal, service_fee, total)
  values (current_user_id, p_payment_method, sale_subtotal, sale_fee, sale_subtotal + sale_fee)
  returning id into sale_id;

  for item in select value from jsonb_array_elements(p_items)
  loop
    item_quantity := (item->>'quantity')::integer;
    select * into current_product
    from public.products
    where id = (item->>'product_id')::uuid and owner_id = current_user_id
    for update;

    update public.products
    set stock = stock - item_quantity
    where id = current_product.id;

    insert into public.sale_items (owner_id, sale_id, product_id, product_name, unit_price, quantity)
    values (current_user_id, sale_id, current_product.id, current_product.name, current_product.price, item_quantity);
  end loop;

  return sale_id;
end;
$$;

revoke all on function public.adjust_inventory(uuid, integer) from public;
revoke all on function public.complete_sale(text, jsonb) from public;
grant execute on function public.adjust_inventory(uuid, integer) to authenticated;
grant execute on function public.complete_sale(text, jsonb) to authenticated;

alter publication supabase_realtime add table public.products;
alter publication supabase_realtime add table public.sales;