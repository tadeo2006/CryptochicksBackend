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
    const { id_usuario, id_curso, id_leccion } = JSON.parse(event.body);

    if (!connection) {
      connection = await mysql.createConnection({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: 'dbCryptoChiksGame'
      });
      console.log('Conectado a la base de datos');
    }

    await connection.execute(
      `REPLACE INTO Progreso_Usuario (id_usuario, id_curso, id_leccion)
       VALUES (?, ?, ?)`,
      [id_usuario, id_curso, id_leccion]
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ mensaje: 'Progreso guardado correctamente' }),
    };

  } catch (error) {
    console.error('Error al guardar progreso:', error.stack);
    return {
      statusCode: 500,
      body: JSON.stringify({ mensaje: 'Error en el servidor' }),
    };
  }
};
