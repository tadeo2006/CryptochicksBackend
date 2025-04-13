# SignUp - Registro de Usuarios

Esta función Lambda permite registrar nuevos usuarios en la base de datos `Usuario`.

## Método: POST

### Entrada esperada (JSON)

```json
{
  "first_name": "Juan",
  "last_name": "Pérez",
  "email": "juan@email.com",
  "password_hash": "claveSegura123",
  "fecha_nacimiento": "2000-05-10"
}
```

Nota: `fecha_nacimiento` debe estar en formato `YYYY-MM-DD`.

### Respuesta (HTTP 200)

```json
{
  "mensaje": "Registro exitoso",
  "idUsuario": 58
}
```

### Casos de error

Si el correo ya está registrado:

```json
{
  "mensaje": "El correo ya está registrado"
}
```

Código de estado: 409 Conflict

## Base de Datos

### Tabla `Usuario`

- id_usuario (INT, AUTO_INCREMENT, PRIMARY KEY)
- first_name (VARCHAR)
- last_name (VARCHAR)
- email (VARCHAR, UNIQUE)
- password_hash (VARCHAR)
- fecha_nacimiento (DATE)
