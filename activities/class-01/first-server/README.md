# Primer servidor con Node.js

Este proyecto no usa librerias externas. No hay `npm install`. Solo Node y el modulo `http`
que viene incluido con Node.

> El archivo `package.json` de esta carpeta tiene una sola linea de configuracion
> (`"type": "commonjs"`) que le indica a Node que use `require(...)`. No declara ninguna
> dependencia y no hay que instalar nada. Puedes ignorarlo por ahora.

## 1. Comprobar que Node esta instalado

Abre una terminal y escribe:

```bash
node --version
```

Deberias ver algo como `v22.22.2` (cualquier version 18 o superior sirve).

Si en cambio ves `command not found` o `no se reconoce como un comando`, Node no esta
instalado o no esta en el PATH. Instalalo desde https://nodejs.org y vuelve a abrir la
terminal.

## 2. Ubicarte en la carpeta del proyecto

```bash
cd first-server
```

Comprueba que `server.js` esta ahi:

```bash
ls        # macOS / Linux
dir       # Windows
```

## 3. Ejecutar el servidor

```bash
node server.js
```

## 4. Que deberias ver en la terminal

```
Server listening on http://localhost:3000
```

Y el cursor se queda ahi, sin devolverte el prompt. **Eso es correcto.** No esta trabado.

## 5. Abrir el navegador

Ve a http://localhost:3000

El navegador debe mostrar el texto:

```
Hello from the server
```

Vuelve a mirar la terminal. Ahora aparecen lineas nuevas, una por cada peticion que llego:

```
GET /
GET /favicon.ico
```

La segunda linea la pide el navegador solo, para buscar el iconito de la pestania. Es normal.

Cada vez que recargues la pagina (F5) aparecera una linea mas. La terminal es tu ventana
para ver el trafico que recibe el servidor.

## 6. Por que el proceso se queda vivo

Cuando ejecutas `node archivo.js` con un script normal, Node corre el archivo y termina.

Aqui no termina, y es a proposito. `server.listen(PORT, ...)` le dice a Node:
"quedate escuchando en el puerto 3000". Node mantiene el proceso vivo porque hay una tarea
pendiente: esperar conexiones. Un servidor que se apaga apenas arranca no le sirve a nadie.

Mientras el proceso este vivo, esa terminal esta ocupada. Si necesitas escribir otros
comandos, abre una segunda terminal.

## 7. Como detenerlo

En la terminal donde corre el servidor, presiona:

```
Ctrl + C
```

(en Mac tambien es `Ctrl + C`, no `Cmd + C`)

Vuelve a aparecer el prompt. Si ahora recargas http://localhost:3000 el navegador dira que
no puede conectarse: ya no hay nadie escuchando.

## Construccion paso a paso: carpeta `steps/`

`server.js` es la version final. La carpeta `steps/` muestra como se llego a ella. Cada
archivo se ejecuta igual (`node steps/step-1.js`) y cada uno agrega una sola idea:

| Archivo | Que agrega | Que observas |
| --- | --- | --- |
| `steps/step-1.js` | Crear el servidor, responder un texto y escuchar en el puerto 3000 | El navegador muestra `Hello from the server`. La terminal solo imprime el mensaje de arranque. |
| `steps/step-2.js` | `console.log` del metodo y la URL dentro del handler | La terminal ahora imprime `GET /` cada vez que llega una peticion. |
| `steps/step-3.js` | `statusCode` y `Content-Type` explicitos | La respuesta declara que es texto plano en UTF-8. Se ve en la pestania Network del navegador. |

La unica diferencia entre `steps/step-3.js` y `server.js` es que la version final guarda el
puerto en una constante `PORT` en vez de repetir el numero `3000`.

**Recuerda:** detén un servidor con `Ctrl + C` antes de arrancar otro. Dos procesos no pueden
escuchar el mismo puerto al mismo tiempo; el segundo fallara con `EADDRINUSE`.

## Errores frecuentes

| Mensaje | Que significa | Que hacer |
| --- | --- | --- |
| `Cannot find module '.../server.js'` | Estas en otra carpeta | `cd` a la carpeta correcta y revisa con `ls` / `dir` |
| `EADDRINUSE: address already in use :::3000` | Ya hay un servidor en el 3000 | `Ctrl + C` en la otra terminal, o cambia el puerto |
| El navegador dice "no se puede conectar" | El servidor no esta corriendo | Vuelve a la terminal y ejecuta `node server.js` |
