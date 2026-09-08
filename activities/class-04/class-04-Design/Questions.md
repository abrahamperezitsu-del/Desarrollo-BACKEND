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