import { PGlite } from "@electric-sql/pglite";
import { readFile, readdir } from "node:fs/promises";
import assert from "node:assert/strict";
const db = new PGlite();
// Minimal provider schemas: real Postgres RLS execution, not a Supabase service emulator.
await db.exec(`create role anon; create role authenticated; create schema auth; create schema storage;
create table auth.users(id uuid primary key);
create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
grant usage on schema auth,storage to anon,authenticated; grant execute on function auth.uid() to anon,authenticated;
create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text,name text);
alter table storage.objects enable row level security; grant select,insert,update,delete on storage.objects to anon,authenticated;`);
const files = (await readdir("supabase/migrations"))
  .filter((f) => f.endsWith(".sql"))
  .sort();
for (const file of files)
  await db.exec(await readFile(`supabase/migrations/${file}`, "utf8"));
const admin = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  other = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const project = "11111111-1111-4111-8111-111111111111",
  draft = "22222222-2222-4222-8222-222222222222",
  photo = "33333333-3333-4333-8333-333333333333";
await db.exec(`insert into auth.users values('${admin}'),('${other}');insert into public.authorized_admins(user_id) values('${admin}');
insert into public.projects(id,title,slug,status) values('${project}','Published','published','published'),('${draft}','Draft','draft','draft');
insert into public.project_images(id,project_id,alt,paths,width,height,fingerprint) values('${photo}','${project}','Image',array['a','b','c'],100,100,repeat('a',64));
insert into storage.objects(bucket_id,name) values('photographs','a'),('photographs','secret');`);
let checks = 0;
async function role(name, user = "") {
  await db.exec(
    `reset role;set role ${name};select set_config('request.jwt.claim.sub','${user}',false);`,
  );
}
async function count(sql, expected, label) {
  const r = await db.query(sql);
  assert.equal(Number(r.rows[0].n), expected, label);
  checks++;
  console.log(`PASS ${label}`);
}
async function denied(sql, label) {
  let failed = false;
  try {
    await db.exec(sql);
  } catch {
    failed = true;
  }
  assert(failed, label);
  checks++;
  console.log(`PASS ${label}`);
}
for (const [name, user] of [
  ["anon", ""],
  ["authenticated", other],
]) {
  await role(name, user);
  await count(
    "select count(*) n from public.projects",
    1,
    `${name}: drafts hidden`,
  );
  await count(
    "select count(*) n from storage.objects",
    1,
    `${name}: private objects hidden`,
  );
  await denied(
    "insert into public.projects(title,slug) values('Bad','bad')",
    `${name}: insert denied`,
  );
  await denied(
    "insert into storage.objects(bucket_id,name) values('photographs','attack')",
    `${name}: upload denied`,
  );
  if (name === "authenticated") {
    await count(
      "with x as(update public.projects set title='Bad' returning id)select count(*) n from x",
      0,
      "nonadmin update denied",
    );
    await count(
      "with x as(delete from public.projects returning id)select count(*) n from x",
      0,
      "nonadmin delete denied",
    );
    await denied(
      `insert into public.authorized_admins(user_id) values('${other}')`,
      "self-escalation denied",
    );
    await count(
      "select count(*) n from public.contact_messages",
      0,
      "nonadmin cannot read contact messages",
    );
  } else {
    await denied(
      "update public.projects set title='Bad'",
      "anon update denied",
    );
    await denied("delete from public.projects", "anon delete denied");
    await denied(
      "select * from public.contact_messages",
      "anon cannot read contact messages",
    );
    await denied(
      "insert into public.contact_messages(name,email,message) values('Bad','bad@example.com','Not allowed direct insert')",
      "anon cannot directly insert contact messages",
    );
    const accepted = await db.query(
      "select public.submit_contact_message($1,$2,$3,$4) accepted",
      ["Test Visitor", "visitor@example.com", "This is a sample inquiry.", ""],
    );
    assert.equal(accepted.rows[0].accepted, true);
    checks++;
    console.log("PASS anon submits contact message through validated function");
    const trapped = await db.query(
      "select public.submit_contact_message($1,$2,$3,$4) accepted",
      ["Bot", "bot@example.com", "Automated form message.", "https://spam.example"],
    );
    assert.equal(trapped.rows[0].accepted, false);
    checks++;
    console.log("PASS contact honeypot silently drops bot submission");
    const repeated = await db.query(
      "select public.submit_contact_message($1,$2,$3,$4) accepted",
      ["Test Visitor", "visitor@example.com", "A repeated sample inquiry.", ""],
    );
    assert.equal(repeated.rows[0].accepted, false);
    checks++;
    console.log("PASS repeated contact submission is throttled");
  }
}
await role("authenticated", admin);
await count(
  "select count(*) n from public.contact_messages",
  1,
  "admin can read contact messages",
);
await db.exec(
  `select public.reorder_projects(array['${draft}','${project}']::uuid[])`,
);
await count(
  `select count(*) n from public.projects where id='${draft}' and sort_order=0`,
  1,
  "transactional album reorder",
);
await count("select count(*) n from public.projects", 2, "admin reads drafts");
await db.exec(
  `select public.set_cover('${photo}');select public.reorder_images(array['${photo}']::uuid[]);`,
);
await count(
  "select count(*) n from public.project_images where is_cover",
  1,
  "transactional cover",
);
await db.exec(
  `update public.projects set status='draft' where id='${project}'`,
);
await role("anon");
await count(
  "select count(*) n from public.project_images",
  0,
  "unpublish hides images",
);
await count(
  "select count(*) n from storage.objects",
  0,
  "unpublish revokes storage read",
);
await role("authenticated", admin);
await db.exec(
  `update public.projects set status='published' where id='${project}';update public.project_images set deleting=true where id='${photo}'`,
);
await role("anon");
await count(
  "select count(*) n from storage.objects",
  0,
  "pending deletion hides object",
);
await db.close();
console.log(
  `${checks} database security checks passed. Supabase HTTP/Auth/Storage service integration remains separate.`,
);
