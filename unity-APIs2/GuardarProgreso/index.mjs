import mysql from 'mysql2/promise';

let connection;

// 🧩 Manejador de CORS reutilizable
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
    const { id_usuario, id_curso, id_leccion } = JSON.parse(event.body);

    if (!Number.isInteger(id_usuario) || !Number.isInteger(id_curso) || !Number.isInteger(id_leccion)) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ mensaje: 'Datos inválidos. Todos los IDs deben ser enteros.' }),
      };
    }

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
      headers: corsHeaders,
      body: JSON.stringify({ mensaje: 'Progreso guardado correctamente' }),
    };

  } catch (error) {
    console.error('Error al guardar progreso:', error.stack);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ mensaje: 'Error en el servidor' }),
    };
  }
};
