import mysql from 'mysql2/promise';

let connection;

// 🧩 Manejador reutilizable de CORS
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
  console.log("Evento recibido:", JSON.stringify(event));

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
    const { id_usuario, monedas } = JSON.parse(event.body);

    if (!Number.isInteger(id_usuario) || !Number.isInteger(monedas)) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ mensaje: 'Datos inválidos en el JSON' }),
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

    const [usuarios] = await connection.execute(
      'SELECT id_usuario FROM Wallet WHERE id_usuario = ?',
      [id_usuario]
    );

    if (usuarios.length === 0) {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({ mensaje: 'Usuario no encontrado' }),
      };
    }

    await connection.execute(
      'UPDATE Wallet SET monedas = ? WHERE id_usuario = ?',
      [monedas, id_usuario]
    );

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ mensaje: 'Monedas actualizadas correctamente' }),
    };

  } catch (error) {
    console.error("Error al actualizar monedas:", error.message);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ mensaje: 'Error interno del servidor' }),
    };
  }
};
