import mysql from 'mysql2/promise';

let connection;

// 🎯 Función para manejar CORS
function handleCORS(event) {
  const headers = {
    'Access-Control-Allow-Origin': '*', // Puedes poner tu dominio específico aquí
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

  // Manejar preflight CORS
  const corsHeaders = handleCORS(event);
  if (corsHeaders.body === '') return corsHeaders;

  try {
    // Extraer ID desde el path
    const pathParts = event.rawPath.split('/');
    const idStr = pathParts[pathParts.length - 1];
    const id_usuario = parseInt(idStr);

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
        database: 'dbCryptoChiksGame',
      });
      console.log("Conexión a la base de datos establecida");
    }

    const [rows] = await connection.execute(
      'SELECT monedas FROM Wallet WHERE id_usuario = ?',
      [id_usuario]
    );

    if (rows.length === 0) {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({ mensaje: 'Usuario no encontrado' }),
      };
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ id_usuario, monedas: rows[0].monedas }),
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
