# Plataforma de Aprendizaje Blockchain - CryptoChicks

Este proyecto es parte de una iniciativa educativa en colaboración con CryptoChicks. Consiste en una plataforma gamificada para aprender conceptos de Blockchain a través de un videojuego interactivo desarrollado en Unity y un sistema de gestión web complementario.

## Estructura del Repositorio

```
CRYPTOCHICKSWEB/
├── lambdaApisAWS/          # Funciones Lambda desplegadas en AWS
│   ├── Logout/
│   ├── SignUp/
│   ├── UnityLogin-db/
│   └── README.md
├── public/                 # Archivos públicos (CSS, JS, imágenes)
├── views/                  # Vistas EJS utilizadas por Express
│   └── home.ejs
├── app.mjs                 # Servidor Express principal
├── package.json            # Dependencias del proyecto
├── package-lock.json
└── README.md               # Este archivo
```

## Tecnologías Utilizadas

- Unity (frontend del videojuego educativo)
- Node.js + Express (web backend)
- EJS (plantillas HTML dinámicas)
- AWS Lambda (backend serverless)
- MySQL (gestión de datos de usuarios y sesiones)
- Postman (pruebas de API)
- Cloud9 o entorno local para desarrollo

## Funciones Backend Disponibles

- **SignUp**: Registro de nuevos usuarios
- **UnityLogin-db**: Login y control de sesión de usuario
- **Logout**: Cierre de sesión con fecha
- (En desarrollo) APIs para control de cuestionarios, estadísticas, etc.

## ¿Qué hace la página de gestión?

La aplicación Express (`app.mjs`) permite visualizar y administrar:
- Usuarios registrados
- Sesiones abiertas y cerradas
- Estado de las conexiones
- Integración con el backend Lambda y base de datos

Las vistas están escritas en EJS y se encuentran en la carpeta `views/`.

## Instalación

Clona este repositorio:
   ```bash
   git clone https://github.com/tadeo2006/CryptochicksBackend.git
   cd cryptoChicksWEB
   ```



## Ejecución

1. Asegúrate de que tu base de datos MySQL esté corriendo y configurada correctamente.
2. Inicia el servidor:
   ```bash
   node app.mjs
   ```
3. Accede a la aplicación en tu navegador en [http://localhost:8080](http://localhost:8080).

## Pruebas

### Pruebas Manuales

1. **Página de Inicio**: Navega a [http://localhost:8080](http://localhost:8080) para ver la página principal.
2. **Registro**: Ve a [http://localhost:8080/signup](http://localhost:8080/signup) y registra un nuevo usuario.
3. **Inicio de Sesión**: Ve a [http://localhost:8080/login](http://localhost:8080/login) e inicia sesión con un usuario registrado.
4. **Dashboard**: Si inicias sesión como administrador, serás redirigido al dashboard en [http://localhost:8080/dashboard](http://localhost:8080/dashboard).
5. **Juego**: Si inicias sesión como usuario, serás redirigido al juego en [http://localhost:8080/game](http://localhost:8080/game).

### Pruebas con Postman

1. Importa las APIs desde el archivo `lambdaApisAWS/README.md`.
2. Prueba las rutas de las funciones Lambda:
   - **SignUp**: Enviar un POST a la URL de la función con los datos del usuario.
   - **UnityLogin-db**: Enviar un POST con las credenciales de inicio de sesión.
   - **Logout**: Enviar un POST para cerrar sesión.

## Uso de las APIs

Todas las APIs reciben datos vía POST en formato JSON, y están desplegadas en AWS Lambda. Pueden ser invocadas desde Unity (mediante UnityWebRequest) o desde herramientas como Postman.

Ejemplo de estructura:

```
POST https://<tu-api>.lambda-url.us-east-1.on.aws/
Content-Type: application/json
```

## Autores

Desarrollado por:  
Proyecto educativo con CryptoChicks  
Tecnológico de Monterrey - TC2005B
