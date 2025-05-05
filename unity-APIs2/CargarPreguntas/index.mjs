import mysql from 'mysql2/promise';

let connection;

// 🧩 Manejador reutilizable de CORS
function handleCORS(event) {
  const headers = {
    'Access-Control-Allow-Origin': '*', // Puedes especificar tu dominio en vez de '*'
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Si es una solicitud preflight OPTIONS, respondemos directamente
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
    const body = JSON.parse(event.body);
    const { id_leccion } = body;

    if (!Number.isInteger(id_leccion)) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ mensaje: 'ID de lección inválido' }),
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

    const [rows] = await connection.execute(`
      SELECT
        p.id_pregunta, p.texto AS pregunta_texto, p.explicacion,
        o.id_opcion, o.texto_opcion AS texto, o.es_correcta
      FROM Pregunta p
      JOIN Opcion_Respuesta o ON p.id_pregunta = o.id_pregunta
      WHERE p.id_leccion = ?
      ORDER BY p.id_pregunta, o.id_opcion
    `, [id_leccion]);

    const preguntasMap = new Map();

    for (const row of rows) {
      if (!preguntasMap.has(row.id_pregunta)) {
        preguntasMap.set(row.id_pregunta, {
          id_pregunta: row.id_pregunta,
          texto: row.pregunta_texto,
          explicacion: row.explicacion,
          opciones: []
        });
      }

      preguntasMap.get(row.id_pregunta).opciones.push({
        id_opcion: row.id_opcion,
        texto: row.texto,
        es_correcta: row.es_correcta
      });
    }

    const preguntas = Array.from(preguntasMap.values());

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ preguntas })
    };

  } catch (error) {
    console.error("Error cargando preguntas:", error.message);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ mensaje: 'Error interno del servidor' }),
    };
  }
};
