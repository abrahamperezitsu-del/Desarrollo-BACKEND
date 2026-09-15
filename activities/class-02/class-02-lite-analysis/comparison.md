Versión Recibida - Versión Corregida

1. Registro de Resultados: Antes y Después

 Endpoint de Listado
* **Antes (`GET /getRequests`):** 
  * Resultado: Retornaba la lista correctamente, pero la ruta violaba las convenciones REST al incluir el verbo `get`.
* **Después (`GET /requests`):** 
  * Resultado: Retorna la misma lista de recursos, alineándose estrictamente con el uso de sustantivos en plural para colecciones.

 Endpoint de Detalle por ID
* **Antes (`GET /requests/:id` - ID inexistente):** 
  * Resultado: HTTP Status `200 OK` con un cuerpo JSON `{ error: 'Request not found' }`. El cliente recibía una señal de "éxito" a pesar de que el recurso no existía.
* **Después (`GET /requests/:id` - ID inexistente):** 
  * Resultado: HTTP Status `404 Not Found` acompañado de un cuerpo descriptivo de error. La semántica HTTP y la respuesta coinciden.

 Endpoint de Creación
* **Antes (`POST /requests`):** 
  * Resultado: HTTP Status `200 OK` junto con el objeto recién creado. 
* **Después (`POST /requests`):** 
  * Resultado: HTTP Status `201 Created` junto con el objeto creado. Informa claramente al cliente que la operación de creación de un recurso se completó satisfactoriamente.

    2. Explicación de los Cambios Realizados
1. **Renombrado de ruta de listado:** Se cambió `/getRequests` a `/requests` para separar la responsabilidad de la acción (que recae exclusivamente sobre el método HTTP `GET`) de la identificación del recurso.
2. **Corrección de códigos de estado en errores:** Se reemplazó el `res.json({ error: ... })` plano por `res.status(404).json({ error: ... })` en la búsqueda por ID. Esto permite que cualquier cliente o framework frontend detecte el fallo mediante el código de estado HTTP estándar.
3. **Optimización del código de creación:** Se actualizó `res.status(200).json(newRequest)` a `res.status(201).json(newRequest)` para cumplir con la especificación de diseño de APIs RESTful.