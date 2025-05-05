import mysql from 'mysql2/promise';

let connection;

// 🧩 Manejador CORS reutilizable
function handleCORS(event) {
  const headers = {
    'Access-Control-Allow-Origin': '*', // Cambia por tu dominio si es necesario
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
  const corsHeaders = handleCORS(event);
  if (corsHeaders.body === '') return corsHeaders;

  if (event.requestContext.http.method !== 'POST') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ mensaje: 'Método no permitido' }),
    };
  }

  try {
    const { id_usuario } = JSON.parse(event.body);

    if (!connection) {
      connection = await mysql.createConnection({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: 'dbCryptoChiksGame'
      });
      console.log("Conexión establecida con la base de datos");
    }

    const [rows] = await connection.execute(
      'SELECT id_leccion FROM Progreso_Usuario WHERE id_usuario = ?',
      [id_usuario]
    );

    const lecciones = rows.map(row => row.id_leccion);

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ lecciones })
    };

  } catch (error) {
    console.error("Error consultando progreso:", error.message, error.stack);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ mensaje: "Error interno del servidor" })
    };
  }
};
