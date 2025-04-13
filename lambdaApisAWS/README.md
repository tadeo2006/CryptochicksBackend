# LambdaApisAWS - APIs para Unity en AWS Lambda

Este repositorio contiene funciones Lambda que permiten gestionar el inicio de sesión, cierre de sesión y registro de usuarios para una aplicación Unity conectada a MySQL.

## Funciones disponibles

- **SignUp**: Registro de nuevos usuarios.
- **UnityLogin-db**: Autenticación de usuarios y creación de sesión.
- **Logout**: Cierre de sesión (actualiza `fecha_salida`).

---

## ¿Cómo subir tus APIs a AWS Lambda?

### 1. Configurar entorno

Asegúrate de tener lo siguiente:
- Cuenta de AWS 
- Permisos para crear funciones Lambda 
- Rol IAM con permisos de Lambda y acceso a Secrets Manager o RDS (si aplica) 
- Node.js 18.x o superior (se recomienda usar Node.js 18.x en Lambda)

---

### 2. Crear una función Lambda

Desde la consola de AWS:

1. Ve a **Lambda > Crear función**.
2. Tipo: *"Desde cero"*
3. Nombre: por ejemplo, `UnityLogin-db`
4. Tiempo de ejecución: `Node.js 18.x`
5. Arquitectura: `arm64` o `x86_64`
6. Rol de ejecución: *Usar un rol existente* → elige tu rol (`LabRole`, por ejemplo)
7. En **Configuraciones avanzadas**:
   -  Habilitar URL de función
   - Tipo de autorización: `NONE`

---

### 3. Subir el código de la API

1. En tu carpeta del proyecto (`SignUp/`, `Logout/`, etc.), asegúrate de que el archivo principal se llame `index.js` o el mismo nombre que pongas en el campo *handler*.
2. Comprime la carpeta como `.zip` (por ejemplo: `SignUp.zip`)
3. En la consola Lambda, selecciona tu función → **Cargar desde .zip**
4. Cambia el nombre del handler a:
