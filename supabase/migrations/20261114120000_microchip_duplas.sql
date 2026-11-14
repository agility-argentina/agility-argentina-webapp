-- Número de microchip del perro. Igual que `nreg`, es obligatorio para
-- G1–G3 y opcional para G0; esa regla se valida en la app, no acá, para no
-- romper las duplas que ya existen sin microchip cargado.
alter table duplas add column microchip text;
