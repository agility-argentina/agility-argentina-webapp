# Pendientes

## Infraestructura gratis (evitar Supabase Pro)

Decisión (14/11/2026): quedarse en los planes free de Supabase y Vercel. Supabase
Pro (~US$25/mes) es caro para la federación; lo que lo justificaba se resuelve así:

1. **Que Supabase no pause el proyecto.** El plan free lo pausa tras 7 días sin
   actividad. Un cron diario de Vercel (Hobby lo permite) que pegue a una ruta de
   la app que haga una consulta chica a la base.
2. **Backups propios.** GitHub Action programada (semanal) con `supabase db dump`,
   encriptado con una clave guardada como secret del repo (la base tiene DNIs y
   mails). Las fotos de libretas no entran en el dump; por ahora no se respaldan.
3. **Comprimir las libretas al subirlas** (de ~3 MB a ~200–300 KB) para que el
   storage del plan free dure.

Vercel Hobby es solo para uso no comercial: si el sitio empieza a cobrar algo
(inscripciones, aranceles), revisar si corresponde Vercel Pro.

## Cuando esté el dominio

- Comprar el dominio en nic.ar (en pesos; los revendedores cobran mucho más).
- Mails con Resend (free: 3.000/mes, 100/día) para el botón "Enviar recordatorio
  a los clubes involucrados" del modal de vacunas por vencer, que hoy no envía nada.
- Cambiar la Site URL de Supabase Auth (Authentication → URL Configuration), que
  hoy apunta a localhost, y armar el flujo de "olvidé mi contraseña".

## App

- Mostrar un error cuando falla una consulta en los paneles, en vez de quedar vacíos.
- Que el admin pueda corregir un nº de registro mal cargado (desde el modal "Ver").
- Libretas aprobadas sin fecha de vencimiento nunca vencen: definir si deberían
  mostrarse como "sin validar".
