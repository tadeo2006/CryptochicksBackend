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

  // Solo aceptar método POST
  if (event.requestContext.http.method !== 'POST') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ mensaje: 'Método no permitido' }),
    };
  }

  try {
    const { mensaje, id_sesion } = JSON.parse(event.body);

    if (!Number.isInteger(id_sesion)) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ mensaje: 'ID de sesión inválido' }),
      };
    }

    if (!connection) {
      connection = await mysql.createConnection({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: 'dbCryptoChiksGame'
      });
      console.log('Conexión establecida con la base de datos');
    }

    const [result] = await connection.execute(
      'UPDATE RegistroSesion SET fecha_salida = CURRENT_TIMESTAMP WHERE id_sesion = ?',
      [id_sesion]
    );

    if (result.affectedRows > 0) {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ mensaje: 'Salida registrada' }),
      };
    } else {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({ mensaje: 'Sesión no encontrada' }),
      };
    }

  } catch (error) {
    console.error('Error al registrar salida:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ mensaje: 'Error en el servidor' }),
    };
  }
};
