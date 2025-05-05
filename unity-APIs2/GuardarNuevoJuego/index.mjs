import mysql from 'mysql2/promise';

let connection;

// 🧩 Manejador de CORS reutilizable
function handleCORS(event) {
  const headers = {
    'Access-Control-Allow-Origin': '*', // Cambia por tu dominio si lo deseas
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (event.requestContext.http.method === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  return headers;
}

export const handler = async (event) => {
  console.log("Evento recibido:", event.body);

  const corsHeaders = handleCORS(event);
  if (corsHeaders.body === '') return corsHeaders;

  if (event.requestContext.http.method !== 'POST') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ mensaje: 'Método no permitido. Usa POST.' }),
    };
  }

  try {
    const { id_usuario, id_curso, id_leccion } = JSON.parse(event.body);

    if (!Number.isInteger(id_usuario) || !Number.isInteger(id_curso) || !Number.isInteger(id_leccion)) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ mensaje: 'JSON inválido. Se requieren id_usuario, id_curso e id_leccion numéricos.' }),
      };
    }

    if (!connection) {
      connection = await mysql.createConnection({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: 'dbCryptoChiksGame'
      });
      console.log("Conexión a la base de datos establecida");
    }

    const [userRows] = await connection.execute(
      'SELECT id_usuario FROM Usuario WHERE id_usuario = ?',
      [id_usuario]
    );

    if (userRows.length === 0) {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({ mensaje: 'Usuario no encontrado en la base de datos.' }),
      };
    }

    await connection.execute(
      'DELETE FROM Progreso_Usuario WHERE id_usuario = ?',
      [id_usuario]
    );

    await connection.execute(
      'INSERT INTO Progreso_Usuario (id_usuario, id_curso, id_leccion) VALUES (?, ?, ?)',
      [id_usuario, id_curso, id_leccion]
    );

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ mensaje: 'Progreso reiniciado correctamente.' })
    };

  } catch (error) {
    console.error("Error en el servidor:", error.message);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ mensaje: 'Error interno del servidor' }),
    };
  }
};
