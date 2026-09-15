# Evidencia de Verificación Manual (cURL)

## Caso 1: Obtener todas las solicitudes
* **Comando:** `curl -X GET http://localhost:3000/requests`
* **Resultado observado:** Retornó código HTTP 200 y el arreglo inicial completo cargado desde `requests.js`.

## Caso 2: Error 400 al crear una solicitud sin título
* **Comando:** `curl -X POST http://localhost:3000/requests -H "Content-Type: application/json" -d '{"description":"El aire acondicionado gotea"}'`
* **Resultado observado:** Retornó código HTTP 400 Bad Request y el cuerpo `{"error":"Title is required"}`. No se guardó en memoria.

## Caso 3: Creación exitosa (201)
* **Comando:** `curl -X POST http://localhost:3000/requests -H "Content-Type: application/json" -d '{"title":"Falla AC","description":"Gotea"}'`
* **Resultado observado:** Retornó código HTTP 201 Created y el cuerpo: `{"id": 4, "title": "Falla AC", "description": "Gotea", "status": "open"}`.

## Caso 4: Búsqueda por ID exitosa (200)
* **Comando:** `curl -X GET http://localhost:3000/requests/4`
* **Resultado observado:** Retornó código HTTP 200 OK y el cuerpo JSON con los datos de la solicitud de "Falla AC".

## Caso 5: Búsqueda por ID inexistente (404)
* **Comando:** `curl -X GET http://localhost:3000/requests/999`
* **Resultado observado:** Retornó código HTTP 404 Not Found y el cuerpo `{"error":"Request not found"}`.

## Caso 6: Filtrar por query string (`?status=open`)
* **Comando:** `curl -X GET http://localhost:3000/requests?status=open`
* **Resultado observado:** Retornó código HTTP 200 OK. El arreglo JSON de respuesta omitió las solicitudes con status `in-progress` o `closed`, mostrando únicamente las `open`.