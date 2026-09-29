# Autoevaluación asistida por IA — checkpoint 1-7

Guarda aquí la salida COMPLETA y SIN EDITAR de tu única ejecución del
prompt ITSU-CHECKPOINT-01-07-1.0.

> Este reporte es un insumo de la evaluación del curso: el docente lo
> revisa junto con tu evidencia y puede verificarlo oralmente. Si no
> estás de acuerdo con algo, cuestiónalo con argumentos en la
> metacognición.

## Metadata de mi ejecución

* Modelo utilizado: [Gemini de Google]
* Fecha: [28-09-2026]
* Commit evaluado: []
* ¿Necesité el prompt de reparación?: [no / sí, una vez / MODEL_FORMAT_FAILURE] -No

## BLOQUE 1 — RESULT_CODE

ITSU-KNOWLEDGE|V=1.0|R=BACKEND-01-07-K1|C01=3|C02=3|C03=2|C04=0|C05=0|C06=3|C07=3|ACTION=SUPPORT

## BLOQUE 2 — JSON

{
  "resultCode": "ITSU-KNOWLEDGE|V=1.0|R=BACKEND-01-07-K1|C01=3|C02=3|C03=2|C04=0|C05=0|C06=3|C07=3|ACTION=SUPPORT",
  "studentId": "abrahamperez.itsu@gmail.com",
  "action": "SUPPORT",
  "signals": [
    "NONE"
  ],
  "classes": [
    {
      "classId": "01",
      "level": 3,
      "question": "Diferencia entre frontend y backend y por qué el backend es un proceso activo.",
      "evidence": "el front es la cara bonita... el back es toda la logica de negocio, necesita estar escuchando para tomar y responder peticiones"
    },
    {
      "classId": "02",
      "level": 3,
      "question": "Uso del body para crear solicitudes y riesgos de usar query parameters.",
      "evidence": "exposicion de datos que quedan visibles en logs del servidor, historial del navegador y cabecera"
    },
    {
      "classId": "03",
      "level": 2,
      "question": "Significado del error 409 y diferencia con 400; cancelar vs eliminar.",
      "evidence": "el error 400 significa error de sintaxis y el 409 significa conflicto entre varias peticiones en marcha"
    },
    {
      "classId": "04",
      "level": 0,
      "question": "Parametrización de consultas SQL y garantías de transacciones.",
      "evidence": "para mantener el orden y la composicion de las migraciones y transacciones"
    },
    {
      "classId": "05",
      "level": 0,
      "question": "Diferencia entre 401 y 403 e identidad basada en JWT vs body.",
      "evidence": "la 403 es una solicitud ya existente y el 401 una que no existe"
    },
    {
      "classId": "06",
      "level": 3,
      "question": "Función de la capa Service y separación con la capa Store.",
      "evidence": "service se centra en la logica de negocio y se comunica con store, mapper, policy"
    },
    {
      "classId": "07",
      "level": 3,
      "question": "Errores esperados vs 500 y no exposición de detalles al cliente.",
      "evidence": "por cuestiones de seguridad al evitar revelar informacion sensible"
    }
  ],
  "reviewTopics": [
    "Parametrización de consultas SQL y prevención de SQL Injection (Clase 4)",
    "Diferencia entre Autenticación (401) y Autorización (403) mediante JWT (Clase 5)",
    "Semántica de errores HTTP (400 vs 409) y transiciones de estado de recursos (Clase 3)"
  ],
  "teacherDigest": "El estudiante demuestra buena comprensión conceptual de la arquitectura por capas, diagnóstico de errores y flujo HTTP. Presenta vacíos críticos en persistencia SQL (parametrización/transacciones) y autenticación/autorización HTTP."
}

## BLOQUE 3 — Reporte del estudiante

Lo que explicaste bien
Fundamentos y Arquitectura por Capas: Comprendes claramente el rol del backend como un servicio que permanece activo en espera de peticiones (Clase 1) y identificaste con precisión la responsabilidad de la capa service como núcleo de la lógica de negocio y su comunicación con store, mapper y policy (Clase 6).

Flujo HTTP y Diagnóstico de Errores: Explicaste adecuadamente la importancia de enviar datos sensibles en el body para evitar su exposición en logs o historial (Clase 2). Asimismo, identificaste bien la diferencia entre errores esperados de validación y fallas imprevistas del sistema (500), comprendiendo que no se deben exponer detalles técnicos en la respuesta por seguridad (Clase 7).

Huecos revelados en las repreguntas
Persistencia y SQL (Clase 4): Confundiste la parametrización de consultas SQL con la organización de migraciones. La parametrización sirve para separar la lógica de la consulta de los datos de entrada, evitando ataques de inyección SQL (SQL Injection). También faltó precisión sobre cómo las transacciones garantizan la atomicidad (commit/rollback) ante fallas parciales.

Autenticación y Autorización (Clase 5): Hubo una confusión fundamental entre los códigos HTTP: 401 Unauthorized indica falta de autenticación (el servidor no sabe quién eres) y 403 Forbidden indica falta de autorización (se sabe quién eres, pero no tienes permisos sobre el recurso). Respecto al JWT, la razón principal de derivar la identidad del token es la verificación criptográfica del servidor para evitar la suplantación de identidad (spoofing).

Reglas de Estado HTTP (Clase 3): Definiste el error 409 como un conflicto de peticiones en marcha (concurrencia), cuando en realidad representa una violación a las reglas de estado del recurso (por ejemplo, intentar resolver una solicitud que ya está cancelada).

Temas prioritarios de repaso
Parametrización SQL y Drivers (Clase 4): Revisa en la capa store del proyecto cómo se envían las variables en un arreglo separado de la consulta ($1, $2) para prevenir Inyección SQL.

Autenticación vs Autorización (Clase 5): Revisa el middleware de autenticación (verificación de token JWT en cabeceras) y las políticas que retornan 401 y 403.

Máquinas de Estado y Semántica HTTP (Clase 3): Revisa las transiciones válidas entre estados de la solicitud y por qué un cambio no permitido debe retornar 409 Conflict.

## BLOQUE 4 — Feedback docente

BLOQUE 4 — FEEDBACK DOCENTE
Prioridades transversales: Reforzar los principios de seguridad en bases de datos (SQL Injection) y la correcta diferenciación de códigos de estado HTTP en el control de acceso (401 vs 403) y reglas de negocio (409).

Señales registradas: NONE.

Preguntas orales sugeridas para verificación posterior:

Pregunta: "¿Por qué si un usuario envía su userId en el body de un PATCH para cambiar una solicitud, el servidor debe ignorarlo y usar el del JWT?"

Respuesta esperada: Porque el body puede ser manipulado libremente por el cliente para suplantar a otro usuario; el JWT está firmado por el servidor y garantiza de forma segura la identidad real de quien hace la petición.

Pregunta: "Si concatenamos una variable directamente en una cadena SQL como db.query('SELECT * FROM users WHERE name = ' + input), ¿qué problema ocurre y cómo lo evita la parametrización?"

Respuesta esperada: Permite una vulnerabilidad de Inyección SQL donde el usuario puede ejecutar código SQL malicioso. La parametrización separa la instrucción SQL de los datos enviados al motor de la base de datos.

Nivel de confianza del examen: Alto. Respuestas fluidas, orgánicas y evaluadas directamente sobre la expresión del estudiante.

---

## Mi lectura del reporte (metacognición — esto SÍ lo escribes tú)

* ¿Estoy de acuerdo con el reporte?

  [Si, me parece que abarca bien mi rendimiento]

* ¿Qué criterio considero incorrecto?

  [Ninguno, la ia expuso bien los probelmas que presento a la hora de trabajar]

* ¿Qué evidencia adicional aportaría?

  [Cumplo en su gran mayoria los requerimientos de las clases, solo hace falta terminar los cuestionarios]

* ¿Qué recomendación voy a seguir?

  [La de mejorar documentacion de decisiones y la estructuracion de incidentes]
