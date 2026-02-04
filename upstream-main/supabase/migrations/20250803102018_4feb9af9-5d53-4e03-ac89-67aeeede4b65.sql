create table if not exists public.github_prs (
  pr_id bigint primary key,
  status text not null,
  title text not null,
  url text,
  html_url text
);
