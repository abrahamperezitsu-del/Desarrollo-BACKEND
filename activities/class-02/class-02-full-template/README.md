# Request API Full

Una API RESTful construida con Node.js y Express para la gestión de solicitudes de mantenimiento. Este proyecto implementa un diseño de arquitectura modular que separa el servidor, la configuración de la aplicación, el enrutamiento y el almacenamiento de datos en memoria.

## Características
- **Operaciones RESTful:** Endpoints estandarizados para leer colecciones, obtener detalles y crear recursos.
- **Contrato HTTP estricto:** Respuestas consistentes con los códigos de estado HTTP adecuados (`200`, `201`, `400`, `404`).
- **Almacenamiento en memoria:** Los datos se mantienen vivos mientras el proceso de Node.js está en ejecución (ideal para entornos de desarrollo y pruebas).
- **Módulos ES:** Utiliza la sintaxis moderna de JavaScript (`import`/`export`).

## Requisitos previos
- Node.js (v14 o superior)

## Instalación y ejecución
1. Instala las dependencias del proyecto:
   ```bash
   npm install

   Aquí tienes el `README.md` para tu proyecto, seguido de las respuestas a las cinco preguntas de evaluación.

### `README.md`

```markdown
# Request API Full

Una API RESTful construida con Node.js y Express para la gestión de solicitudes de mantenimiento. Este proyecto implementa un diseño de arquitectura modular que separa el servidor, la configuración de la aplicación, el enrutamiento y el almacenamiento de datos en memoria.

## Características
- **Operaciones RESTful:** Endpoints estandarizados para leer colecciones, obtener detalles y crear recursos.
- **Contrato HTTP estricto:** Respuestas consistentes con los códigos de estado HTTP adecuados (`200`, `201`, `400`, `404`).
- **Almacenamiento en memoria:** Los datos se mantienen vivos mientras el proceso de Node.js está en ejecución (ideal para entornos de desarrollo y pruebas).
- **Módulos ES:** Utiliza la sintaxis moderna de JavaScript (`import`/`export`).

## Requisitos previos
- Node.js (v14 o superior)

## Instalación y ejecución
1. Instala las dependencias del proyecto:
   ```bash
   npm install

```

2. Inicia el servidor:
```bash
npm start

```


3. La API estará disponible en `http://localhost:3000`.

## Documentación de la API

El contrato completo y detallado de la API se encuentra en `docs/http-contract.md`.

### Resumen de Endpoints

* `GET /requests` - Obtiene todas las solicitudes. Soporta filtro por estado (`?status=open`).
* `GET /requests/:id` - Obtiene una solicitud específica por su ID.
* `POST /requests` - Crea una nueva solicitud. Requiere `title` en el cuerpo JSON.

### Respuestas a las 5 preguntas
1. ¿Qué información comunica el método HTTP?**
Comunica la **intención** o la acción que el cliente desea realizar sobre el recurso. Por ejemplo, `GET` indica "quiero leer", `POST` indica "quiero crear" y `DELETE` indica "quiero eliminar".

**2. ¿Qué diferencia existe entre path parameter y query parameter?**
El **path parameter** (`/requests/15`) forma parte de la jerarquía de la ruta y sirve para **identificar** un recurso específico único. El **query parameter** (`/requests?status=open`) va al final de la URL después de un `?` y sirve para **modificar** la consulta, típicamente para filtrar, ordenar o paginar una colección.

**3. ¿Por qué 200 con un body de error representa un contrato contradictorio?**
Porque a nivel de protocolo de red (HTTP), el código `200` significa "Éxito total". Si el cuerpo incluye un error, el cliente y el servidor se están contradiciendo. Las herramientas (como Axios, fetch o navegadores) leen el código de estado para saber automáticamente si la operación triunfó o falló sin tener que inspeccionar el JSON.

**4. ¿Qué problema resuelve Express que ya habíamos experimentado manualmente?**
Resuelve todo el "trabajo mecánico" o fontanería de Node.js puro. Elimina el infierno de los condicionales (`if/else`) para emparejar rutas y métodos, extrae automáticamente los parámetros de la URL y ensambla/deserializa el cuerpo (`body`) en un objeto JSON listo para usar.

**5. ¿Por qué HTTP es suficiente para nuestro proyecto y cuándo dejaría de serlo?**
Es suficiente porque nuestro sistema sigue un modelo simple de "petición-respuesta" sin estado (*stateless*), donde el cliente pide un dato o envía una orden, el servidor contesta, y la conexión termina. Dejaría de ser suficiente si necesitáramos comunicación bidireccional continua o notificaciones en tiempo real del servidor al cliente (por ejemplo, avisar instantáneamente que una solicitud cambió de estado), para lo cual necesitaríamos tecnologías como WebSockets.
