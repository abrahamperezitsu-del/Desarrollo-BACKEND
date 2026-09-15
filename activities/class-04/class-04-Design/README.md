# Entrega 04 — Persistencia, integridad e historia

> Entrega correspondiente a la integración de PostgreSQL y Supabase.

## Qué contiene esta carpeta

```txt
activities/class-04/
├── README.md               ← este archivo
├── data-model.md           ← tablas, tipos, claves, reglas por capa (fase 1)
├── persistence-contract.md ← las operaciones del store (fase 1)
├── query-matrix.md         ← operación → SQL → parámetros (fase 1)
├── transaction-plan.md     ← la unidad de trabajo y sus fallos (fase 1)
├── error-map.md            ← categorías de error (fase 1)
├── test-matrix.md          ← casos y resultados observados (fase 6)
├── ai-usage.md             ← registro del uso de IA (fase 4)
└── reflection.md           ← reflexión final (fase 6)

Decisiones que tomé y por qué
Se implementó una arquitectura basada en un pool de conexiones compartido utilizando el driver nativo pg para PostgreSQL. Para garantizar que los cambios de estado en las solicitudes nunca pierdan la traza de auditoría, las operaciones de escritura dobles (UPDATE requests + INSERT request_status_history) se encapsularon dentro de una transacción atómica manejada en la función helper withTransaction, asegurando que ante cualquier fallo se ejecute un ROLLBACK y se libere la conexión de forma segura en el bloque finally.