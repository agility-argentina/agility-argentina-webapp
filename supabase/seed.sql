-- Datos públicos y estables: regiones y directorio de clubes homologados
-- (esto se muestra tal cual en el portal público, no hay nada sensible).
-- Los datos de personas/duplas van aparte, en seed.local.sql (no versionado).

insert into regiones (nombre) values
  ('Buenos Aires'),
  ('Cuyo'),
  ('Sur');

insert into clubes (nombre, ciudad, region_id) values
  ('Agility Buenos Aires', 'Ciudad Evita', (select id from regiones where nombre = 'Buenos Aires')),
  ('Revamp Agility',       'San Justo',    (select id from regiones where nombre = 'Buenos Aires')),
  ('Cross Agility',        'Región Cuyo',  (select id from regiones where nombre = 'Cuyo')),
  ('Cure Agility',         'Región Cuyo',  (select id from regiones where nombre = 'Cuyo')),
  ('Ceacan',               'Región Sur',   (select id from regiones where nombre = 'Sur'));
