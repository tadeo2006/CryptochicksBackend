# UnityLogin-db - Inicio de sesión y registro de sesión

Esta función Lambda autentica a un usuario y registra una nueva sesión en la tabla `RegistroSesion`.

## Método: POST

### Entrada esperada (JSON)

```json
{
  "email": "juan@email.com",
  "password": "claveSegura123"
}
```

### Respuesta exitosa (HTTP 200)

```json
{
  "mensaje": "Login exitoso",
  "idusuario": 58,
  "id_sesion": 123
}
```

### Casos de error

Credenciales incorrectas:

```json
{
  "mensaje": "Login fallido"
}
```

Código de estado: 401 Unauthorized

## Base de Datos

### Tabla `RegistroSesion`

- id_sesion (INT, AUTO_INCREMENT, PRIMARY KEY)
- id_usuario (INT, FOREIGN KEY → Usuario)
- fecha_entrada (DATETIME, DEFAULT CURRENT_TIMESTAMP)
- fecha_salida (DATETIME, puede ser NULL)
