import mysql from 'mysql2/promise';

let connection;

export const handler = async (event) => {
  console.log("Evento recibido:", JSON.stringify(event));

  // Validar método
  if (event.requestContext.http.method !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ mensaje: 'Método no permitido' }),
    };
  }

  try {
    const body = JSON.parse(event.body);
    const { id_leccion } = body;

    if (!Number.isInteger(id_leccion)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ mensaje: 'ID de lección inválido' }),
      };
    }

    // Conexión
    if (!connection) {
      connection = await mysql.createConnection({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: 'dbCryptoChiksGame'
      });
    }

    // Ejecutar la consulta
    const [rows] = await connection.execute(`
      SELECT
        p.id_pregunta, p.texto AS pregunta_texto, p.explicacion,
        o.id_opcion, o.texto_opcion AS texto, o.es_correcta
      FROM Pregunta p
      JOIN Opcion_Respuesta o ON p.id_pregunta = o.id_pregunta
      WHERE p.id_leccion = ?
      ORDER BY p.id_pregunta, o.id_opcion
    `, [id_leccion]);

    // Agrupar por pregunta
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
      body: JSON.stringify({ preguntas })
    };

  } catch (error) {
    console.error("Error cargando preguntas:", error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ mensaje: 'Error interno del servidor' }),
    };
  }
};
