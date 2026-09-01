# Una URL, una decision

Un solo servidor que responde **distinto** segun la URL que le pidan. Sigue sin usar
librerias externas: solo Node y el modulo `http`.

> El `package.json` de la carpeta solo contiene `"type": "commonjs"` para que Node acepte
> `require(...)`. No declara dependencias: no hay que instalar nada.

## Como ejecutarlo

```bash
cd routing-server
node server.js
```

En la terminal debe aparecer:

```
Server listening on http://localhost:3000
```

El proceso se queda vivo a proposito. Para detenerlo: `Ctrl + C`.

> Antes de arrancar, asegurate de que no quedo ningun otro servidor corriendo en el
> puerto 3000. Si ves `EADDRINUSE`, hay otro proceso ocupando el puerto.

## Las 4 rutas

| Ruta | Para que sirve |
| --- | --- |
| `/` | Portada. Dice quien es el servidor y que rutas existen. |
| `/health` | Chequeo de salud. Responde `OK` si el servidor esta vivo. Lo usan los sistemas de monitoreo. |
| `/api/info` | Datos del servicio en formato JSON: nombre, version y lista de rutas. |
| cualquier otra | No existe. Responde `404 Not found`. |

La decision la toma un `if` que compara `request.url`. No hay magia: es un `if` por ruta,
y un `return` despues de cada respuesta para que la ejecucion no siga cayendo a los
siguientes `if`.

## Casos de prueba esperados

Prueba cada fila en el navegador (o con `curl`). Si alguna no coincide, hay algo mal.

| Ruta probada | Status | Content-Type | Cuerpo de la respuesta |
| --- | --- | --- | --- |
| `/` | `200` | `text/plain; charset=utf-8` | `Support server. Available routes: /health, /api/info` |
| `/health` | `200` | `text/plain; charset=utf-8` | `OK` |
| `/api/info` | `200` | `application/json; charset=utf-8` | `{"name":"support-server","version":"1.0.0","routes":["/","/health","/api/info"]}` |
| `/nada` | `404` | `text/plain; charset=utf-8` | `Not found` |
| `/health/` | `404` | `text/plain; charset=utf-8` | `Not found` |
| `/HEALTH` | `404` | `text/plain; charset=utf-8` | `Not found` |

Las dos ultimas filas no son un error del servidor: la comparacion `===` es exacta.
`/health/` con barra final y `/HEALTH` en mayusculas son cadenas distintas de `'/health'`.

## Como ver el status y el Content-Type

**En el navegador:** abre las herramientas de desarrollo (F12), pestania **Network**,
recarga la pagina y haz clic sobre la peticion. Ahi ves `Status Code` y los
`Response Headers`.

**Con curl**, si lo tienes disponible:

```bash
curl -i http://localhost:3000/health
```

La opcion `-i` incluye los encabezados en la salida.

## Lo que hay que observar

- La terminal imprime una linea por cada peticion: `GET /`, `GET /health`, `GET /api/info`.
- Una ruta inexistente **tambien** llega al servidor y **tambien** se imprime. El 404 no es
  silencio: es una respuesta con un codigo que dice "no encontre eso".
- `/api/info` se ve distinto en el navegador porque el `Content-Type` dice `application/json`.
  El mismo texto con `text/plain` se mostraria como texto crudo. El encabezado cambia como
  el cliente interpreta el cuerpo.
