import mysql from 'mysql2/promise';

let connection;

// 🧩 Manejador de CORS reutilizable
function handleCORS(event) {
  const headers = {
    'Access-Control-Allow-Origin': '*', // Cambia por tu dominio si deseas
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
    const { id_usuario, monedas } = JSON.parse(event.body);

    if (!Number.isInteger(id_usuario) || monedas !== 100) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ mensaje: 'Entrada inválida. "monedas" debe ser 100.' }),
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
      'UPDATE Wallet SET monedas = ? WHERE id_usuario = ?',
      [monedas, id_usuario]
    );

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ mensaje: 'Monedas reiniciadas a 100', resultado: result }),
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ mensaje: 'Error en el servidor', error: error.message }),
    };
  }
};
