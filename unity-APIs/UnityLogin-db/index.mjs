import mysql from 'mysql2/promise';

let connection;

export const handler = async (event) => {
  if (event.requestContext.http.method !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ mensaje: 'Método no permitido' }),
    };
  }

  try {
    const { email, password } = JSON.parse(event.body);

    if (!connection) {
      connection = await mysql.createConnection({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: 'dbCryptoChiksGame'
      });
      console.log('Conexión establecida con la base de datos');
    }

    // 🛡️ Paso 1: Buscar en la tabla Administrador
    const [adminRows] = await connection.execute(
      'SELECT * FROM Administrador WHERE email = ? AND password_hash = ?',
      [email, password]
    );

    if (adminRows.length > 0) {
      // Si es admin, no hay sesión que registrar, solo devolver respuesta especial
      return {
        statusCode: 200,
        body: JSON.stringify({
          mensaje: 'Login exitoso (admin)',
          es_admin: true
        }),
      };
    }

    // ‍ Paso 2: Buscar en la tabla Usuario
    const [rows] = await connection.execute(
      'SELECT * FROM Usuario WHERE email = ? AND password_hash = ?',
      [email, password]
    );

    if (rows.length > 0) {
      const idusuario = rows[0].id_usuario;

      // Buscar si ya tiene una sesión activa
      const [sesionRows] = await connection.execute(
        `SELECT id_sesion
         FROM RegistroSesion
         WHERE id_usuario = ? AND fecha_salida IS NULL
         ORDER BY fecha_entrada DESC
         LIMIT 1`,
        [idusuario]
      );

      let id_sesion;

      if (sesionRows.length > 0) {
        id_sesion = sesionRows[0].id_sesion;
        console.log(`Sesión ya abierta con id_sesion: ${id_sesion}`);
      } else {
        const [insertResult] = await connection.execute(
          'INSERT INTO RegistroSesion (id_usuario) VALUES (?)',
          [idusuario]
        );
        id_sesion = insertResult.insertId;
        console.log(`Nueva sesión creada con id_sesion: ${id_sesion}`);
      }

      return {
        statusCode: 200,
        body: JSON.stringify({
          mensaje: 'Login exitoso',
          idusuario: idusuario,
          id_sesion: id_sesion
        }),
      };
    }

    //  Si no se encontró ni como admin ni como usuario
    return {
      statusCode: 401,
      body: JSON.stringify({ mensaje: 'Login fallido' }),
    };

  } catch (error) {
    console.error('Error en el login:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ mensaje: 'Error en el servidor' }),
    };
  }
};
