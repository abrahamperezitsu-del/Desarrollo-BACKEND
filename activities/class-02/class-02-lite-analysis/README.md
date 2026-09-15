# Auditoría de Contrato de API

| Endpoint | Intención | Entrada | Respuesta actual | Problema detectado | Propuesta de contrato |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`GET /getRequests`** | Obtener la lista completa de solicitudes. | Ninguna | `200 OK`<br>*(Devuelve array JSON)* | **Uso de verbos en la ruta:** En REST los endpoints deben usar sustantivos; la acción la define el método HTTP. | **Método:** `GET`<br>**Ruta:** `/requests`<br>**Estado:** `200 OK` |
| **`GET /requests/:id`** | Obtener el detalle de una solicitud específica. | Parámetro de ruta (`id`) | - Si existe: `200 OK`<br>- Si no existe: `200 OK` con `{ error: 'Request not found' }` | **Falsedad semántica:** Devuelve un código `200` (éxito) cuando el recurso no existe, en lugar de un código de error HTTP adecuado. | **Método:** `GET`<br>**Ruta:** `/requests/:id`<br>**Estados:** `200 OK` / `404 Not Found` |
| **`POST /requests`** | Crear una nueva solicitud de mantenimiento. | Body JSON (`title`, `description`, `priority`) | `200 OK`<br>*(Devuelve el objeto creado)* | **Estado HTTP genérico:** Utiliza `200` en lugar del código estándar que indica que un recurso fue creado exitosamente. | **Método:** `POST`<br>**Ruta:** `/requests`<br>**Estado:** `201 Created` |


1. ¿Qué endpoints existen?

* `GET /getRequests`
* `GET /requests/:id`
* `POST /requests`

2. ¿Qué método usa cada uno?

* `GET /getRequests` $\rightarrow$ Método **GET**
* `GET /requests/:id` $\rightarrow$ Método **GET**
* `POST /requests` $\rightarrow$ Método **POST**

3. ¿Dónde recibe información cada endpoint?

* **`GET /getRequests`:** No recibe información de entrada.
* **`GET /requests/:id`:** Recibe información mediante un **Path Parameter** (`:id` en la URL).
* **`POST /requests`:** Recibe información en el **Body** (cuerpo de la petición en formato JSON con `title`, `description` y `priority`).

4. ¿Qué estados devuelve?

* `GET /getRequests`: Siempre devuelve **`200 OK`**.
* `GET /requests/:id`: Devuelve **`200 OK`** tanto si encuentra el recurso como si no lo encuentra (incluso cuando responde con `{ error: 'Request not found' }`).
* `POST /requests`: Siempre devuelve **`200 OK`**.

5. ¿El estado coincide con el cuerpo de la respuesta?

No seimpre:

* En `GET /requests/:id`, cuando el recurso no existe, el cuerpo de la respuesta dice claramente que hay un error (`{ error: 'Request not found' }`), pero el código de estado HTTP es **`200 OK`** (éxito). Esto es una contradicción semántica.
* En `POST /requests`, el cuerpo devuelve el recurso recién creado, pero usa un estado **`200 OK`** genérico en lugar de reflejar una creación exitosa.

6. ¿La ruta representa un recurso o una acción?

* **`/getRequests`:** Representa una **acción** (incorpora explícitamente el verbo `get`).
* **`/requests` y `/requests/:id`:** Representan un **recurso** (utilizan un sustantivo en plural).

7. ¿Qué contrato propondrías tú?

* `GET /requests` $\rightarrow$ Estado **`200 OK`**
* `GET /requests/:id` $\rightarrow$ Estados **`200 OK`** (si existe) o **`404 Not Found`** (si no existe)
* `POST /requests` $\rightarrow$ Estado **`201 Created`**

8. ¿Qué partes son de Express y cuáles de HTTP?

* **Partes de Express:** Todo lo que utiliza el objeto `app` (`app.get`, `app.post`, `app.use(express.json())`, `app.listen`) y los métodos facilitadores sobre `req` y `res` (`req.params`, `req.body`, `res.json`).
* **Partes de HTTP:** El concepto de métodos (`GET`, `POST`), las rutas (`/requests`), los códigos de estado (`200`, `404`) y la estructura de comunicación cliente-servidor que subyace.

