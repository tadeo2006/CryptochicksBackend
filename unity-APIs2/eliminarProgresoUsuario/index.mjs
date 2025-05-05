import mysql from 'mysql2/promise';

let connection;

// 🧩 Manejador CORS reutilizable
function handleCORS(event) {
  const headers = {
    'Access-Control-Allow-Origin': '*', // Cambia si usas un dominio específico
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
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
  const corsHeaders = handleCORS(event);
  if (corsHeaders.body === '') return corsHeaders;

  if (event.requestContext.http.method !== 'DELETE') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ mensaje: 'Método no permitido' }),
    };
  }

  try {
    const queryParams = event.queryStringParameters || {};
    const id_usuario = parseInt(queryParams.id_usuario);

    if (isNaN(id_usuario)) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ mensaje: 'ID de usuario no válido' }),
      };
    }

    if (!connection) {
      connection = await mysql.createConnection({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: 'dbCryptoChiksGame'
      });
    }

    const [result] = await connection.execute(
      'DELETE FROM Progreso_Usuario WHERE id_usuario = ?',
      [id_usuario]
    );

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        mensaje: '✅ Progreso eliminado correctamente.'
      }),
    };

  } catch (error) {
    console.error('Error eliminando progreso:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ mensaje: 'Error en el servidor' }),
    };
  }
};
