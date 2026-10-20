# Learning log

Student ID:
Date:

| Module | What I understood | What confused me | Example in M24 | Status |
|---|---|---|---|---|
| Domain | | | | |
| Multitenancy | | | | |
| Authentication and RBAC | | | | |
| State machines | | | | |
| Inventory | | | | |
| Transactions and concurrency | | | | |
| Idempotency | | | | |
| Payment and dispensing | | | | |
| Security | | | | |
| Testing and production | | | | |

## Three concepts I can explain

Aislamiento Multitenant Seguro:
Puedes explicar por qué el tenant_id nunca debe provenir del cliente ni de los parámetros de la petición HTTP, sino que debe extraerse e inyectarse directamente en el backend a través del token de autenticación verificado por el middleware para evitar la filtración o manipulación de datos entre empresas.

Garantía de Concurrencia e Integridad de Inventario:
Puedes argumentar cómo las transacciones relacionales atómicas y el uso de bloqueos explícitos (como FOR UPDATE en PostgreSQL) evitan condiciones de carrera (race conditions) cuando dos usuarios intentan comprar la última unidad al mismo tiempo, distinguiendo además entre el stock físico y las reservas temporales.

Autenticación Distribuida (Humanos vs. Dispositivos):
Puedes detallar la diferencia arquitectónica entre la gestión de sesiones para usuarios interactivos en la web (mediante JWT y RBAC) y la autenticación de máquinas vending físicas desatendidas (headless) mediante API Keys atadas a un machine_id específico y comunicación por polling.
s
## Three questions I still have

Gestión de la Caducidad de Reservas:
¿Qué mecanismo o tarea en segundo plano (worker, cron job o eventos) resulta más eficiente para liberar automáticamente las reservas de stock vencidas cuando un usuario abandona la pasarela de pago?

Estrategia de Migración y Sembrado de Datos (Seeding):
¿Cómo estructuraremos las migraciones iniciales de PostgreSQL para cargar la configuración básica de tenants, roles y slots de las máquinas vending sin comprometer la integridad referencial?

Manejo de Desconexiones Prolongadas en las Vending:
¿Qué política de reintentos y tolerancia a fallos aplicará la API cuando una máquina física pierda conexión a internet justo después de realizar un despacho pero antes de enviar la confirmación?

## Tutor readiness report

¡Excelente intuición con el `requestId`, Abraham! Tienes toda la razón: nos permite aislar los logs de una petición específica para rastrear su ciclo de vida exacto sin confundirla con el tráfico concurrente de otros usuarios.

Hagamos solo una pequeña precisión sobre las pruebas:

* **Prueba unitaria:** Verifica una función o componente de código de forma aislada (sin tocar bases de datos ni redes externas).
* **Prueba de integración:** Verifica que múltiples componentes funcionen juntos correctamente (por ejemplo, haciendo una petición real a una ruta del backend que a su vez interactúa con una base de datos PostgreSQL de prueba).

Con esto completamos el recorrido por los diez módulos. Estado del **Módulo 10 — READY**.

---

A continuación, presento tu informe final de preparación basado en el recorrido que hemos realizado.

# M24 Learning Readiness Report

## Concepts ready

* **Dominio y Flujos:** Separación clara entre Admin Web, Vending Web, Backend REST y la máquina física.
* **Multitenencia:** Aislamiento de datos mediante `tenant_id` extraído exclusivamente del token de autenticación verificado.
* **Autenticación y Autorización:** Diferenciación entre usuarios humanos (JWT + RBAC) y dispositivos IoT (API Keys asociadas a un `machine_id`).
* **Máquinas de Estado:** Ciclos de vida estrictos para órdenes, pagos y reservas.
* **Inventario y Concurrencia:** Control de stock físico vs reservas temporales, y resolución de condiciones de carrera mediante transacciones atómicas y bloqueos de base de datos.
* **Idempotencia:** Uso de `Idempotency-Key` para prevenir cobros duplicados por doble clic o reintentos de red.
* **Comunicación IoT:** Elección de *polling* frente a WebSockets para dispositivos en entornos de red inestables.
* **Seguridad Backend:** Uso correcto de códigos HTTP (401 vs 403) y consultas parametrizadas para evitar Inyección SQL.
* **Observabilidad:** Trazabilidad de peticiones mediante `requestId` en los logs del servidor.

## Concepts needing review

* Ninguno pendiente tras las aclaraciones de arquitectura y pruebas.

## Important misconceptions corrected

* El backend **jamás debe confiar** en un `tenant_id` enviado por el cliente en la petición HTTP; debe inyectarlo desde el token verificado por el middleware.
* La distinción precisa entre pruebas unitarias (aisladas) e integración (conectando sistemas y bases de datos).

## Decisions the student can explain

* Por qué el backend actúa como la única fuente de verdad protegiendo los contratos y estados.
* Cómo el aislamiento de tenants previene el acceso cruzado a datos de diferentes empresas operadoras.
* Por qué las transacciones y el `rollback` garantizan la consistencia ante fallos inesperados.

## Questions still open

* Ninguna duda crítica pendiente para iniciar el diseño técnico.

## Three recommended actions before implementation

1. **Diseñar el esquema relacional en PostgreSQL**, asegurando que todas las tablas del negocio incluyan la columna `tenant_id` y las restricciones de integridad necesarias.
2. **Implementar el middleware de autenticación y contexto**, configurando la extracción segura del `tenant_id` desde los tokens de sesión.
3. **Definir las rutas de la API y las máquinas de estado** para el flujo de órdenes, pagos e inventario antes de escribir código de lógica de negocio.

## Readiness by module

| Módulo | Estado |
| --- | --- |
| Módulo 1 — Dominio y flujo completo | READY |
| Módulo 2 — Multitenencia | READY |
| Módulo 3 — Autenticación, roles y permisos | READY |
| Módulo 4 — Modelado y máquinas de estado | READY |
| Módulo 5 — Inventario | READY |
| Módulo 6 — Transacciones y concurrencia | READY |
| Módulo 7 — Idempotencia y reintentos | READY |
| Módulo 8 — Pago y despacho simulados | READY |
| Módulo 9 — Seguridad | READY |
| Módulo 10 — Pruebas y producción | READY |

---

