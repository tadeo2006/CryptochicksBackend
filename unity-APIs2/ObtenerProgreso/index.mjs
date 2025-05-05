import mysql from 'mysql2/promise';

let connection;

// 🧩 Manejador de CORS reutilizable
function handleCORS(event) {
  const headers = {
    'Access-Control-Allow-Origin': '*', // Cambia por tu dominio si lo necesitas
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

    if (isNaN(id_usuario)) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ mensaje: 'Parámetro inválido. Se requiere id_usuario numérico.' }),
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
      `SELECT id_usuario, id_curso, MAX(id_leccion) AS id_leccion
       FROM Progreso_Usuario
       WHERE id_usuario = ?
       GROUP BY id_curso
       ORDER BY id_leccion DESC
       LIMIT 1;`,
      [id_usuario]
    );

    if (rows.length === 0) {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({ mensaje: 'No se encontró progreso para este usuario.' }),
      };
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(rows[0])
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
