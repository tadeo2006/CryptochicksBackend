import mysql from 'mysql2/promise';

let connection;

// 🧩 Manejador de CORS reutilizable
function handleCORS(event) {
  const headers = {
    'Access-Control-Allow-Origin': '*', // Cambia por tu dominio si deseas limitarlo
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
      body: JSON.stringify({ error: 'Método no permitido' }),
    };
  }

  try {
    const { id_usuario, id_curso, completado } = JSON.parse(event.body);

    if (!id_usuario || !id_curso || completado !== true) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Datos incompletos o inválidos' }),
      };
    }

    if (!connection) {
      connection = await mysql.createConnection({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
      });
    }

    const [rows] = await connection.execute(
      'SELECT * FROM Usuario_Curso WHERE id_usuario = ? AND id_curso = ?',
      [id_usuario, id_curso]
    );

    if (rows.length > 0) {
      await connection.execute(
        'UPDATE Usuario_Curso SET completado = TRUE WHERE id_usuario = ? AND id_curso = ?',
        [id_usuario, id_curso]
      );
    } else {
      await connection.execute(
        'INSERT INTO Usuario_Curso (id_usuario, id_curso, completado) VALUES (?, ?, TRUE)',
        [id_usuario, id_curso]
      );
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ mensaje: 'Curso actualizado correctamente.' }),
    };

  } catch (error) {
    console.error('Error al actualizar el curso:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'No se pudo actualizar el curso.' }),
    };
  }
};
