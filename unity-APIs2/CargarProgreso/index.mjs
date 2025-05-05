import mysql from 'mysql2/promise';

let connection;

// 🧩 Manejador de CORS reutilizable
function handleCORS(event) {
  const headers = {
    'Access-Control-Allow-Origin': '*', // O especifica tu dominio
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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
  console.log("Evento recibido:", JSON.stringify(event));

  const corsHeaders = handleCORS(event);
  if (corsHeaders.body === '') return corsHeaders;

  try {
    const params = event.queryStringParameters || {};
    const id_usuario = parseInt(params.id_usuario);
    const id_curso = parseInt(params.id_curso);

    if (isNaN(id_usuario) || isNaN(id_curso)) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ mensaje: 'Parámetros inválidos. Se requieren id_usuario e id_curso numéricos.' }),
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

    const [rows] = await connection.execute(
      `SELECT MAX(id_leccion) AS id_leccion
       FROM Progreso_Usuario
       WHERE id_usuario = ? AND id_curso = ?`,
      [id_usuario, id_curso]
    );

    const id_leccion = rows[0]?.id_leccion ?? null;

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        id_usuario,
        id_curso,
        id_leccion
      }),
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
