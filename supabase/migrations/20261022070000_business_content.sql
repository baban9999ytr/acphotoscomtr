begin;
alter table public.site_settings
  add column if not exists photographer_name text not null default 'Arda Cesurtürk' check(length(photographer_name)<=160),
  add column if not exists photographer_bio text not null default '' check(length(photographer_bio)<=5000);

update public.site_settings
set photographer_name='Arda Cesurtürk',
    photographer_bio='18 yaşındaki fotoğrafçı Arda Cesurtürk; futbol, basketbol, tribün ve stadyum, portre, etkinlik ve sosyal sorumluluk alanlarında fotoğraf üretiyor. Arşivinde Gebzespor, Bursaspor–Mardinspor, Bursaspor Tribün & Arena ve Bursaspor Basketbol çekimleri; PUGNOVERDE 8 Mart etkinliği (Enes Aydın) ile Batuhan Uzan ve Enes Çelik portreleri bulunuyor. Kulüp veya marka onayı ima edilmez.',
    phone='+905315172842',
    email='cesurturk16@hotmail.com',
    instagram='https://www.instagram.com/acphotos.tr/',
    about='Arşiv başlıkları arasında Gebzespor, Bursaspor–Mardinspor, Bursaspor Tribün & Arena ve Bursaspor Basketbol çekimleri; PUGNOVERDE için 8 Mart Dünya Kadınlar Günü etkinliği (Enes Aydın) ve Batuhan Uzan ile Enes Çelik portreleri yer alıyor. Bu başlıklar kulüp veya marka onayı anlamına gelmez.'
where id='main';

insert into public.categories(name,slug,sort_order) values
  ('Spor','spor',0),('Futbol','futbol',1),('Basketbol','basketbol',2),('Tribün & Stadyum','tribun-stadyum',3),
  ('Portre','portre',4),('Etkinlik','etkinlik',5),('Sosyal Sorumluluk','sosyal-sorumluluk',6)
on conflict (slug) do nothing;
commit;
