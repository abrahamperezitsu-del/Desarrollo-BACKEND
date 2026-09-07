Aquí tienes el archivo `docs/http-contract.md` estructurado y completado exactamente según la plantilla proporcionada.

```markdown
# Contrato HTTP — Request API Full

> **Plantilla para completar.** Escribe este documento **antes** de implementar los
> manejadores. El contrato es la promesa que hace tu API; el código es la manera de cumplirla.
> Si primero escribes el código y después el contrato, estarás documentando lo que salió, no
> lo que decidiste.

## Recurso

Una **solicitud** (`request`) representa un reporte o requerimiento de mantenimiento dentro de una instalación. Es un registro transaccional que captura el problema detectado, detalles opcionales, su nivel de prioridad y el estado en el que se encuentra su resolución.

### Forma del recurso

| Campo         | Tipo   | Obligatorio | Quién lo asigna | Notas |
| ------------- | ------ | ----------- | --------------- | ----- |
| `id`          | Number | Sí          | Servidor        | Autogenerado, numérico y único. |
| `title`       | String | Sí          | Cliente         | Breve resumen del reporte. |
| `description` | String | No          | Cliente         | Detalles adicionales. Si no se envía, se guarda como string vacío `""`. |
| `status`      | String | Sí          | Servidor        | Todo nuevo reporte nace con estado `"open"`. |
| `priority`    | String | Sí          | Cliente         | Usualmente `"low"`, `"medium"` o `"high"`. |

---

## Endpoint 1 — Listar solicitudes

| Elemento              | Valor |
| --------------------- | ----- |
| Método                | `GET` |
| Ruta                  | `/requests` |
| Entrada               | Parámetro de query opcional: `?status=...` (ej. `?status=open`) |
| Respuesta de éxito    | `200 OK` |
| Respuestas de error   | N/A (Devuelve un arreglo vacío `[]` si no hay coincidencias, no un error) |

**Ejemplo de respuesta**

```json
[
  {
    "id": 1,
    "title": "Projector does not turn on",
    "description": "The projector in room 204 shows no image during class.",
    "status": "open",
    "priority": "high"
  },
  {
    "id": 2,
    "title": "Broken chair in the lab",
    "description": "One chair in the computer lab has a loose back rest.",
    "status": "in-progress",
    "priority": "medium"
  }
]

```

---

## Endpoint 2 — Consultar una solicitud

| Elemento | Valor |
| --- | --- |
| Método | `GET` |
| Ruta | `/requests/:id` |
| Entrada | Path parameter `id` (numérico) en la URL |
| Respuesta de éxito | `200 OK` |
| Respuestas de error | `404 Not Found` (si el ID no existe en memoria) |

**Ejemplo de respuesta (éxito)**

```json
{
  "id": 3,
  "title": "Wi-Fi drops in the library",
  "description": "The connection drops every few minutes on the second floor.",
  "status": "open",
  "priority": "low"
}

```

**Ejemplo de respuesta (error)**

```json
{
  "error": "Request not found"
}

```

---

## Endpoint 3 — Crear una solicitud

| Elemento | Valor |
| --- | --- |
| Método | `POST` |
| Ruta | `/requests` |
| Entrada | Body en formato JSON (requiere cabecera `Content-Type: application/json`) |
| Respuesta de éxito | `201 Created` |
| Respuestas de error | `400 Bad Request` (si falta el campo obligatorio `title`) |

**Ejemplo de body de la petición**

```json
{
  "title": "Fuga de agua en el baño del primer piso",
  "description": "El lavamanos izquierdo no cierra bien y gotea constantemente.",
  "priority": "medium"
}

```

**Ejemplo de respuesta (éxito)**

```json
{
  "id": 4,
  "title": "Fuga de agua en el baño del primer piso",
  "description": "El lavamanos izquierdo no cierra bien y gotea constantemente.",
  "status": "open",
  "priority": "medium"
}

```

**Ejemplo de respuesta (error de validación)**

```json
{
  "error": "Title is required"
}

```

---

## Reglas transversales

Responde en una línea cada una:

1. **¿Qué `Content-Type` devuelven todas las respuestas?**
Devuelven siempre `application/json`.
2. **¿Qué estado corresponde a una ruta que no existe en esta API?**
Corresponde al estado `404 Not Found`.
3. **¿Qué forma tiene siempre un cuerpo de error?**
Un objeto JSON con una única propiedad `"error"` que contiene un string descriptivo.
4. **¿Qué campos ignora el servidor si el cliente los envía en el body?**
Ignora los campos de control interno (`id` y `status`), ya que son responsabilidad exclusiva del servidor.

## Decisiones que tomaste y por qué

* **`400 Bad Request` para validaciones incompletas:** Decidí usar este código de estado en el `POST` porque la falta del `title` es un error de sintaxis del cliente al no cumplir con los campos mínimos requeridos por el contrato, no un problema interno del servidor.
* **Manejo del campo `description` omitido:** Si el cliente envía un JSON sin `description`, decidí guardarlo como un string vacío `""` en lugar de `null` o `undefined`. Esto previene errores de "undefined is not an object" en aplicaciones frontend que lo consuman.
* **El servidor impone el estado inicial:** Ignoro intencionalmente cualquier campo `status` que envíe el cliente en el endpoint de creación (`POST`). Esto garantiza que nadie pueda crear una solicitud de mantenimiento que ya nazca como `closed` o `in-progress`.

```

```