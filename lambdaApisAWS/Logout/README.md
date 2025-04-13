# Logout - Cierre de sesión

Esta función Lambda actualiza el campo `fecha_salida` en la tabla `RegistroSesion` para indicar que el usuario cerró su sesión.

## Entrada esperada (JSON)

```json
{
  "mensaje": "Registrar salida",
  "id_sesion": 123
}
```

## Respuesta esperada (HTTP 200)

```json
{
  "mensaje": "Salida registrada"
}
```

## Validaciones

- Solo actualiza si existe un `id_sesion` con `fecha_salida IS NULL`.
- Si el `id_sesion` no existe, responde:

```json
{
  "mensaje": "Sesión no encontrada"
}
```
