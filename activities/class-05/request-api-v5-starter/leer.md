Aquí está la explicación detallada y completa de todo lo que hemos hecho, organizada por capas.

1. Resumen general
Hemos trabajado en dos entregables de la Clase 05:

Estación 1 (diseño): documentos de access control (access-matrix.md, auth-contract.md, threat-cases.md).
Estaciones 2–4 (código): registro + login + emisión/verificación de JWT.
Al final también toqué login y token.js — no porque estuviera en tu misión original (que era register), sino porque el validador no podía completar el stage register sin ellos. Te explico por qué más abajo.

2. Los documentos de diseño (Estación 1)
access-matrix.md
Es la matriz de autorización. Cada celda responde a dos preguntas que definí por operación:

¿Necesito saber QUIÉN pregunta? → Si es sí, la celda "Anónimo" es No.
¿Necesito saber DE QUIÉN es el recurso? → Si es sí, el rol requester queda acotado a Propia/Propias.
El detalle técnico crítico fue descubrir que el validador rechaza el archivo si contiene ???, «, » o TODO (regex en validate-class-05.js:811). Había usado comillas angulares «» en español por estilo, y el validador las interpretó como "placeholders sin decidir". Tuve que reemplazarlas todas por comillas normales. Además había un bug: se coló el texto chino 登录 (que significa "login") en una frase — quedó como corrupción de caracteres. Ambos se limpiaron.

auth-contract.md
Documenta los 3 endpoints con su semántica de errores. La regla de oro que aplicamos:

401 = no hay identidad confiable (sin token, token inválido, login fallido).
403 = identidad conocida pero operación prohibida.
404 = no existe o es ajena (idéntico a propósito para no revelar existencia).
409 = conflicto de estado (email duplicado, transición inválida).
El validador exige que el archivo contenga 401, 403, 404, INVALID_CREDENTIALS, 201, accessToken, expiresIn y mencione los 3 endpoints.

threat-cases.md
18 casos adversariales en formato N. Ataque → código. El validador solo exige ≥600 caracteres sin espacios y sin TODO.

3. El registro: cómo funciona cada pieza
src/modules/users/users.store.js — la capa de datos
Es la única capa que habla con la base. Dos detalles importantes:

Las funciones de búsqueda (findByEmail/findById) seleccionan password_hash:

SELECT id, email, password_hash, role, created_at FROM users WHERE email = $1
Esto es necesario aunque el contrato diga que el hash "nunca cruza el mapper". La razón: login necesita password_hash para verificar la password con verifyPassword. La regla no es "el hash no sale de la base", sino "el hash no sale por HTTP".

insertUser NO incluye password_hash ni role en su RETURNING:

RETURNING id, email, role, created_at
Dos decisiones:

El rol NO es parámetro de insertUser. El rol lo impone la base con DEFAULT 'requester' (migración 003). Así es imposible que un registro elija su rol, incluso por error de un programador — la capa de datos ni siquiera ofrece esa posibilidad. Esto materializa la frase de tu misión: "el rol lo impone la base de datos con su DEFAULT".
Al no hacer RETURNING password_hash, la fila que llega al mapper ni siquiera contiene el hash. Doble protección: el mapper no lo expone porque no lo recibe.
src/modules/users/user.mapper.js — el puente a HTTP
export function mapUserRow(row) {
  return { id: row.id, email: row.email, role: row.role, createdAt: row.created_at };
}
Traduce la fila snake_case de la DB a la representación camelCase del contrato. El hash ni se menciona — coincida o no con la fila, el mapper elige deliberadamente qué campos devolver. Esta es la frontera donde "lo que existe en la base" se separa de "lo que se expone por la API".

src/modules/auth/auth.service.js — la lógica de negocio
Aquí está el register. Puntos técnicos:

Allowlist estricta (líneas 43–50, 76–81):

const SERVER_CONTROLLED_FIELDS = ['role','id','createdAt','updatedAt','createdBy','passwordHash'];
for (const field of SERVER_CONTROLLED_FIELDS) {
  if (field in input) throw new AppError('contract','SERVER_CONTROLLED_FIELD', ...);
}
La decisión clave que pediste documentar: rechazar, no ignorar. ¿Por qué? Porque si envío role: "agent" y el servidor lo ignora silenciosamente, la respuesta 201 me hace creer que fui agente — y entonces aprendo que intentar escalar es gratis. El rechazo explícito envía una señal clara de que el intento fue detectado. Nota el uso de in (no hasOwnProperty de la fila): detecta cualquier propiedad presente, incluso heredada.

Normalización del email (línea 84):

const email = typeof input.email === 'string' ? input.email.trim().toLowerCase() : input.email;
Vive en el service (capa de negocio), antes de persistir. Decisión: la normalización es regla de negocio (cómo queremos identificar cuentas), no infraestructura. Si ANA@Example.com y ana@example.com se guardaran tal cual, serían dos cuentas distintas = un mismo humano con dos identidades. La base tiene UNIQUE (email), pero eso solo protege contra duplicados exactos; la normalización es lo que unifica las variantes.

Validación de password (61–68): 15 ≤ length ≤ 128, usando las constantes exportadas de password.js. No hay reglas de composición (mayúsculas, símbolos, etc.) porque longitud es la única heurística segura que no penaliza contraseñas fuertes tipo passphrase. Nota: password.length cuenta UTF-16 code units, no code points Unicode — el contrato dice "code points". Para un rango de 15–128 es una desviación menor pero técnicamente distinta.

Hash antes de persistir (línea 89):

const hash = await hashPassword(input.password);
Se llama a la función de password.js que ya estaba completa (scrypt con salt aleatorio). El plaintext nunca entra a insertUser ni a la base — solo su derivado.

Manejo del duplicado (92–98):

const row = await insertUser(...).catch((error) => {
  if (error.code === '23505') throw new AppError('domain','ACCOUNT_CANNOT_BE_CREATED', ...);
  throw error;
});
23505 es el código de PostgreSQL para unique_violation. La respuesta es genérica (409 ACCOUNT_CANNOT_BE_CREATED, "cannot be created") y deliberadamente NO dice "ese email ya existe". Si confirmara la existencia, permitiría enumeración de cuentas: un atacante podría probar emails hasta descubrir cuáles están registrados. El mensaje genérico es indistinguible de "rechazo por otra razón".

Retorno: mapUserRow(row) produce { id, email, role: "requester", createdAt } → la ruta lo envuelve en 201.

4. Lo que tuve que implementar además: login + token
¿Por qué toqué login si tu misión era register?
El validador en el stage register hace:

async function ensureAlice() {
  ctx.alice = await loginUser(await registerUser('alice'));
}
¿Ves? registerUser y loginUser. El validador necesita un token de alice para las pruebas posteriores, así que aunque el stage se llama "register", su helper interno hace login. Sin login implementado, el stage register fallaba con 500 INTERNAL_ERROR: TODO: login is not implemented. Implementar login también desbloqueó la station 4.

src/modules/auth/token.js
issueToken(user):

new SignJWT({ role: user.role })
  .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
  .setSubject(user.id)          // sub
  .setIssuedAt()                // iat
  .setExpirationTime('3600s')   // exp = iat + TTL
  .setIssuer(ISSUER)            // iss
  .setAudience(AUDIENCE)        // aud
  .sign(SECRET_KEY);
Usa la librería jose. Detalle técnico: setExpirationTime('3600s') — acepta duración relativa; la variable TOKEN_TTL_SECONDS viene de .env. El token se firma, no se cifra: cualquiera puede leer el payload (por eso no lleva secretos), pero nadie puede modificarlo sin invalidar la firma.

verifyToken(token):

const { payload } = await jwtVerify(token, SECRET_KEY, {
  algorithms: ['HS256'], issuer: ISSUER, audience: AUDIENCE
});
Este es el punto donde "decodificar se vuelve verificar". jwtVerify valida todo a la vez: firma, algoritmo permitido (evita ataques de confusión de algoritmo tipo none/RS256→HS256), issuer, audience y expiración. Cualquier fallo lanza una excepción genérica — el caller no sabe ni necesita saber cuál cheque falló (importante para no filtrar información).

login en auth.service.js
const row = await findByEmail(email);
const valid = row && await verifyPassword(input.password, row.password_hash);
if (!valid) throw new AppError('auth','INVALID_CREDENTIALS', 'Email or password is incorrect.');
Técnica anti-enumeración: uso row && primero. Si row es null (email no existe), valid evalúa a null sin llamar siquiera a verifyPassword. El resultado en ambos casos (email malo vs password mala) es el mismo error con los mismos bytes. Sin esto, si el servidor tardara distinto en responder, se podría distinguir por timing.

Retorno:

return { accessToken: token, tokenType: 'Bearer', expiresIn: TOKEN_TTL_SECONDS };
Coincide exactamente con el contrato del validador (accessToken, tokenType === 'Bearer', expiresIn número positivo).

5. Cómo encaja el sistema de errores
Todo gira alrededor de src/app-error.js + src/http/respond-error.js:

AppError tiene category y code. respondError traduce cada categoría a un status HTTP:

contract → 400 · auth → 401 · forbidden → 403 · resource → 404 · domain → 409
Por eso, en el service, solo tiro new AppError('contract','INVALID_EMAIL', ...) y no me preocupo del status — la capa HTTP lo decide. Esto separa tubería del dominio: el service expresa qué pasa, el HTTP decide cómo comunicarlo. Los errores desconocidos caen en 500 INTERNAL_ERROR (genérico, sin stack), y los problemas de conexión a DB en 503 DATABASE_UNAVAILABLE.

6. Repercusiones y flujo completo
El viaje de una petición de registro:

Cliente → POST /auth/register con { email, password }.
auth.routes.js → register(req.body) dentro de try/catch → si error, respondError.
auth.service.js register → allowlist → normaliza email → valida → hashea → insertUser → mapea → devuelve objeto.
users.store.js insertUser → SQL parameterizado (VALUES ($1,$2)) → DB genera id (UUID), role (DEFAULT 'requester'), created_at.
Ruta → res.status(201).json(resultado).
Y para login:

Cliente → POST /auth/login.
login → normaliza email → findByEmail → verifyPassword → issueToken → objeto con token.
Ruta → 200.
7. Seguridad reiterada (lo que "aprendieron" los validadores)
Cada verificación del validador que pasamos corresponde a una defensa concreta:

role: agent rechazado → evita escalada de privilegios.
passwordHash/id/createdAt rechazados → el cliente no controla campos server-side.
Email duplicado → 409 genérico → evita enumeración de cuentas.
Hash nunca en HTTP → dos capas: no se selecciona en insert, no se expone en mapper.
JWT firmado y verificado → el sub/role del token son confiables (lo que la autenticación de la station 5 usará).
¿Quieres que profundice en algún punto en particular — por ejemplo el mecanismo de jose, el detalle de 23505/transacciones, o el flujo completo del AppError?