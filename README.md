# Plataforma de Aprendizaje Blockchain - CryptoChicks

Este proyecto es parte de una iniciativa educativa en colaboración con CryptoChicks. Consiste en una plataforma gamificada para aprender conceptos de Blockchain a través de un videojuego interactivo desarrollado en Unity y un sistema de gestión web complementario.

Este repositorio contiene:

1. Funciones Lambda (backend sin servidor) que manejan la lógica de registro, inicio y cierre de sesión.
2. Una aplicación web de gestión basada en Express.js para supervisar la actividad de usuarios y sesiones.

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

- SignUp: Registro de nuevos usuarios
- UnityLogin-db: Login y control de sesión de usuario
- Logout: Cierre de sesión con fecha
- (En desarrollo) APIs para control de cuestionarios, estadísticas, etc.

## ¿Qué hace la página de gestión?

La aplicación Express (app.mjs) permite visualizar y administrar:
- Usuarios registrados
- Sesiones abiertas y cerradas
- Estado de las conexiones
- Integración con el backend Lambda y base de datos

Las vistas están escritas en EJS y se encuentran en la carpeta views/.

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
