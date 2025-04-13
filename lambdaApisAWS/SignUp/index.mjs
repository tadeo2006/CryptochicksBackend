import mysql from 'mysql2/promise';

let connection;

export const handler = async (event) => {
  // Solo aceptar método POST
  if (event.requestContext.http.method !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ mensaje: 'Método no permitido' }),
    };
  }

  try {
    const {
      first_name,
      last_name,
      email,
      password_hash,
      fecha_nacimiento
    } = JSON.parse(event.body);

    // Conexión persistente
    if (!connection) {
      connection = await mysql.createConnection({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: 'dbCryptoChiksGame'
      });
      console.log('Conectado a la base de datos');
    }

    // Verifica si el email ya existe
    const [existing] = await connection.execute(
      'SELECT id_usuario FROM Usuario WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      return {
        statusCode: 409, // Conflicto
        body: JSON.stringify({ mensaje: 'El correo ya está registrado' }),
      };
    }

    // Insertar nuevo usuario
    const [result] = await connection.execute(
      `INSERT INTO Usuario (first_name, last_name, email, password_hash, fecha_nacimiento)
       VALUES (?, ?, ?, ?, ?)`,
      [first_name, last_name, email, password_hash, fecha_nacimiento]
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        mensaje: 'Registro exitoso',
        idUsuario: result.insertId
      }),
    };
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ mensaje: 'Error en el servidor' }),
    };
  }
};
