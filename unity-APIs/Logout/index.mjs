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
    // Parsear el cuerpo del request
    const { mensaje, id_sesion } = JSON.parse(event.body);

    // Conectar a la base de datos solo una vez
    if (!connection) {
      connection = await mysql.createConnection({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: 'dbCryptoChiksGame'
      });
      console.log('Conexión establecida con la base de datos');
    }

    // Actualizar la fecha_salida con la hora actual
    const [result] = await connection.execute(
      'UPDATE RegistroSesion SET fecha_salida = CURRENT_TIMESTAMP WHERE id_sesion = ?',
      [id_sesion]
    );

    if (result.affectedRows > 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({ mensaje: 'Salida registrada' }),
      };
    } else {
      return {
        statusCode: 404,
        body: JSON.stringify({ mensaje: 'Sesión no encontrada' }),
      };
    }

  } catch (error) {
    console.error('Error al registrar salida:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ mensaje: 'Error en el servidor' }),
    };
  }
};

