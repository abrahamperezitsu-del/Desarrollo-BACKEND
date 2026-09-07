## Interacción: Generación del Contrato y Router
* **Qué se le pidió a la IA:** Redactar el contrato HTTP formal e implementar la lógica de las rutas en `requests.routes.js`, basándose en las exclusiones estrictas de la especificación (sin bases de datos, con persistencia en memoria, manteniendo la lógica en el router y usando módulos ES).
* **Cuándo:** Durante la fase de desarrollo e implementación del requerimiento.
* **Qué se aceptó / descartó:**
  * *Aceptado:* La lógica de los endpoints utilizando `req.query` para el filtro de `status` y `req.params` para el `id`. La asignación correcta de los códigos de estado `200`, `201`, `400` y `404`.
  * *Descartado proactivamente:* Cualquier intento automático de separar la lógica en un archivo de "controladores" (ej. `requests.controller.js`). Se forzó a la IA a mantener toda la lógica de validación y de respuesta dentro de las funciones callbacks de `router.get` y `router.post` para cumplir con las directrices del proyecto.