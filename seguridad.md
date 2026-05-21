# seguridad.md — Documento de Seguridad del Proyecto BI-Riesgo

> Este documento se construye de forma incremental. Las secciones 1-3 
> se redactan después del Paso 2 (Supabase). Las secciones 4-5 se 
> completan después del Paso 5 (Vercel). Las secciones 6-7 se cierran 
> antes de entregar el proyecto.
>
> Ítems marcados como **PENDIENTE: confirmar con TI** requieren 
> validación interna antes de usar este sistema con datos reales.

---

## 1. Datos en reposo y en tránsito

### Dónde viven los datos
La base de datos es un instancia PostgreSQL administrada por Supabase, 
alojada en la región **US East (N. Virginia, AWS us-east-1)**. Los datos 
no tienen copia en territorio mexicano ni en ningún datacenter de 
Supabase con jurisdicción mexicana — Supabase no ofrece región MX 
a la fecha de este documento.

**PENDIENTE: confirmar con TI** si la jurisdicción estadounidense 
(aplicable a datos almacenados en us-east-1) es aceptable para datos 
reales de cartera bajo la política interna de la empresa y los 
requerimientos de la LFPDPPP. En la etapa actual, la base contiene 
exclusivamente datos ficticios generados por script.

### Cifrado en reposo
Supabase cifra los volúmenes de almacenamiento en disco usando AES-256 
administrado por AWS (AWS EBS encryption). Este cifrado es transparente: 
no requiere configuración adicional y está activo por defecto en todos 
los proyectos de Supabase.

### Cifrado en tránsito
Toda comunicación entre el frontend y Supabase ocurre sobre HTTPS/TLS 1.2+. 
La librería `supabase-js` no permite conexiones HTTP en texto plano. 
El script de carga de datos (Paso 3) también usa HTTPS al insertar 
registros vía la API de Supabase.

### Retención y backups
El plan gratuito de Supabase retiene backups diarios por 7 días. 
Ver sección 5 (Continuidad) para detalle de plan de restauración.

---

## 2. Autenticación y autorización

### Modelo de acceso
Este proyecto en su estado actual no implementa autenticación de usuarios 
(login con usuario y contraseña). El dashboard es de **lectura pública** 
para cualquier persona que tenga la URL desplegada en Vercel.

Esta decisión es apropiada mientras los datos sean ficticios y el 
proyecto sea de portfolio. **No es apropiada para datos reales de 
cartera sin implementar autenticación** — ver limitaciones al final 
de este documento.

### Row Level Security (RLS)
RLS está habilitado en la tabla `cobranza`. Las políticas implementadas son:

| Operación | Rol      | ¿Permitida? | Condición         |
|-----------|----------|-------------|-------------------|
| SELECT    | anon     | Sí          | Todas las filas   |
| INSERT    | anon     | No          | Sin política → denegado por default |
| UPDATE    | anon     | No          | Sin política → denegado por default |
| DELETE    | anon     | No          | Sin política → denegado por default |
| Cualquiera| service_role | Sí      | Ignora RLS por diseño de Supabase |

La política exacta ejecutada en Supabase:
```sql
CREATE POLICY "lectura_publica_cobranza"
  ON cobranza
  FOR SELECT
  TO anon
  USING (true);
```

### Principio de mínimo privilegio
El frontend solo recibe la `anon key`. Con ella únicamente puede ejecutar 
SELECT en las tablas/vistas que tengan una política RLS que lo permita 
explícitamente. Ninguna otra operación es posible desde el navegador, 
independientemente de cómo esté escrito el código frontend.

La configuración del proyecto en Supabase tiene desactivado "Automatically 
expose new tables" — cualquier tabla nueva creada en el futuro NO será 
accesible por la API pública hasta que se le configure explícitamente 
una política RLS.

---

## 3. Gestión de credenciales

### Inventario de credenciales

| Credencial | Qué permite | Dónde vive | Quién la ve |
|------------|-------------|------------|-------------|
| `VITE_SUPABASE_URL` | Identificar el proyecto Supabase | Variable de entorno en Vercel + `.env.local` en Codespace | Frontend (navegador) — es pública por diseño |
| `VITE_SUPABASE_ANON_KEY` | Leer datos vía API con RLS activo | Variable de entorno en Vercel + `.env.local` en Codespace | Frontend (navegador) — es pública por diseño |
| `SUPABASE_SERVICE_ROLE_KEY` | Operaciones de superusuario (ignora RLS) | Solo en `.env.local` del Codespace, nunca en Vercel ni en el repo | Solo el desarrollador durante carga de datos |
| Database password | Acceso directo a PostgreSQL | Guardada por el desarrollador fuera del repo | Solo el desarrollador |
| GitHub account password + 2FA | Control total del repositorio | Gestor de contraseñas del desarrollador | Solo el desarrollador |

### Lo que NUNCA debe estar en el repositorio
- `SUPABASE_SERVICE_ROLE_KEY`  
- Database password  
- Cualquier credencial real de la empresa

El archivo `.env.local` está incluido en `.gitignore` y nunca se commitea. 
Si accidentalmente se commitea una credencial, el procedimiento es:
1. Rotar (regenerar) la credencial comprometida inmediatamente en Supabase.
2. Limpiar el historial de Git con `git filter-branch` o BFG Repo Cleaner.
3. Asumir que la credencial fue vista — un repositorio público indexado 
   por GitHub puede ser escaneado por bots en segundos.

### Política de rotación
- `anon key`: rotación semestral o inmediata si se sospecha filtración.
- `service_role key`: rotación semestral o inmediata si se sospecha filtración.
- Database password: rotación semestral o si cambia el personal con acceso.

Para rotar: Supabase → Project Settings → API → "Reveal" → "Regenerate". 
Después de rotar la `anon key`, actualizar la variable de entorno en Vercel 
y en `.env.local` del Codespace.

### Variables de entorno en el frontend (aclaración importante)
Las variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` tienen el 
prefijo `VITE_` porque Vite las embebe en el JavaScript que se envía al 
navegador. Esto significa que **cualquier usuario que abra las DevTools 
del navegador puede verlas**. No son secretas — están diseñadas para ser 
públicas. La seguridad real está en las políticas RLS, no en esconder 
estas claves.