# Examen de conocimiento asistido por IA — clases 1-7

Guarda aquí el TRANSCRIPT COMPLETO de tu examen conversacional
(ITSU-KNOWLEDGE-01-07-1.0): todas las preguntas, todas tus respuestas,
todas las repreguntas y los cuatro bloques del cierre. Sin editar.

> Este examen complementa la evaluación de evidencia: mide lo que puedes
> explicar SIN el repositorio delante. El docente cruza ambos resultados
> y puede verificar cualquier respuesta oralmente.

## Metadata de mi examen

* studentId: [abrahamperez.itsu@gmail.com]
* Modelo utilizado: [Gemini de Google]
* Fecha: [28-09-2026]
* ¿Formato inválido y reparado una vez?: [no / sí / MODEL_FORMAT_FAILURE] -No

## TRANSCRIPT COMPLETO (desde COMENZAR hasta el BLOQUE 4)

BLOQUE 4 — FEEDBACK DOCENTE
Prioridades transversales: Reforzar los principios de seguridad en bases de datos (SQL Injection) y la correcta diferenciación de códigos de estado HTTP en el control de acceso (401 vs 403) y reglas de negocio (409).

Señales registradas: NONE.

Preguntas orales sugeridas para verificación posterior:

Pregunta: "¿Por qué si un usuario envía su userId en el body de un PATCH para cambiar una solicitud, el servidor debe ignorarlo y usar el del JWT?"

Respuesta esperada: Porque el body puede ser manipulado libremente por el cliente para suplantar a otro usuario; el JWT está firmado por el servidor y garantiza de forma segura la identidad real de quien hace la petición.

Pregunta: "Si concatenamos una variable directamente en una cadena SQL como db.query('SELECT * FROM users WHERE name = ' + input), ¿qué problema ocurre y cómo lo evita la parametrización?"

Respuesta esperada: Permite una vulnerabilidad de Inyección SQL donde el usuario puede ejecutar código SQL malicioso. La parametrización separa la instrucción SQL de los datos enviados al motor de la base de datos.

Nivel de confianza del examen: Alto. Respuestas fluidas, orgánicas y evaluadas directamente sobre la expresión del estudiante.
## Metacognición (responde tú, después del examen)

1. ¿Qué pregunta o repregunta te costó más, y por qué crees que fue esa?

[COMPLETAR]

2. Compara este resultado con tu reporte de evidencia: ¿coinciden? ¿Dónde
   difieren y qué te dice esa diferencia?

[COMPLETAR]
