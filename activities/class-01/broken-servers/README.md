# Laboratorio de fallas

Seis servidores rotos. Cada uno es un archivo independiente y completo: no dependen entre si
y no necesitan `npm install`. Todos son variantes del servidor de rutas que ya conoces
(`/`, `/health`, `/api/info`, y 404 para el resto).

> El `package.json` de la carpeta solo contiene `"type": "commonjs"` para que Node acepte
> `require(...)`. No declara dependencias y **no es parte de ninguna de las fallas**.

Cada archivo tiene **una sola falla**. Arriba del todo hay un comentario que dice **el sintoma**
que vas a observar, nunca la causa. Encontrar la causa es tu trabajo.

## Como ejecutar cada uno

```bash
cd broken-servers
node fault-1.js
```

Y asi con `fault-2.js`, `fault-3.js`, ... hasta `fault-6.js`.

**Regla de oro: un servidor a la vez.** Antes de arrancar el siguiente, detén el actual con
`Ctrl + C`. Si arrancas dos en el mismo puerto, el segundo falla con `EADDRINUSE` y vas a
estar depurando un problema que tú mismo creaste.

Para probar, abre en el navegador:

- http://localhost:3000/
- http://localhost:3000/health
- http://localhost:3000/api/info
- http://localhost:3000/ruta-que-no-existe

Con la pestania **Network** (F12) abierta puedes ver el status y el `Content-Type` de cada
respuesta. Si tienes `curl`, `curl -i http://localhost:3000/health` te muestra lo mismo en
la terminal.

## Que hay en cada archivo

| Archivo | Sintoma declarado |
| --- | --- |
| `fault-1.js` | El navegador se queda esperando para siempre en `/health`. |
| `fault-2.js` | `/health` responde `404 Not found`. |
| `fault-3.js` | El navegador no puede conectarse a http://localhost:3000. |
| `fault-4.js` | La respuesta dice que es JSON pero el consumidor no logra interpretarla. |
| `fault-5.js` | Todas las rutas devuelven la misma respuesta. |
| `fault-6.js` | El servidor no arranca; el proceso termina de inmediato. |

## Protocolo de diagnostico

No adivines. No cambies lineas al azar hasta que "funcione". Sigue estos seis pasos **en orden**
y escribe cada uno antes de pasar al siguiente.

### 1. Comportamiento observado

Describe **solo lo que ves**, sin interpretar. Nada de "no funciona".

> Mal: "el health esta roto".
> Bien: "http://localhost:3000/health deja la pestania cargando indefinidamente; `/` responde
> normal; la terminal imprime `GET /health` y no muestra ningun error".

### 2. Hipotesis

Una explicacion posible, expresada de forma que se pueda comprobar.

> "Si la terminal registra la peticion pero la respuesta nunca llega, entonces el codigo entra
> al bloque de `/health` pero no cierra la respuesta."

### 3. Evidencia

Que observacion confirma o descarta la hipotesis. Aqui es donde miras de verdad.

Herramientas: los `console.log` que ya trae el servidor, `console.log` extra que agregues tu,
la pestania Network, el mensaje de error completo en la terminal.

> "La terminal imprime `GET /health`, asi que la peticion si llega y si entra al handler.
> Comparando el bloque de `/health` con el de `/`, al de `/health` le falta la llamada que
> envia la respuesta."

### 4. Causa

La linea exacta y por que produce el sintoma. No "estaba mal escrito": **que** estaba mal y
**que efecto** tiene.

### 5. Correccion

El cambio minimo que arregla la causa. Un archivo, una falla, un cambio. Si necesitas tocar
cinco lineas, probablemente todavia no entendiste la causa.

### 6. Resultado

Vuelve a ejecutar y comprueba **las cuatro rutas**, no solo la que estaba rota. Una correccion
que arregla `/health` pero rompe `/api/info` no es una correccion.

Estado correcto de referencia:

| Ruta | Status | Content-Type | Cuerpo |
| --- | --- | --- | --- |
| `/` | `200` | `text/plain; charset=utf-8` | `Support server. Available routes: /health, /api/info` |
| `/health` | `200` | `text/plain; charset=utf-8` | `OK` |
| `/api/info` | `200` | `application/json; charset=utf-8` | JSON valido con `name`, `version` y `routes` |
| `/loquesea` | `404` | `text/plain; charset=utf-8` | `Not found` |

## Por que hacemos esto

En produccion nadie te va a decir cual es el error. Solo vas a tener un sintoma: un usuario que
se queja, una pantalla en blanco, una alerta. Todo lo demas lo tienes que deducir de la
evidencia. Este laboratorio entrena exactamente esa parte.
