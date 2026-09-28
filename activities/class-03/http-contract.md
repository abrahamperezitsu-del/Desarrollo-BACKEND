# HTTP contract — Request API v3

> Fase 1 · se completa **antes de usar IA y antes de tocar código**.
> Para cada endpoint: intención, path, query, body, respuesta exitosa, errores y un ejemplo.
> El ejemplo obliga a decidir los detalles que la tabla esconde.

## Formato de error (común a toda la API)

```json

```

_(¿Qué forma tiene todo cuerpo de error? ¿Qué códigos de error existen?)_

---

## `GET /requests`

* **Intención**:
* **Path**:
* **Query**: _(filtros y sus valores válidos)_
* **Body**: _(ninguno)_
* **Respuesta exitosa**: _(estado + forma del cuerpo; ¿qué pasa sin coincidencias?)_
* **Errores**: _(¿filtro con valor desconocido?)_

**Ejemplo**

```http

```

---

## `GET /requests/:id`

* **Intención**:
* **Path**:
* **Respuesta exitosa**:
* **Errores**:

**Ejemplo**

```http

```

---

## `POST /requests`

* **Intención**:
* **Body**: _(campos aceptados; ¿qué pasa con los que el servidor controla?)_
* **Respuesta exitosa**:
* **Errores**:

**Ejemplo**

```http

```

---

## `PATCH /requests/:id`

* **Intención**:
* **Body**: _(campos modificables; campos ignorados)_
* **Respuesta exitosa**:
* **Errores**: _(la tabla completa: sin campos, valor desconocido, inexistente, transición inválida, terminal)_

| Situación | Estado | Código de error |
| --------- | -----: | --------------- |
|           |        |                 |

**Ejemplo (éxito y ejemplo de 409)**

```http

```
