# Test matrix — Entrega 03

> Fase 1: se declara el resultado **esperado**. Fase 5: se ejecuta cada caso con `curl`
> contra el proyecto corriendo y se registra el resultado **observado** (línea de estado
> literal y cuerpo). La columna observado se llena ejecutando, no copiando la esperada.

| Caso                   | Petición                      | Estado previo | Resultado esperado | Resultado observado |
| ---------------------- | ----------------------------- | ------------- | ------------------ | ------------------- |
| Crear correctamente    | `POST /requests`              | —             | `201`              |                     |
| Crear sin título       | `POST /requests`              | —             | `400`              |                     |
| Consultar inexistente  | `GET /requests/999`           | —             | `404`              |                     |
| Filtrar sin resultados | `GET /requests?status=closed` | —             | `200 []`           |                     |
| Cambiar prioridad      | `PATCH /requests/1`           | `open`        | `200`              |                     |
| Transición válida      | `PATCH /requests/1`           | `open`        | `200`              |                     |
| Transición inválida    | `PATCH /requests/1`           | `open`        | `409`              |                     |
| Modificar cerrada      | `PATCH /requests/1`           | `closed`      | `409`              |                     |

> Agrega tus propios casos debajo (mínimo dos): por ejemplo, filtro con valor desconocido,
> body sin campos modificables, o el campo `status` enviado al crear.

| Caso | Petición | Estado previo | Resultado esperado | Resultado observado |
| ---- | -------- | ------------- | ------------------ | ------------------- |
|      |          |               |                    |                     |
|      |          |               |                    |                     |

## Evidencia

_(Pega aquí las salidas de `curl -i` de al menos los casos de transición inválida y de
solicitud terminal: son la prueba de que las reglas están protegidas.)_

```txt

```
