-- User table
create table if not exists public."User" (
    id uuid primary key default gen_random_uuid(),
    email text not null unique,
    full_name text,
    created_at timestamp with time zone default timezone('utc', now()) not null
);

-- Post table
create table if not exists public.Post (
    id uuid primary key default gen_random_uuid(),
    platform text not null,
    content text not null,
    user_handle text,
    timestamp timestamp with time zone not null,
    sentiment_score float8,
    emotion text,
    metadata jsonb
);

-- Report table
create table if not exists public.Report (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public."User"(id) on delete cascade,
    created_at timestamp with time zone default timezone('utc', now()) not null,
    summary text,
    metrics jsonb not null
);

-- Alert table
create table if not exists public.Alert (
    id uuid primary key default gen_random_uuid(),
    post_id uuid references public.Post(id) on delete cascade,
    triggered_at timestamp with time zone default timezone('utc', now()) not null,
    alert_type text not null,
    description text
);

-- PlatformSource table
create table if not exists public.PlatformSource (
    id uuid primary key default gen_random_uuid(),
    platform text not null,
    api_connected boolean not null,
    connected_at timestamp with time zone default timezone('utc', now()) not null
);

-- Feedback table
create table if not exists public.Feedback (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public."User"(id) on delete cascade,
    message text not null,
    created_at timestamp with time zone default timezone('utc', now()) not null
); 