# Evaluator report

Guarda aquí los bloques 1, 3 y 4 de tu evaluación:

## BLOQUE 1 — RESULT_CODE

ITSU-KNOWLEDGE|V=1.0|R=BACKEND-01-08-K1|ID=K09-abrahamperez-itsu-nogit00|Q1=3-3-3-2|Q2=3-3-2-2|Q3=3-2-3-2|Q4=1-1-1-1|Q5=2-1-1-1|ACTION=SUPPORT

## BLOQUE 3 — Reporte del estudiante

Reporte de evaluación de conocimientos
Resultado general
El estudiante ha completado la evaluación demostrando un dominio sólido de los conceptos fundamentales de arquitectura backend, separación de responsabilidades entre controladores y casos de uso, así como el manejo de transacciones e integridad de datos. Se identificaron áreas de oportunidad específicas en la validación estructural de entradas y el manejo de concurrencia a nivel de base de datos.

Desempeño por pregunta
Pregunta 1 (Flujo y Arquitectura): Excelente desempeño identificando el orden de ejecución y delimitando las responsabilidades de HTTP en el controlador frente a la lógica de dominio.

Pregunta 2 (Transacciones e Invariantes): Sólida comprensión de la necesidad de atomicidad y el rol de COMMIT y ROLLBACK, superando la confusión inicial sobre el modelo stateless.

Pregunta 3 (Autenticación y Autorización): Muy buen dominio conceptual de la diferencia entre identidad y permisos, identificando correctamente el uso del código HTTP 403.

Pregunta 4 (Validación y Errores): Sin respuesta registrada por parte del estudiante, evidenciando un vacío en la gestión de esquemas de entrada y errores.

Pregunta 5 (Concurrencia): Comprensión parcial del escenario de múltiples peticiones, requiriendo afianzar los mecanismos de control de concurrencia en bases de datos relacionales.

Conceptos demostrados
Separación clara entre la capa de transporte HTTP y los casos de uso de negocio.

Uso y propósito de transacciones en bases de datos para garantizar invariantes y consistencia (COMMIT/ROLLBACK).

Diferenciación entre autenticación (401) y autorización (403).

Vacíos prioritarios
Falta de dominio en la validación estructural de peticiones (req.body) y el manejo centralizado de errores.

Desconocimiento de los mecanismos de mitigación de condiciones de carrera (bloqueos y actualizaciones condicionales en SQL).

Rectificaciones valiosas
Se esclareció que el comportamiento stateless de HTTP no exime a la aplicación de mantener la consistencia persistente mediante transacciones en la base de datos.

Tres acciones de estudio
Estudiar la implementación de validación de esquemas y manejo centralizado de errores en aplicaciones Node.js y Express.

Repasar estrategias de control de concurrencia en bases de datos relacionales (bloqueos pesimistas, optimistas y actualizaciones atómicas condicionales).

Investigar patrones de diseño para auditoría y trazabilidad de eventos de negocio.

Evidencia faltante
No se aportaron elementos sobre la capa de validación estructural de datos de entrada en la Pregunta 4.

## BLOQUE 4 — Feedback para el docente

Feedback para el docente
Temas prioritarios: Validación de entradas/errores en Express y control de concurrencia (condiciones de carrera) en PostgreSQL.

Pregunta donde apareció cada problema: Pregunta 4 (vacío total en validación) y Pregunta 5 (manejo simplista de concurrencia).

Evidencia concreta citada: Respuestas textuales del estudiante indicando "no se, siguiente" en Q4 y asumiendo copias aisladas de respuesta en Q5.

Nivel de confianza: Medio-Alto en arquitectura y transacciones; Medio-Bajo en concurrencia y validación.

Apoyo o verificación: Se recomienda sesión de apoyo específica y verificación oral breve.

Preguntas orales sugeridas y respuestas mínimas:

¿En qué capa de Express se debe ubicar el middleware de validación de esquemas antes de llegar al controlador? -> Respuesta mínima: Antes de los controladores, mediante un validador de esquemas conectado a la ruta.

¿Cómo previene una cláusula WHERE condicional una condición de carrera al reclamar un recurso? -> Respuesta mínima: Asegurando atómicamente que el recurso cumpla la condición al momento de ejecutar el UPDATE, evitando sobreescrituras concurrentes.
