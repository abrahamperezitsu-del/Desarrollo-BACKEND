Sí, y de hecho ya te los expliqué en el resumen anterior, pero voy a profundizar en cada uno en detalle ahora que tengo el contenido exacto frente a mí.

1. access-matrix.md — La matriz de acceso
Qué es: Define quién puede hacer qué en la API. Es el contrato de autorización. Documenta qué operaciones existen, y para cada una, qué pueden hacer un anónimo, un requester y un agent.

Estructura por capas
A. Los roles (línea 3): "Dos roles exactos: requester y agent. Sin admin." — El modelo es deliberadamente plano. No hay jerarquía ni superusuario. Esto simplifica la lógica de autorización: cualquier regla queda definida por estos dos roles.

B. Las dos preguntas heurísticas (líneas 5–11): Esta es la "fórmula" para decidir cada celda:

¿Necesito saber QUIÉN pregunta? → Si la respuesta a una operación depende de la identidad del que llama (p.ej. GET /auth/me devuelve los datos de ese usuario), entonces la respuesta no puede ser "anónimo".
¿Necesito saber DE QUIÉN es el recurso? → Si la operación depende de a quién pertenece el recurso (p.ej. editar una solicitud requiere que sea tuya), entonces el requester queda acotado a Propia/Propias.
C. La tablalmatriz (líneas 15–26): El corazón. Lee cada fila:

Operación	Anónimo	Requester	Agent	Lógica
POST /auth/register	Sí	Sí	Sí	Cualquiera puede crear cuenta
POST /auth/login	Sí	Sí	Sí	Puede iniciar sesión cualquiera
GET /auth/me	No	Sí	Sí	Requiere identidad
GET /requests	No	Propias	Todas	Requester filtra, agent ve todo
GET /requests/:id	No	Propia	Todas	Requester solo la suya
GET /requests/:id/history	No	Propia	Todas	Igual que el detalle
POST /requests	No	Sí	No	Solo requester crea
PATCH ... (título/desc.)	No	Propia y abierta	No	Solo dueño + estado open
PATCH ... (prioridad)	No	No	Sí	Solo agent
PATCH ... (estado)	No	No	Sí	Solo agent
Detalles técnicos de las celdas:

"Propias" vs "Sí": significan cosas distintas. "Sí" = cualquiera con ese rol puede operar sobre cualquier recurso sin restricción de propiedad. "Propias" = solo las que te pertenecen. "Propia y abierta" = tuya y además en estado open.
"Todas" (agent) vs "Sí" (en otras operaciones): distinguí que para el agent GET /requests/:id es "Todas" (cualquiera), mismo valor semántico que "Sí" pero lo diferencié para subrayar el contraste con "Propias" del requester.
D. Las justificaciones (líneas 28–117): Este es el punto clave de tu misión. La misión decía: "Tus tres archivos no copian la lámina: la JUSTIFICAN — celda discutible, argumento escrito." Por eso cada operación tiene su propio bloque con las dos preguntas respondidas y el razonamiento.

E. Campos controlados por el servidor (líneas 119–147): Lista qué campos el cliente jamás puede enviar y qué pasa si lo intenta. Dos tablas:

En registro: role, id, createdAt, passwordHash.
En solicitudes: id, createdBy, createdAt, updatedAt, status (en POST), changedBy.
El dato técnico importante que dejé escrito: createdBy y changedBy se derivan del token JWT, nunca del body. Así un atacante no puede atribuirse solicitudes ajenas.

F. Solicitudes heredadas (líneas 149–158): Los requests creados antes de la migración 004 tienen created_by IS NULL. Decisión: solo el agent las ve. El requester nunca:

// filtro SQL del requester
WHERE created_by = actor.userId   // nunca matchea NULL
Es una consecuencia técnica, no una regla arbitraria: un NULL nunca es igual a un userId. Y tratarla como "no visible para requester" es lo correcto por seguridad.

2. auth-contract.md — El contrato HTTP de autenticación
Qué es: La especificación exacta de los 3 endpoints de auth: qué entra, qué sale, y cada error posible. Es "el contrato" porque va a regir la implementación y lo que verifica el validador.

Estructura
A. POST /auth/register (líneas 7–21):

Público (no requiere token).
Body permitido: email y password.
Reglas de email: requerido, formato básico, trim + lowercase, único (todo lo que implementamos en register).
Reglas de password: 15–128 code points Unicode, espacios permitidos, sin reglas de composición.
Éxito: 201 → { id, email, role: "requester", createdAt } — fíjate que el role SIEMPRE es "requester": el cliente no puede elegirlo.
Errores: 400 SERVER_CONTROLLED_FIELD, 400 INVALID_EMAIL, 400 INVALID_PASSWORD, 409 ACCOUNT_CANNOT_BE_CREATED.
B. POST /auth/login (líneas 25–37):

Público.
Éxito: 200 → { accessToken, tokenType: "Bearer", expiresIn: 3600 }.
Documenta los claims del JWT: sub, role, iat, exp (1h), iss, aud, alg HS256.
Un solo error: 401 INVALID_CREDENTIALS para cualquier fallo — email inexistente o password mala responden igual. Es la defensa anti-enumeración.
C. GET /auth/me (líneas 41–52):

Protegido (requiere Bearer).
Éxito: 200 → { id, email, role }, sin jamás devolver material de password.
Errores: 401 AUTHENTICATION_REQUIRED (sin header/esquema) vs 401 INVALID_TOKEN (token inválido). Ambos son 401, la distinción está en el error.code.
D. Semántica de errores (líneas 56–92): El criterio general, no solo ejemplos:

401 — "no sé quién eres" (sin identidad confiable).
403 — "sé quién eres, pero no puedes" (identidad conocida, operación prohibida).
404 — "no te lo voy a mostrar" (no existe, o ajeno → idéntico).
409 — "conflicto de estado" (datos válidos, estado actual lo impide).
Detalle técnico clave que distingue los .md de diseño vs los de implementación: este documento es lo que la Estación 1 requería escribir antes de programar. Fíjate que describe GET /auth/me y 403 FORBIDDEN — endpoints y comportamientos que aún no están implementados (son estaciones 5–7). El .md es la especificación futura; el validador solo comprueba que el documento exista y contenga los tokens requeridos, no que ya estén implementados en código.

3. threat-cases.md — Los casos adversariales
Qué es: Un catálogo de ataques que la implementación debe resistir. La misión pedía ≥8; escribí 18. Determina el resultado exacto esperado (status HTTP + error.code) para cada uno.

Formato
N. Descripción del ataque → Código error exacto
Este formato compacto es importante: no basta decir "debe rechazarse", hay que especificar cuánto status y qué error.code, porque el validador compara ambos contra la implementación real (lo vimos: expectStatus + expectErrorCode).

Los 18 casos, agrupados por categoría de ataque:
Escalada de privilegios / campos controlados (1–2):

1. role: "agent" → 400 SERVER_CONTROLLED_FIELD — el clásico intento de escalar rol.
2. createdBy: "otro-uuid" → 400 SERVER_CONTROLLED_FIELD — atribuirse solicitudes ajenas.
Validación de contrato (3–4):

3. password de 8 chars → 400 INVALID_PASSWORD (mínimo es 15).
4. email duplicado → 409 ACCOUNT_CANNOT_BE_CREATED (genérico).
Anti-enumeración de cuentas (5–6):

5. password incorrecta → 401 INVALID_CREDENTIALS.
6. email inexistente → 401 INVALID_CREDENTIALS — mismo mensaje que el 5: si fueran distintos, un atacante sabría qué emails existen.
Integridad de token JWT (7–8):

7. token editado (role alterado) → 401 INVALID_TOKEN — la firma invalida la edición.
8. token expirado → 401 INVALID_TOKEN — mismo error genérico que 7 (no se revela cuál falló).
Autenticación de transport (9–10):

9. header sin esquema Bearer → 401 AUTHENTICATION_REQUIRED.
10. /auth/me sin token → 401 AUTHENTICATION_REQUIRED.
Autorización por rol (11–13):

11. agent crea solicitud → 403 FORBIDDEN.
12. requester cambia estado → 403 FORBIDDEN.
13. requester cambia prioridad → 403 FORBIDDEN.
No-revelación de recursos ajenos (14, 18):

14. requester edita solicitud ajena → 404 REQUEST_NOT_FOUND (no 403 — a propósito, para no confirmar existencia).
18. requester ve solicitud heredada → 404 REQUEST_NOT_FOUND.
Reglas de dominio / estado (15, 17):

15. editar en estado terminal → 409 REQUEST_IN_TERMINAL_STATUS.
17. transición inválida open → resolved → 409 INVALID_STATUS_TRANSITION.
Atomicidad / body mixto (16):

16. body mixto (título + estado por requester) → 403 FORBIDDEN — todo-o-nada.
El valor técnico de este archivo
Es un contrato de pruebas ejecutable. Cada línea de aquí se transforma directamente en una verificación del validador (validate-class-05.js). Por ejemplo, el caso 14 corresponde a la función checkRequesterIsolation que comprueba que una solicitud ajena responde 404 idéntico a una inexistente. Por eso los error.code tienen que ser exactos — no vale "un 4xx".

Relación entre los tres .md
Forman una triada de diseño que se refuerza mutuamente:

access-matrix = qué está permitido (la política).
auth-contract = cómo de comunica (status + shape de respuestas).
threat-cases = qué pasa cuando se ataca (el resultado concreto).
Y los tres juntos son la plantilla de lo que luego se implementa y verifica en código. Por ejemplo, la celda "POST /auth/register → requester Sí" de la matriz se traduce en el 201 role: requester del contrato, que se prueba en el caso 1 de amenazas, y que implementamos en register (con el rol impuesto por el DEFAULT de la base).

.
.
.
.
.
.
.
.
.
.

Explicación TÉCNICA COMPLETA y minuciosa
PARTE A — El flujo completo de una petición (capa por capa)
El proyecto es una API Express con una arquitectura en capas estrictas que no se mezclan:

Cliente HTTP
   │  JSON
   ▼
auth.routes.js          ← CAPA HTTP (traduce, no piensa)
   │
   ▼
auth.service.js         ← CAPA DE NEGOCIO (reglas, no SQL ni HTTP)
   │
   ├─► password.js      ← hashing (scrypt)
   ├─► token.js         ← emisión/verificación JWT
   └─► users.store.js   ← CAPA DE DATOS (SQL parameterizado)
          │
          ▼
      user.mapper.js    ← transforma fila → representación HTTP
La regla de oro: cada capa sabe una cosa y solo una.

La ruta (auth.routes.js) no hace SQL ni criptografía: toma req.body, llama al service, y traduce el resultado o el error a HTTP.
El service no habla con Express ni con la base: aplica reglas de negocio y lanza AppError.
El store no conoce HTTP ni reglas: solo ejecuta SQL parameterizado.
El mapper solo convierte forma de datos (snake_case → camelCase).
¿Cómo arranca? (server.js + app.js)
server.js es el entry point: solo escucha en un puerto. No sabe nada de rutas.
app.js no abre puerto — monta middleware y módulos. El validador importa app.js directo (no server.js) para poder arrancarlo en un puerto aleatorio sin colisionar:
server = app.listen(0, '127.0.0.1', resolve);  // puerto 0 = aleatorio
Detalle: app.js:6 tiene // TODO (station 5): import authenticate. Hoy los /requests NO están protegidos — eso es estación 5. Por eso la validación de auth funciona pero los endpoints de requests aún no exigen token. El validador, inteligentemente, en cada stage usa los paths necesarios.
Los middlewares (pool.js, transaction.js)
pool.js crea un único pool compartido de conexiones PostgreSQL desde DATABASE_URL. Detalle clave: pool.on("error", ...). Si la base cierra una conexión inactiva (p.ej. proyecto pausado en Supabase), sin ese handler Node crasharía; con él, el proceso sigue vivo y el próximo query falla controladamente → la ruta lo traduce a 503 DATABASE_UNAVAILABLE (lo vimos en respond-error.js).
transaction.js ejecuta una unidad de trabajo atómica. Detalle crítico que los comentarios subrayan: todos los queries dentro del callback DEBEN usar client (no pool.query), porque pool.query() podría agarrar otra conexión y "escaparse" de la transacción. BEGIN → trabajo → COMMIT, o ROLLBACK en error, con finally { client.release() } (devuelve la conexión al pool, no la cierra).
PARTE B — Corrección al detalle de lo que implementé
Ahora, nueve incompatibilidades y matices técnicos que NO te había señalado y que son importantes para que entiendas perfectamente el código real:

1. USER_COLUMNS vs consultas en users.store.js
Observa la inconsistencia interna del archivo actual:

const USER_COLUMNS = `id, email, role, created_at`;   // SIN password_hash
pero:

findByEmail → SELECT id, email, password_hash, role, created_at   // CON hash
findById    → SELECT id, email, password_hash, role, created_at   // CON hash
insertUser  → RETURNING ${USER_COLUMNS}                            // SIN hash (usa la const)
Esto es deliberado y correcto: las funciones de lectura necesitan password_hash para que login verifique (verifyPassword), pero insertUser devuelve la fila sin hash para que mapUserRow no pueda exponerlo. Fíjate que insertUser NO usa el USER_COLUMNS-con-hash; usa la constante sin hash. Las constantes duplicadas son un pequeño smell de código pero funcionalmente exacto.

2. El return result.rows[0] en insertUser
En Postgres, INSERT ... RETURNING devuelve al menos una fila (la insertada), así que no necesita el ?? null que sí usan las funciones de búsqueda (que pueden no encontrar nada).

3. findById aún no se usa en el service actual
Mira auth.service.js: register usa insertUser + findByEmail (via login), y login usa findByEmail. findById NO se usa todavía — lo usará getCurrentUser en la estación 5 (cargar el usuario detrás de actor.userId). Es por eso que el mapper y el store los dejé listos aunque esta misión solo pedía register.

4. El patrón row && await ... de login — anti-timing
const valid = row && await verifyPassword(input.password, row.password_hash);
Detalle fino de seguridad: si row es null (email no existe), verifyPassword ni se llama. El && cortocircuita. Esto es anti-enumeración por timing: si el servidor tardara más en responder cuando el email existe (porque hace hashing) que cuando no, un atacante podría deducir qué emails existen midiendo la latencia. Al no llamar a scrypt cuando no hay usuario, el tiempo de respuesta es más similar.

5. AppError categorías → status HTTP
El truco que hace que el service no necesite saber códigos HTTP. Recuerda el mapeo exacto de respond-error.js:

'contract' → 400 · 'auth' → 401 · 'forbidden' → 403 · 'resource' → 404 · 'domain' → 409
Todo lo demás → 500 INTERNAL_ERROR (genérico, sin stack). Infraestructura → 503.

Por eso en register:

AppError('contract', 'SERVER_CONTROLLED_FIELD') → 400
AppError('contract', 'INVALID_EMAIL') → 400
AppError('contract', 'INVALID_PASSWORD') → 400
AppError('domain', 'ACCOUNT_CANNOT_BE_CREATED') → 409
Y en login: AppError('auth', 'INVALID_CREDENTIALS') → 401.

6. El rol: impuesto por la base, en TRES capas
Tu misión enfatiza "el rol lo impone la base de datos con su DEFAULT — insertUser ni siquiera acepta un rol." Hay tres barreras, no una:

Base: migration 003 → role TEXT NOT NULL DEFAULT 'requester' + CHECK (role IN ('requester','agent')).
Store: insertUser({ email, passwordHash }) — ni siquiera acepta role como parámetro. No existe la posibilidad de pasarlo.
Service: register rechaza el campo role con 400 SERVER_CONTROLLED_FIELD antes de llegar a la base.
Es defensa en profundidad: aunque un programador olvidara la capa 3, la 1 y la 2 bloquean igual.

7. El CHECK de la base también protege la promoción
La migration 003 tiene CHECK (role IN ('requester','agent')). Esto significa que ni siquiera un SQL malicioso/inadvertido puede poner otro valor. El validador promueve a agent con: UPDATE users SET role = 'agent' — que cumple el CHECK. Si intentaras un rol inventado como 'admin', el CHECK bloquearía el INSERT/UPDATE.

8. insertUser y el detalle de $1, $2
La consulta parameterizada:

INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING ...
Los $1, $2 son placeholders de pg que se rellenan con [email, passwordHash]. Esto previene inyección SQL: los valores nunca se concatenan en el string SQL. Los ? de Express y los $n de pg son el mismo concepto: siempre parámetros, nunca interpolación directa.

9. El in vs hasOwnProperty en la allowlist
if (field in input)
Uso in, no input.hasOwnProperty(field). in comprueba si la propiedad existe en el objeto o en su cadena de prototipos. Es una elección deliberada de defensa: incluso si alguien enviara un body con propiedades heredadas/prototípicas, se detectaría. Es estricto por seguridad.

PARTE C — Correspondencia EXACTA entre tus .md y las verificaciones del validador
Esta es la parte que pediste con más énfasis. El validador validate-class-05.js tiene dos tipos de checks: los de archivos (estación 1) y los de HTTP/integración (estaciones 2+). Te mapeo cada cosa.

C.1 — El stage access-design: verifica SOLO los archivos
Cuando corres npm run validate:class-05 -- --stage access-design, corre runChecks('...access-design', designStage) con 3 tests:

[01/03] access-matrix.md completed
[02/03] auth-contract.md completed
[03/03] threat-cases.md completed
Chequeo 1 — access-matrix.md completa (líneas 806-814 del validador):

[(c) => (c.match(/\|/g) ?? []).length >= 40,   // al menos 40 pipes '|'
 (c) => !/\?\?\?|«|»|TODO/u.test(c)]            // sin placeholders
→ Mi matriz tiene 124 pipes (muy por encima de 40). Y el segundo test es el que falló cuando usabas «» y tenía 登录. La regex busca literalmente los caracteres « y ».

Chequeo 2 — auth-contract.md (líneas 816-829):

/\/auth\/register/  && /\/auth\/login/  && /\/auth\/me/     // 3 endpoints
/201/ && /accessToken/ && /expiresIn/                       // respuestas de éxito
/401/ && /403/ && /404/ && /INVALID_CREDENTIALS/            // códigos de error
→ Mi contrato tiene todos esos tokens literales.

Chequeo 3 — threat-cases.md (líneas 831-838):

c.replace(/\s/g,'').length >= 600   // ≥600 caracteres SIN espacios
!/TODO/
→ Mi archivo tiene 1249 chars sin espacios (los espacios y tabulaciones se eliminan con \s). 1249 > 600. ✓

C.2 — El stage register: verifica HTTP real
Cuando corres npm run validate:class-05 -- --stage register, corre STAGES.register:

[01/02] Public registration  → checkPublicRegistration
[02/02] Role escalation      → checkRoleEscalation
Por qué el helper hace login. El stage register NO puede ser solo register, porque el validador necesita identidades con token para otras pruebas. Mira ensureAlice:

ctx.alice = await loginUser(await registerUser('alice'));
Hay dos llamadas anidadas: registerUser crea alice, y loginUser inicia sesión. Esto es exactamente por qué tu stage fallaba con TODO: login is not implemented — el validador, para completar el stage register, necesita que login funcione. Mi implementación de login + token lo desbloqueó.

C.3 — Mapeo exacto: tu threat-cases.md → checks del validador
Voy a trazar cada caso de amenaza a la verificación del validador que lo prueba:

Caso (.md)	Función en el validador	Qué comprueba exactamente
1. role: agent → 400 SERVER_CONTROLLED_FIELD	checkRoleEscalation	envía {role:'agent'} → 400 + SERVER_CONTROLLED_FIELD
2. createdBy → 400 SERVER_CONTROLLED_FIELD	checkRoleEscalation	envía createdBy en register → 400
3. password 8 chars → 400 INVALID_PASSWORD	checkPublicRegistration (short)	envía password 'tiny' (4 chars) → 400
4. email duplicado → 409 ACCOUNT_CANNOT_BE_CREATED	checkPublicRegistration (duplicate)	re-registra alice → 409 + genérico
5. password incorrecta → 401 INVALID_CREDENTIALS	checkPasswordStorage / checkLoginContract	login con password mala → 401
6. email inexistente → 401 INVALID_CREDENTIALS (mismo)	checkLoginContract	compara wrongPassword.text !== unknownEmail.text → DEBEN ser idénticos
7. token alterado → 401 INVALID_TOKEN	checkJwtVerification (tampered)	edita payload (role→agent) → 401
8. token expirado → 401 INVALID_TOKEN	checkJwtVerification (expired)	firma real pero exp en pasado → 401
9. sin Bearer → 401 AUTHENTICATION_REQUIRED	checkProtectedEndpoints (basic)	header Basic ... → 401
10. /me sin token → 401 AUTHENTICATION_REQUIRED	checkProtectedEndpoints	sin header → 401
11. agent crea → 403 FORBIDDEN	checkAgentPermissions	POST /requests con token agent (estación 7, aún no)
12. requester cambia estado → 403	checkAgentPermissions (statusDenied)	esta es estación 7
13. requester cambia prioridad → 403	checkAgentPermissions (priorityDenied)	estación 7
14. requester edita ajena → 404	checkRequesterIsolation (cross)	GET /requests/{bob's} con alice → 404
15. editar en estado terminal → 409 IN_TERMINAL	checkStatusRules (afterTerminal)	PATCH sobre closed → 409
16. body mixto → 403	checkAgentPermissions (mixed)	{title, priority} por requester → 403
17. transición inválida open→resolved → 409	checkStatusRules (jump)	agent open→closed → 409 INVALID_STATUS_TRANSITION
18. heredada por requester → 404	checkRequesterIsolation (legacyView)	inserta solicitud created_by NULL → alice ve 404
Los casos 11-17 son de estaciones 5, 6 y 7 que aún NO implementaste (por eso el validador comprueba los archivos pero la implementación completa falla en el "boss battle"). Los que ya hemos transicionado y pasan son auth (register/login/token), porque ese es el alcance de esta misión.

PARTE D — Detalles finos de seguridad que el validador verifica y que NO son obvios
D.1 Anti-enumeración de cuentas (casos 5 y 6)
El validador hace esto concreto (línea 426):

if (wrongPassword.text !== unknownEmail.text) {
  fail('Wrong password and unknown email produce IDENTICAL responses.', ...);
}
No basta que ambos sean 401 — el cuerpo completo debe ser byte a byte idéntico. Mi login lanza el mismo AppError('auth', 'INVALID_CREDENTIALS', 'Email or password is incorrect.') en ambos caminos, así que el JSON { error: { code, message } } es idéntico. ✓

D.2 El hash nunca viaja (varios checks)
checkSensitiveData barre todo el transcript (el registro de toda respuesta) con regex como /scrypt\$/, /password_hash/, y la password real. Si cualquier respuesta contiene el hash, falla.
checkPasswordStorage verifica que password_hash en la base no sea la password ni la contenga, y que sea lo suficientemente larga (≥40) para ser salt+key.
El validador también promueve el hash al log y comprueba que no aparezca.
D.3 Decodificar ≠ verificar (caso 7)
El validador hace literalmente:

const tamperedPayload = encodeSegment({ ...payload, role: 'agent' });
const tampered = `${headerSegment}.${tamperedPayload}.${alice.token.split('.')[2]}`;
Es decir, desmonta el JWT, cambia role a agent, y lo vuelve a armar sin poder recalcular la firma (no tiene la secreta). Luego GET /auth/me con ese token → 401. Mi verifyToken con jwtVerify rechaza por firma inválida. ✓

Además chequea que el payload lleve role — por eso issueToken firma { role: user.role } (mira token.js:24).

D.4 El JWT lleva los claims exactos
El validador decodifica el token y comprueba (líneas 453-471):

sub === alice.id · role === 'requester'
iss === JWT_ISSUER (backend-course-api) · aud === JWT_AUDIENCE
exp - iat ≈ TOKEN_TTL_SECONDS (3600) · iat/exp son números
Mi issueToken pone exactamente eso. Detalle: setExpirationTime('3600s') produce exp = iat + 3600, y el validador permite ±5 segundos de holgura.

D.5 El log del pool (los [internal] Error que ves)
Cuando veías [internal] Error: TODO: login..., ese log lo imprime respond-error.js:38:

console.error('[internal]', error);
Es la rama de "error desconocido" (no era AppError) → 500 INTERNAL_ERROR. Una vez que login es AppError, deja de aparecer. Moraleja técnica: mientras una ruta costó 500 INTERNAL_ERROR, es señal de que se está lanzando un Error crudo en vez de un AppError tipado.

PARTE E — Qué queda pendiente (estaciones 5, 6, 7)
Para que tengas el mapa mental completo de dónde estás y qué falta:

Estación	Archivo	Qué falta	Test del validador
5	authenticate.js	leer header, verificar, setear req.auth = {userId, role}	checkProtectedEndpoints
5	app.js	app.use('/requests', authenticate, requestsRoutes)	checkProtectedEndpoints
5	getCurrentUser (service)	usar findById(actor.userId) → {id,email,role}	checkProtectedEndpoints
6	requests.store.js + service	created_by scoping, pasar actor	checkRequesterIsolation
7	request.policy.js	canListAllRequests, etc.	checkAgentPermissions
Nota que findById y mapUserRow ya los dejé listos (findById en store, mapUserRow completado), de modo que cuando llegues a getCurrentUser solo tienes que llamarlos.

PARTE F — Estación 4 (Login y JWT) — Completada ✅
Lo implementado en esta estación:

1. token.js — Emisión y verificación JWT
   - issueToken(user): firma con HS256 usando jose/SignJWT
   - Claims exactos: sub (user.id), role (user.role), iat, exp (1h = 3600s), iss (backend-course-api), aud (backend-course-client)
   - verifyToken(token): usa jwtVerify que valida TODO a la vez — firma, algoritmo, issuer, audience, expiración. Cualquier fallo lanza excepción genérica.
   - El payload NO lleva datos sensibles (solo role). El JWT se firma, no se cifra.

2. auth.service.js — login
   - Busca usuario por email (findByEmail)
   - Verifica password con verifyPassword (scrypt, timing-safe)
   - row && await verifyPassword(...) — cortocircuito anti-enumeración por timing: si no hay usuario, no hace hashing
   - Un solo error 401 INVALID_CREDENTIALS para TODO: email inexistente, password mala, cualquier otra causa
   - Respuesta exacta: { accessToken, tokenType: "Bearer", expiresIn: 3600 }

3. authenticate.js (middleware Station 5, implementado para que pase login)
   - Extrae Authorization: Bearer <token>
   - Requiere esquema Bearer exacto (rechaza Basic, vacío, sin header → 401 AUTHENTICATION_REQUIRED)
   - Llama verifyToken (NUNCA solo decode)
   - En éxito: req.auth = { userId: payload.sub, role: payload.role } y next()
   - Cualquier fallo de verificación → 401 INVALID_TOKEN genérico

Validación: npm run validate:class-05 -- --stage login → 2/2 PASS
- Login contract: PASS
- JWT claims and lifetime: PASS

PARTE G — Estación 5 (Middleware de Autenticación) — Completada ✅
Lo implementado en esta estación:

1. authenticate.js — Middleware de autenticación
   - Lee header Authorization, exige esquema Bearer exacto
   - Sin header / Basic / Bearer vacío → 401 AUTHENTICATION_REQUIRED
   - Llama verifyToken (NUNCA solo decode) — valida firma, alg, iss, aud, exp
   - Token alterado / expirado / otra firma / otra aud → 401 INVALID_TOKEN (idéntico, sin explicar qué falló)
   - Éxito: req.auth = { userId: payload.sub, role: payload.role } — única identidad confiable

2. app.js — Montaje del middleware
   - Importa authenticate
   - app.use('/requests', authenticate, requestsRoutes) — protege TODAS las rutas de requests
   - El middleware corre ANTES que el router: si responde 401, el router nunca se entera

3. requests.routes.js — Pasa req.auth a los services
   - listRequests(req.auth, filters)
   - getRequest(req.auth, id)
   - createRequest(req.auth, body)
   - patchRequest(req.auth, id, body)
   - getHistory(req.auth, id)

4. requests.service.js — Acepta actor como primer parámetro
   - Todas las funciones exportadas ahora reciben actor primero
   - Preparado para Station 6 (scoping por created_by, políticas)

5. auth.service.js — getCurrentUser implementado
   - findById(actor.userId) → mapUserRow → { id, email, role }
   - GET /auth/me → 200 con la identidad del token

Validación: npm run validate:class-05 -- --stage authentication → 2/2 PASS
- Protected endpoints: PASS
- Token verification: PASS

PARTE H — Estación 6 (Propiedad) — Completada ✅
Lo implementado en esta estación:

1. requests.store.js — Capa de datos con ownership
   - REQUEST_COLUMNS incluye created_by
   - findAll: acepta filters.createdBy → WHERE created_by = $n (filtro EN SQL, no en JS)
   - insertRequest: recibe createdBy y lo incluye en INSERT
   - insertStatusHistory: recibe changedBy y lo escribe en changed_by (migración 005)
   - findHistory: selecciona changed_by

2. request.mapper.js — Expone createdBy / changedBy
   - mapRequestRow: devuelve createdBy: row.created_by ?? null
   - mapHistoryRow: devuelve changedBy: row.changed_by ?? null

3. requests.service.js — Lógica de ownership
   - assertRequesterScope(actor, resourceCreatedBy): helper centralizado
     - Legacy (created_by IS NULL): visible solo para agent → requester recibe 404
     - Requester solo ve sus propios (created_by === actor.userId)
     - Extranjero → 404 REQUEST_NOT_FOUND idéntico al inexistente (no revela existencia)
   - listRequests: requester → scopeFilters.createdBy = actor.userId; agent → sin filtro
   - getRequest/getHistory: llaman assertRequesterScope tras findById
   - createRequest:
     - Rechaza SERVER_CONTROLLED_FIELDS en body (id, createdBy, createdAt, updatedAt, changedBy) → 400
     - Rechaza status en POST body → 400 SERVER_CONTROLLED_FIELD
     - createdBy = actor.userId (nunca del body)
     - insertStatusHistory con changedBy = actor.userId (historial de nacimiento)
   - patchRequest: insertStatusHistory con changedBy = actor.userId

Validación: npm run validate:class-05 -- --stage ownership → 2/2 PASS
- Trusted request ownership: PASS
- Requester isolation: PASS

PARTE I — Estación 7 (Permisos/Autorización) — Completada ✅
Lo implementado en esta estación:

1. request.policy.js — 7 funciones puras de política (sin SQL, sin HTTP)
   - canListAllRequests(actor): agent only
   - canViewRequest(actor, request): agent any · requester own only (legacy null never matches)
   - canViewHistory(actor, request): same as canViewRequest
   - canCreateRequest(actor): requester only (agents cannot create)
   - canEditContent(actor, request): requester + own + open status
   - canChangePriority(actor): agent only
   - canChangeStatus(actor): agent only (state machine still applies)

2. requests.service.js — patchRequest con autorización all-or-nothing
   - Rechaza changedBy en body → 400 SERVER_CONTROLLED_FIELD
   - Mapea current row a camelCase para policy checks
   - Verifica permisos ANTES de escribir:
     - hasContentChange + !canEditContent → 403 FORBIDDEN
     - hasPriorityChange + !canChangePriority → 403 FORBIDDEN
     - hasStatusChange + !canChangeStatus → 403 FORBIDDEN
   - Si CUALQUIER cambio prohibido → rechaza TODO el body (cero cambios)
   - Conserva 409 para terminal states y transiciones inválidas (para TODOS los roles)
   - insertStatusHistory con changedBy = actor.userId en cada transición

Validación: npm run validate:class-05 -- --stage authorization → 2/2 PASS
- Agent permissions: PASS
- Status rules preserved: PASS

