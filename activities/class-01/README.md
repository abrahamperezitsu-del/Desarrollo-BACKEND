Desarrollo de las actividades correspondientes a la clase-01:

1- Cree un archivo .js con el nombre server en el cual copie y pegue los primeros dos codigos de la clase, note el comportamiento normal esperado del mismo, viendo en evidencia como se levanta el servidor, su conexion al puerto y la respuesta del navegador entregando el texto

2- Descargue el primer .zip (first server), lei todas las diapositivas respecto a las URL, modificando el archivo principal con los codigos de /api/info, /health, el 404 cuando se busca una URL inexistente, lo que mas puedo destacar de esta parte fue que el /health al principio me daba siempre 404, hasta que cree su if correspondiente, copiando el primer codigo solo cambiando el texto por un The status is "ok"

3-Descargue el segundo archivo .zip (routing server), lo inspeccione mientras leia las diapositivas correspondientes, nada que destacar en este paso 

4-Revision de los servidores dañados:

1. Se observa como el navegador se queda cargando indefinidamente, lo primero que noto es que falta el response.end, reviso los anteriores servidores que si funcionan detectanto el patron, la causa es la falta del response.end por lo que añado este mismo codigo faltante teniendo como resultado que la navegador deje de cargar indefinidamente obteniendo acceso a la URL

2. El servidor arroja un 404 en la URL /health, rapidamente noto que el problema esta en la ortografia de la palabra ya que esta escrito "/helth" en lugar de "/health", compruebo que el codigo en si este bien buscando /helth y al comprobar que de esa forma si accede al la ruta y lo unico que hice fue cambiar la ortografia de la palabra por la correcta solucionando asi el error

3. El navegador queda cargando indefinidamente, veo el puerto notando que esta en el 3001 en vez del 3000, corroboro esto buscando http://localhost:3001 en donde si carga mi servidor, lo soluciono cambiando el puerto 3001 por el 3000 arreglando el problema 

4. Despues de un rato revisando el codigo vi el error en el response.end porque estás indicando al navegador mediante el header que el contenido es application/json, el string enviado no es un JSON válido. Lo que hice fue copiar y pegar un response.end de un de los servidores ya arreglados, esto soluciono el problema de inmediato

5. Todas las rutas llevaban a la ruta principal (http://localhost:3000), revisando el codigo detecto que el primer if request.url tiene un solo igual "=" en vez de los tres que deberian ser, lo modifico colocando los tres que deben ser y reinicio el servidor, solicionando el problema de las rutas 

6. El servidor no arranca desde la terminal, leo que el error se encuentra el la linea 40 "server.listen(SERVER_PORT, () => {" por lo que me dirijo a revisar esa parte del codigo, noto la difencia con los demas, la parte de SERVER_PORT esta mal, debria ser solo PORT pero de todas formas intento dos soluciones, la primera fue solo corregir el SERVER_PORT por solamente PORT, esta solucion es efectiva y hace que el servidor levante con normalidad, la segunda fue modificar el "const PORT = 3000;" de la linea 5 colocando en su lugar "const SERVER_PORT = 3000;" esto no soluciono el error, que decia lo mismo por lo que opte por la primera opcionSSSSS

5- Ocho momentos ordenados:

1. El usuario introduce una URL
2. El navegador crea una petición
3. La petición se dirige a un puerto
4. El proceso de Node.js recibe la petición
5. El programa inspecciona la URL
6. El programa decide qué respuesta producir
7. El servidor completa la respuesta
8. El navegador recibe y presenta el resultado

6- Cinco preguntas, respuesta breves

¿Qué diferencia esencial existe entre frontend y backend?
R= El front es lo que se muetra al usuario, el back es toda la maquinaria y logica de negocio que hay detras 

¿Por qué el proceso de Node.js continúa activo después de ejecutar el archivo?
R= Porque este queda "escuchando" el proceso no termina, si no que el servidor queda esperando solicitudes 

Si el navegador queda esperando indefinidamente, ¿qué revisarías primero?
R= Revisaria primero los puertos y luego los response.end

Describe con tus propias palabras el recorrido de una petición.
R= El navegador mannda una peticion, que se dirige a un puerto, el .js la recibe, inspecciona la url decide y completa la respuesta 

¿Qué evidencia usarías para saber si el problema está en el navegador o en el servidor?
R= Revisaria que el server arranque y su codigo, luego en el navegador con la consola de desarrollador s