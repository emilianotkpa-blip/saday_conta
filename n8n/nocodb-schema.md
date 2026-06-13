# NocoDB — Persistencia opcional

Por defecto la app guarda en `localStorage` (cero config). Para mover los datos a
NocoDB vía n8n, usa este esquema.

## Tablas

### `proyectos`
| Campo   | Tipo        | Notas                         |
|---------|-------------|-------------------------------|
| id      | SingleLineText (PK) | id corto generado por la app |
| name    | SingleLineText | Nombre del proyecto         |
| meta    | SingleLineText | Descripción corta           |
| color   | SingleLineText | Hex del "planeta" (#C9A84C)  |

### `movimientos`
| Campo    | Tipo        | Notas                          |
|----------|-------------|--------------------------------|
| id       | SingleLineText (PK) | id corto generado por la app |
| pid      | SingleLineText | id del proyecto (FK lógica)  |
| kind     | SingleLineText | `in` (ingreso) / `out` (egreso) |
| concept  | SingleLineText | Concepto del movimiento       |
| amount   | Number      | Monto en MXN                   |
| date     | Date        | YYYY-MM-DD                     |

## Webhook de datos (n8n)

Crea un segundo workflow con un Webhook en `/contabilidad-datos` que:

- **GET** → consulta ambas tablas en NocoDB (API v2) y responde
  `{ "projects": [...], "tx": [...] }`.
- **POST** → recibe `{ projects, tx }` y hace upsert en NocoDB
  (borra lo que ya no exista o marca con un flag, según prefieras).

Luego en el `.env` de la app:

```
VITE_DATA_MODE=nocodb
VITE_N8N_DATA_URL=https://n8n.tudominio.com/webhook/contabilidad-datos
```

La app ya tiene el seam listo en `src/lib/storage.js` (driver `nocodb`), solo
necesita que el webhook devuelva el JSON con esa forma.
