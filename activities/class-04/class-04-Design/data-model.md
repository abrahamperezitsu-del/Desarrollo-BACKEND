# Data model — Request API v4

> Fase 1 · se completa antes de usar IA y antes de tocar código.
> El esquema expresa decisiones sobre los datos, no solo su forma: cada NOT NULL,
> DEFAULT y CHECK debe poder defenderse.

## Tabla `requests`

| Columna    | Tipo      | ¿Nulo? | Default | Restricciones                                  | ¿Quién lo genera? |
| ---------- | --------- | ------ | ------- | ---------------------------------------------- | ----------------- |
| id         | UUID      | NO     | gen_random_uuid() | PRIMARY KEY                                    | Base de datos     |
| title      | VARCHAR   | NO     | —       | —                                              | Cliente           |
| priority   | VARCHAR   | NO     | —       | CHECK (priority IN ('low', 'medium', 'high'))  | Cliente           |
| status     | VARCHAR   | NO     | 'open'  | CHECK (status IN ('open', 'in_progress', 'completed', 'canceled')) | Aplicación (service) / BD |
| created_at | TIMESTAMP | NO     | NOW()   | —                                              | Base de datos     |
| updated_at | TIMESTAMP | NO     | NOW()   | —                                              | Base de datos     |

## Tabla `request_status_history`

| Columna         | Tipo      | ¿Nulo? | Default | Restricciones                                  | Notas |
| --------------- | --------- | ------ | ------- | ---------------------------------------------- | ----- |
| id              | UUID      | NO     | gen_random_uuid() | PRIMARY KEY                                    | PK de la historia |
| request_id      | UUID      | NO     | —       | FOREIGN KEY REFERENCES requests(id)            | Relación al request |
| previous_status | VARCHAR   | SÍ     | —       | —                                              | Puede ser nulo |
| new_status      | VARCHAR   | NO     | —       | CHECK (new_status IN ('open', 'in_progress', 'completed', 'canceled')) | Estado destino |
| changed_at      | TIMESTAMP | NO     | NOW()   | —                                              | Cuándo ocurrió |

_(¿Por qué `previous_status` admite NULL? Escribe la razón del dominio.)_
Porque la inserción inicial (cuando nace la solicitud con estado `open`) representa el inicio del ciclo de vida del recurso; no existe un estado anterior del cual transicionar.

## Relaciones

* `request_id` en `request_status_history` establece una relación de **1 a muchos (1 → *)** con `requests`.
* Prohíbe: Eliminar un `request` de la base de datos si tiene un historial asociado (restricción RESTRICT de la FK), lo cual obliga a utilizar un borrado lógico o de cancelación (Decisión 001).

## Reglas protegidas por la base

* **NOT NULL**: Obliga a que los recursos tengan título y prioridad (integridad de datos).
* **CHECK (priority y status)**: Asegura que ni un error en el código ni una inserción manual puedan introducir estados basuras en el dominio.
* **FOREIGN KEY**: Protege la integridad referencial; es imposible que un historial quede "huérfano" apuntando a un request que no existe.

## Reglas que sigue protegiendo la aplicación

* **Transiciones válidas**: La BD sabe qué estados existen, pero la aplicación (Dominio) sabe que no puedes pasar de `open` a `completed` sin pasar por `in_progress`.
* **Estados terminales**: La BD permitiría hacer UPDATE a un recurso `canceled`, pero el Service debe bloquear la mutación de recursos terminales.
* **updatedAt**: La BD puede poner la fecha de nacimiento, pero es el repositorio/store de la aplicación quien inyecta el `NOW()` en la cláusula UPDATE.

## Dudas

* ¿Debe la cancelación (`canceled`) exigir un motivo obligatorio que justifique la acción? Por ahora no está en el modelo.