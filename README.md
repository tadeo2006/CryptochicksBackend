# Plataforma de Aprendizaje Blockchain - CryptoChicks

Este proyecto forma parte de una iniciativa educativa en colaboración con CryptoChicks, cuyo objetivo es crear un entorno interactivo para enseñar conceptos de Blockchain a través de un videojuego educativo.

El repositorio actual contiene la parte web y las APIs que sirven como backend para una aplicación desarrollada en Unity.

## Descripción General

El sistema está dividido en dos componentes principales:

- Juego educativo en Unity: interfaz donde los usuarios interactúan con lecciones, responden cuestionarios, y avanzan en su aprendizaje.
- Backend (este repositorio): proporciona las APIs necesarias para gestionar usuarios, sesiones y cuestionarios, alojadas en AWS Lambda y conectadas a una base de datos MySQL.

## Tecnologías utilizadas

- Unity (Game Engine) - desarrollo del videojuego educativo
- Node.js (v18.x) - backend en JavaScript moderno
- Express (en entorno local de pruebas)
- AWS Lambda - despliegue de funciones serverless
- MySQL - almacenamiento de usuarios, sesiones y cuestionarios
- Postman - pruebas y documentación de endpoints
- Cloud9 (opcional) - entorno de desarrollo en la nube

## Funciones disponibles en este repositorio

- SignUp: Registro de nuevos usuarios
- UnityLogin-db: Autenticación de usuario y creación de sesión
- Logout: Cierre de sesión
- (En construcción) APIs para cuestionarios, estadísticas y seguimiento

## Estructura del repositorio

```
/
├── SignUp/               # Función Lambda para registrar usuarios
├── UnityLogin-db/        # Función Lambda para login y gestión de sesiones
├── Logout/               # Función Lambda para cerrar sesiones
├── public/               # Sitio web básico en Express (opcional)
├── README.md             # Este archivo
└── ...                   # Otros archivos de configuración y pruebas
```

## Cómo probar las APIs

Puedes probar las APIs usando Postman o desde Unity mediante UnityWebRequest. Cada endpoint acepta peticiones POST en formato JSON. Las URLs se generan automáticamente al habilitar URL públicas en AWS Lambda.

Ejemplo de estructura de petición:

```
POST https://<lambda-url>.lambda-url.us-east-1.on.aws/
Content-Type: application/json
```

## Créditos

Desarrollado por:  
Proyecto para CryptoChicks con fines educativos  
Tecnológico de Monterrey - TC2005B
