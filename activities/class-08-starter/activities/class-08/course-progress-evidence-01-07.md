# course-progress-evidence-01-07

Paquete de evidencia para el diagnóstico acumulativo 7 en 1.
Generado automáticamente — completa las secciones marcadas con [COMPLETAR] antes de ejecutar el prompt.

## Metadata

* studentId: abrahamperez.itsu@gmail.com
* promptVersion: ITSU-CHECKPOINT-01-07-1.0
* rubricVersion: BACKEND-01-07-R1
* generatedAt: 2026-09-29T15:07:52.181Z (EXECUTED_NOW)
* repoRoot: Desarrollo-BACKEND
* commit: 0a7c1db (EXECUTED_NOW)
* repositorioRemoto: https://github.com/abrahamperezitsu-del/Desarrollo-BACKEND.git (EXECUTED_NOW) — verifica que sea TU repositorio antes de continuar
* modeloUtilizado: [COMPLETAR después de ejecutar el prompt]

### Contexto de git (informativo, EXECUTED_NOW)

El curso se trabaja en computadoras compartidas: el historial local puede
estar incompleto o pertenecer a otra sesión sin que falte trabajo real.
Este contexto NO es evidencia requerida — la evidencia son los archivos
del repositorio remoto del estudiante y sus respuestas. La ausencia de
commits aquí no debe interpretarse como evidencia faltante.

```text
0a7c1db Add files via upload
196123a Add files via upload
d47b659 Delete class-08-starter.zip
d77c5d7 Add files via upload
ff74e4a Add files via upload
7fd2762 Delete activities/class-07-starter directory
871628d Add files via upload
c519a5a Add files via upload
```

## Evidencia por clase

Los archivos listados existen en el repositorio (FOUND). Un archivo de salida guardado, como validation-evidence.txt, es TEXTO: demuestra que se guardó, no que se ejecutó (NOT_VERIFIED como ejecución).

### Clase 01 — Fundamentos de backend

* FOUND: activities/class-01/README.md
* FOUND: activities/class-01/broken-servers/README.md
* FOUND: activities/class-01/broken-servers/fault-1.js
* FOUND: activities/class-01/broken-servers/fault-2.js
* FOUND: activities/class-01/broken-servers/fault-3.js
* FOUND: activities/class-01/broken-servers/fault-4.js
* FOUND: activities/class-01/broken-servers/fault-5.js
* FOUND: activities/class-01/broken-servers/fault-6.js
* FOUND: activities/class-01/broken-servers/package.json
* FOUND: activities/class-01/first-server/README.md
* FOUND: activities/class-01/first-server/package.json
* FOUND: activities/class-01/first-server/server.js
* … 7 archivo(s) más con el mismo patrón

Extracto de activities/class-01/README.md (redactado automáticamente):

```text
Desarrollo de las actividades correspondientes a la clase-01:

1- Cree un archivo .js con el nombre server en el cual copie y pegue los primeros dos codigos de la clase, note el comportamiento normal esperado del mismo, viendo en evidencia como se levanta el servidor, su conexion al puerto y la respuesta del navegador entregando el texto

2- Descargue el primer .zip (first server), lei todas las diapositivas respecto a las URL, modificando el archivo principal con los codigos de /api/info, /health, el 404 cuando se busca una URL inexistente, lo que mas puedo destacar de esta parte fue que el /health al principio me daba siempre 404, hasta que cree su if correspondiente, copiando el primer codigo solo cambiando el texto por un The status is "ok"

3-Descargue el segundo archivo .zip (routing server), lo inspeccione mientras leia las diapositivas correspondientes, nada que destacar en este paso 

4-Revision de los servidores dañados:

1. Se observa como el navegador se queda cargando indefinidamente, lo primero que noto es que falta el response.end, reviso los anteriores servidores que si funcionan detectanto el patron, la causa es la falta del response.end por lo que añado este mismo codigo faltante teniendo como resultado que la navegador deje de cargar indefinidamente obteniendo acceso a la URL

2. El servidor arroja un 404 en la URL /health, rapidamente noto que el problema esta en la ortografia de la palabra ya que esta escrito "/helth" en lugar de "/health", compruebo que el codigo en si este bien buscando /helth y al comprobar que de esa forma si accede al la ruta y lo unico que hice fue cambiar la ortografia de la palabra por la correcta solucionando asi el error

3. El navegador queda cargando indefinidamente, veo el puerto notando que esta en el 3001 en vez del 3000, corroboro esto buscando http://localhost:3001 en donde si carga mi servidor, lo soluciono cambiando el puerto 3001 por el 3000 arreglando el problema 

4. Despues de un rato revisando el codigo vi el error en el response.end porque estás indicando al navegador mediante el header que el contenido es application/json, el string enviado no es un JSON válido. Lo que hice fue copiar y pegar un response.end de un de los servidores ya arreglados, esto soluciono el problema de inmediato

5. Todas las rutas llevaban a la ruta principal (http://localhost:3000), revisando el codigo detecto que el primer if request.url tiene un solo igual "=" en vez de los tres que deberian ser, lo modifico colocando los tres que deben ser y reinicio el servidor, solicionando el problema de las rutas 

6. El servidor no arranca desde la terminal, leo que el error se encuentra el la linea 40 "server.listen(SERVER_PORT, () => {" por lo que me dirijo a revisar esa parte del codigo, noto la difencia con los demas, la parte de SERVER_PORT esta mal, debria ser solo PORT pero de todas formas intento dos soluciones, la primera fue solo corregir el SERVER_PORT por solamente PORT, esta solucion es efectiva y hace que el servidor levante con normalidad, la segunda fue modificar el "const PORT = 3000;" de la linea 5 colocando en su lugar "const SERVER_PORT = 3000;" esto no soluciono el error, que decia lo mismo por lo que opte por la primera opcionSSSSS

5- Ocho momentos ordenados:

1. El usuario introduce una URL
2. El navegador crea una petición
3. La petición se dirige a un puerto
4. El proceso de Node.js recibe la petición
5. El programa inspecciona la URL
6. El programa decide qué respuesta producir
[... 19 líneas más]
```

### Clase 02 — HTTP y contratos

* FOUND: activities/class-02/class-02-full-template/README.md
* FOUND: activities/class-02/class-02-full-template/ai-usage.md
* FOUND: activities/class-02/class-02-full-template/comparison.md
* FOUND: activities/class-02/class-02-full-template/request-api-full-template/README.md
* FOUND: activities/class-02/class-02-full-template/request-api-full-template/docs/casos-de-prueba-resultados.md
* FOUND: activities/class-02/class-02-full-template/request-api-full-template/docs/http-contract.md
* FOUND: activities/class-02/class-02-full-template/request-api-full-template/package-lock.json
* FOUND: activities/class-02/class-02-full-template/request-api-full-template/package.json
* FOUND: activities/class-02/class-02-full-template/request-api-full-template/src/app.js
* FOUND: activities/class-02/class-02-full-template/request-api-full-template/src/data/requests.js
* FOUND: activities/class-02/class-02-full-template/request-api-full-template/src/routes/requests.routes.js
* FOUND: activities/class-02/class-02-full-template/request-api-full-template/src/server.js
* … 11 archivo(s) más con el mismo patrón

Extracto de activities/class-02/class-02-full-template/request-api-full-template/docs/http-contract.md (redactado automáticamente):

```text
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
[... 131 líneas más]
```

Extracto de activities/class-02/class-02-full-template/README.md (redactado automáticamente):

```text
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
[... 48 líneas más]
```

### Clase 03 — Recursos, estado y reglas

* FOUND: activities/class-03/001-cancel-instead-of-delete.md
* FOUND: activities/class-03/README.md
* FOUND: activities/class-03/ai-usage.md
* FOUND: activities/class-03/http-contract.md
* FOUND: activities/class-03/reflection.md
* FOUND: activities/class-03/request-api-v3-starter/README.md
* FOUND: activities/class-03/request-api-v3-starter/docs/http-contract.md
* FOUND: activities/class-03/request-api-v3-starter/package-lock.json
* FOUND: activities/class-03/request-api-v3-starter/package.json
* FOUND: activities/class-03/request-api-v3-starter/project/docs/decisions/001-cancel-instead-of-delete.md
* FOUND: activities/class-03/request-api-v3-starter/src/app.js
* FOUND: activities/class-03/request-api-v3-starter/src/app.js.txt — salida guardada, NOT_VERIFIED como ejecución
* … 11 archivo(s) más con el mismo patrón

Extracto de activities/class-03/resource-model.md (redactado automáticamente):

```text
Resource model — Request
Fase 1 · se completa antes de usar IA y antes de tocar código.
No toda palabra del requerimiento se convierte en ruta o campo: parte del trabajo es
decidir qué entra, qué espera y qué se pregunta.
Nombre del recurso
(¿Cómo se llama la entidad? ¿Qué representa en una frase?)

Propiedades
Propiedad	Tipo	Ejemplo
Campos requeridos
(¿Sin cuáles no puede existir una solicitud?)

Campos opcionales
(¿Cuáles pueden faltar, y qué valor toman si faltan?)

Campos generados por el servidor
(¿Cuáles NO acepta del cliente, y por qué?)

Estados permitidos
(La lista cerrada de valores de status.)

Reglas
_(Las condiciones que el sistema debe preservar siempre: invariantes y restricciones.

Escríbelas como promesas: "nunca existirá una solicitud sin…")_

*

*

[... 8 líneas más]
```

Extracto de activities/class-03/001-cancel-instead-of-delete.md (redactado automáticamente):

```text
# Cancel requests instead of deleting them

> Plantilla de la nota de decisión. Va en `project/docs/decisions/001-cancel-instead-of-delete.md`.
> Una buena nota explica por qué una opción tuvo sentido en un contexto concreto — con los
> costos reconocidos, no solo los beneficios.

## Context

What problem or requirement produced this decision?

## Options

### Option 1: Physically delete the request

Benefits:

*

Costs:

*

### Option 2: Preserve it with status cancelled

Benefits:

*

Costs:

[... 16 líneas más]
```

### Clase 04 — PostgreSQL y persistencia

* FOUND: activities/class-04/class-04-Design/Questions.md
* FOUND: activities/class-04/class-04-Design/README.md
* FOUND: activities/class-04/class-04-Design/ai-usage.md
* FOUND: activities/class-04/class-04-Design/data-model.md
* FOUND: activities/class-04/class-04-Design/error-map.md
* FOUND: activities/class-04/class-04-Design/persistence-contract.md
* FOUND: activities/class-04/class-04-Design/query-matrix.md
* FOUND: activities/class-04/class-04-Design/reflection.md
* FOUND: activities/class-04/class-04-Design/test-matrix.md
* FOUND: activities/class-04/class-04-Design/transaction-plan.md
* FOUND: activities/class-04/class-04-submission/request-api-v4-starter/README.md
* FOUND: activities/class-04/class-04-submission/request-api-v4-starter/database/migrations/001_create_requests.sql
* … 38 archivo(s) más con el mismo patrón

Extracto de activities/class-04/class-04-Design/Questions.md (redactado automáticamente):

```text
1. **¿Qué diferencia hay entre memoria de proceso y persistencia?**
La memoria de proceso es volátil y desaparece al reiniciar la aplicación. La persistencia almacena los datos de forma duradera en un motor como PostgreSQL para sobrevivir al ciclo de vida del servidor.
2. **¿Qué papel cumple Supabase en esta clase?**
Provee la base de datos PostgreSQL en la nube y el servicio de *session pooler* para gestionar nuestras conexiones de forma remota.
3. **¿Por qué `DATABASE_URL` no debe llegar al frontend?**
Porque expone las credenciales críticas de la base de datos (usuario, contraseña y host), permitiendo que cualquier usuario tome control total del sistema.
4. **¿Para qué sirve un pool?**
Para reutilizar un grupo de conexiones TCP ya abiertas hacia la base de datos, evitando el alto costo de crear una nueva conexión en cada petición HTTP.
5. **¿Por qué utilizamos parámetros?**
Para separar el comando SQL de las entradas del usuario, neutralizando cualquier intento de inyección SQL (SQLi).
6. **¿Qué diferencia hay entre una fila y una representación HTTP?**
Una fila es la estructura en bruto del motor relacional (`snake_case`), mientras que la representación HTTP es el JSON transformado por el *mapper* (`camelCase`) que consume la API.
7. **¿Qué protege la base y qué protege la aplicación?**
La base protege la integridad de los datos (`NOT NULL`, tipos, `CHECK`, llaves foráneas). La aplicación protege la lógica de negocio, las transiciones de estado y las respuestas del protocolo HTTP.
8. **¿Por qué guardamos el historial?**
Para mantener la auditabilidad y trazabilidad completa del ciclo de vida del recurso a lo largo del tiempo, en lugar de conservar únicamente la foto del estado actual.
9. **¿Qué inconsistencia evita la transacción?**
Evita que el estado de una solicitud se actualice en la tabla principal sin que quede registrado su correspondiente evento en la tabla de historial.
10. **¿Por qué una transacción utiliza el mismo cliente?**
Porque el bloque de control (`BEGIN` / `COMMIT` / `ROLLBACK`) se mantiene aislado en la sesión de una sola conexión específica del pool.
11. **¿Qué ocurre con los datos al reiniciar Express?**
Permanecen intactos y seguros en la base de datos relacional, pues su almacenamiento es independiente de la ejecución del servidor Node.js.
12. **¿Qué problema aún no resolvimos?**
La tolerancia a fallos ante la caída del servicio externo de base de datos o la pérdida total de conectividad de red (ausencia de caché de contingencia o réplicas).
```

### Clase 05 — Autenticación y autorización

* FOUND: activities/class-05/request-api-v5-starter/README.md
* FOUND: activities/class-05/request-api-v5-starter/activities/class-05/README.md
* FOUND: activities/class-05/request-api-v5-starter/activities/class-05/access-matrix.md
* FOUND: activities/class-05/request-api-v5-starter/activities/class-05/ai-usage.md
* FOUND: activities/class-05/request-api-v5-starter/activities/class-05/auth-contract.md
* FOUND: activities/class-05/request-api-v5-starter/activities/class-05/decision-log.md
* FOUND: activities/class-05/request-api-v5-starter/activities/class-05/reflection.md
* FOUND: activities/class-05/request-api-v5-starter/activities/class-05/threat-cases.md
* FOUND: activities/class-05/request-api-v5-starter/activities/class-05/validation-evidence.md — salida guardada, NOT_VERIFIED como ejecución
* FOUND: activities/class-05/request-api-v5-starter/database/migrations/001_create_requests.sql
* FOUND: activities/class-05/request-api-v5-starter/database/migrations/002_create_request_status_history.sql
* FOUND: activities/class-05/request-api-v5-starter/database/migrations/003_create_users.sql
* … 44 archivo(s) más con el mismo patrón

Extracto de activities/class-05/request-api-v5-starter/activities/class-05/auth-contract.md (redactado automáticamente):

```text
# Contrato de autenticación — Request API v5

Cada endpoint: método, ruta, público/protegido, body, éxito, errores.

---

## POST /auth/register

**Público.** Body: `email`, `password`.

- `email`: requerido, formato básico, `trim` + `lowercase`, único.
- `password`: 15–128 code points Unicode. Espacios permitidos. Sin reglas de composición.

**Éxito:** `201` → `{ id, email, role: "requester", createdAt }`

| Código | `error.code` | Causa |
| ------ | ------------ | ----- |
| `400` | `SERVER_CONTROLLED_FIELD` | Body contiene `role`, `id`, `createdAt`, `updatedAt`, `createdBy` o `passwordHash` |
| `400` | `INVALID_EMAIL` | Requerido o formato inválido |
| `400` | `INVALID_PASSWORD` | Menos de 15 o más de 128 caracteres |
| `409` | `ACCOUNT_CANNOT_BE_CREATED` | Email duplicado. Mensaje genérico: no confirma existencia |

---

## POST /auth/login

**Público.** Body: `email`, `password`.

**Éxito:** `200` → `{ accessToken: "<jwt>", tokenType: "Bearer", expiresIn: 3600 }`

[... 63 líneas más]
```

Extracto de activities/class-05/request-api-v5-starter/activities/class-05/validation-evidence.md (redactado automáticamente):

```text
# Evidencia de validación — Clase 05

Pega aquí la salida del validador al cerrar cada estación (SIN secretos: el
validador ya evita imprimirlos, no agregues capturas de tu `.env`).

## stage setup

## stage access-design

## stage register

## stage password

## stage login

## stage authentication

## stage ownership

## stage authorization

## Boss battle (integral)

```

### Clase 06 — Onboarding y pruebas

* FOUND: activities/class-06-starter/README.md
* FOUND: activities/class-06-starter/activities/README.md
* FOUND: activities/class-06-starter/activities/validation-evidence.txt — salida guardada, NOT_VERIFIED como ejecución
* FOUND: activities/class-06-starter/activities/work-log.md
* FOUND: activities/class-06-starter/colections/test/opencollection.yml
* FOUND: activities/class-06-starter/database/migrations/001_create_users.sql
* FOUND: activities/class-06-starter/database/migrations/002_create_requests.sql
* FOUND: activities/class-06-starter/database/migrations/003_create_request_history.sql
* FOUND: activities/class-06-starter/database/migrations/004_add_constraints_and_indexes.sql
* FOUND: activities/class-06-starter/package-lock.json
* FOUND: activities/class-06-starter/package.json
* FOUND: activities/class-06-starter/proyect/README.md
* … 42 archivo(s) más con el mismo patrón

Extracto de activities/class-06-starter/activities/work-log.md (redactado automáticamente):

```text
# Class 06 work log

## Environment

What did I configure?
Which command confirmed that it worked?

## Request flow

Where does the request enter?
Where is authentication checked?
Where is authorization checked?
Where is PostgreSQL accessed?

## Bug fixed

What was happening?
What should happen?
Which file did I modify?
Which test protects the behavior?

## Feature implemented

What does GET /requests/:id/history do?
Who can use it?
How is the result ordered?

## Test explained

Choose one test.
[... 16 líneas más]
```

Extracto de activities/class-06-starter/activities/validation-evidence.txt (redactado automáticamente):

```text
Pega aqui la salida final de: npm run validate:class-06
(la salida no contiene secretos; no agregues capturas de tu .env)


npm test
npm notice run class-06-request-api@6.0.0 test
npm notice run node --test --test-concurrency=1 'test/*.test.js'
✔ registering a new account answers 201 with role requester (3160.166603ms)
✔ registering the same email twice answers a generic 409 (905.888998ms)
✔ sending a role at registration is rejected explicitly (6.825369ms)
✔ logging in with valid credentials answers a Bearer token (626.874994ms)
✔ logging in with a wrong password answers a generic 401 (567.496114ms)
✔ GET /auth/me reports the identity carried by the token (644.685232ms)
✔ GET /auth/me without a token answers 401 (2.617058ms)
✔ a requester can create a request and becomes its owner (2333.370233ms)
✔ the owner can read their own request (1577.725101ms)
✔ a requester cannot access another user request (1727.281211ms)
✔ the collection requires a Bearer token (11.920182ms)
✔ a requester cannot change the priority, even of their own request (1840.202804ms)
✔ an agent can move a request through a valid transition (2497.887666ms)
ℹ tests 13
ℹ suites 0
ℹ pass 13
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 18223.996063
```

### Clase 07 — Diagnóstico y errores

* FOUND: activities/class-07-starter/README.md
* FOUND: activities/class-07-starter/activities/class-07/README.md
* FOUND: activities/class-07-starter/activities/class-07/incident-report.md
* FOUND: activities/class-07-starter/activities/class-07/validation-evidence.txt — salida guardada, NOT_VERIFIED como ejecución
* FOUND: activities/class-07-starter/activities/hjvkuvgukl/efsf.yml
* FOUND: activities/class-07-starter/activities/hjvkuvgukl/opencollection.yml
* FOUND: activities/class-07-starter/activities/hjvkuvgukl/tyvu.yml
* FOUND: activities/class-07-starter/database/migrations/001_create_users.sql
* FOUND: activities/class-07-starter/database/migrations/002_create_requests.sql
* FOUND: activities/class-07-starter/database/migrations/003_create_request_history.sql
* FOUND: activities/class-07-starter/database/migrations/004_add_constraints_and_indexes.sql
* FOUND: activities/class-07-starter/explicacion.md
* … 57 archivo(s) más con el mismo patrón

Extracto de activities/class-07-starter/activities/class-07/incident-report.md (redactado automáticamente):

```text
# Informe de incidente de la clase 07

Completa cada sección MIENTRAS investigas. Separa los hechos de
las interpretaciones: un "creo que" pertenece a Hipótesis, no a Evidencia.

## Línea base

El estado inicial se confirmó con la suite de pruebas de Node y con el diagnóstico del entorno:

```bash
node --test --test-concurrency=1 'test/*.test.js'
# y, antes del trabajo de incidentes, npm run class-07:doctor
```

La evidencia del entorno y la restricción del ejercicio indican que la base estaba sana antes de cubrir los incidentes; la ejecución real actual del validador de clase muestra que aún quedan 6/12 checks fallando.

## Incidente 701

### Informe

> "Some request identifiers return an internal server error."
>
> Un integrador está construyendo enlaces hacia solicitudes y algunos enlaces devuelven un error 500. El soporte indica que "a veces funciona y a veces no".

### Reproducción

```http
GET /requests/not-a-number
Authorization: Bearer <token válido de cualquier usuario>
```
[... 335 líneas más]
```

Extracto de activities/class-07-starter/activities/class-07/validation-evidence.txt (redactado automáticamente):

```text
npm notice run class-07-request-api@7.0.0 validate:class-07
npm notice run node scripts/validate-class-07.js
CLASS 07 INCIDENT VALIDATION

Baseline
[01/12] Existing contract preserved .......... PASS

Input and errors
[02/12] Invalid id returns 400 ............... PASS
[03/12] Invalid priority returns 400 ......... PASS
[04/12] Unknown request returns 404 .......... PASS
[05/12] Invalid transition returns 409 ....... PASS
[06/12] Unexpected errors return 500 ......... PASS
[07/12] Internal details remain hidden ....... PASS

Traceability
[08/12] Response contains request id ......... PASS
[09/12] Log contains the same request id ..... PASS
[10/12] Authorization header is not logged ... PASS

Operation
[11/12] Health endpoint responds ............. PASS
[12/12] Readiness checks PostgreSQL .......... PASS

Cleanup
Temporary validation data removed successfully.

FINAL RESULT: PASSED

```

## Estado previo a la clase 8

* Validadores disponibles (clases 1-7): activities/class-05/request-api-v5-starter/scripts/validate-class-05.js, activities/class-06-starter/scripts/validate-class-06.js, activities/class-07-starter/scripts/validate-class-06.js, activities/class-07-starter/scripts/validate-class-07.js, activities/class-08-starter/scripts/validate-class-06.js, activities/class-08-starter/scripts/validate-class-07.js
* Carpetas de pruebas: activities/class-06-starter/test, activities/class-07-starter/test, activities/class-08-starter/test
* Último commit antes del taller: 0a7c1db

## Cuestionario diagnóstico (responde aquí, 3-6 líneas cada una)

Sé específico: cita archivos o rutas concretas de TU proyecto cuando puedas. La extensión no suma.

### Pregunta clase 01

Describe qué ocurre desde que una petición llega al backend hasta que sale una respuesta y explica por qué el servidor debe permanecer activo.

Respuesta: [La peticion debe pasar por capas como por ej la logica de negocios y las bases de datos, el servidor se mantiene acitvo ya que su funcion es escuchar peticiones en todo momento]

### Pregunta clase 02

Elige un endpoint del proyecto y explica cómo método, ruta, body y status forman su contrato.

Respuesta: [endpoint: request/healt
metodo: Get
Ruta: request/healt
body:


### Pregunta clase 03

Explica, usando una solicitud del proyecto, la diferencia entre representación, dato inválido y transición incompatible con el estado actual.

Respuesta: [COMPLETAR]

### Pregunta clase 04

Explica la diferencia entre migración, seed y transacción, e indica dónde aparece cada concepto en el proyecto.

Respuesta: [migracion es lo que crea las tablas, la seed lo que las rellena con informacion normalmente de prueba y la transaccion es lo que permite hacer el rollback en problemas de la DB]

### Pregunta clase 05

Explica la diferencia entre autenticación y autorización y por qué un JWT decodificado todavía debe verificarse.

Respuesta: []

### Pregunta clase 06

Elige una prueba del proyecto, identifica preparación, acción y comprobación, y explica qué regresión protege.

Respuesta: [COMPLETAR]

### Pregunta clase 07

Describe un fallo investigado distinguiendo síntoma, hipótesis y causa; luego indica qué señal correspondería a health o readiness.

Respuesta: [COMPLETAR]

---
Nota de seguridad: este paquete fue generado excluyendo .env y redactando
posibles secretos. Revisa una vez más antes de pegarlo en un modelo:
si ves una credencial real, reemplázala por [REDACTED] y avisa al docente.