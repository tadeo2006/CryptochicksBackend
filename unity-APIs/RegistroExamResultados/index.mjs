import mysql from 'mysql2/promise';

let connection;

export const handler = async (event) => {
  console.log("Evento recibido:", JSON.stringify(event));

  // Validar que el método sea POST
  if (event.requestContext.http.method !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ mensaje: 'Método no permitido' }),
    };
  }

  try {
    // Parsear el JSON del body
    const body = JSON.parse(event.body);
    const { id_usuario, id_leccion, puntaje, respuestas } = body;

    // Validación básica de estructura
    if (
      !Number.isInteger(id_usuario) ||
      !Number.isInteger(id_leccion) ||
      !Number.isInteger(puntaje) ||
      !Array.isArray(respuestas)
    ) {
      console.warn("JSON inválido:", body);
      return {
        statusCode: 400,
        body: JSON.stringify({ mensaje: 'Datos inválidos en el JSON' }),
      };
    }

    // Conexión única a BD
    if (!connection) {
      connection = await mysql.createConnection({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: 'dbCryptoChiksGame'
      });
      console.log("Conectado a la base de datos");
    }

    // Insertar en Examen
    const [examenResult] = await connection.execute(
      `INSERT INTO Examen (id_usuario, id_leccion, puntaje, hora_terminacion)
       VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
      [id_usuario, id_leccion, puntaje]
    );

    const id_examen = examenResult.insertId;
    console.log("ID del examen registrado:", id_examen);

    // Insertar cada respuesta
    for (const r of respuestas) {
      const { id_pregunta, opcion_elegida, es_correcta } = r;

      if (
        !Number.isInteger(id_pregunta) ||
        typeof opcion_elegida !== 'string' ||
        ![0, 1].includes(es_correcta)
      ) {
        console.warn("Respuesta inválida:", r);
        continue; // O puedes lanzar error si quieres abortar todo
      }

      await connection.execute(
        `INSERT INTO Examen_Respuesta (id_examen, id_pregunta, opcion_elegida, es_correcta)
         VALUES (?, ?, ?, ?)`,
        [id_examen, id_pregunta, opcion_elegida, es_correcta]
      );
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        mensaje: 'Examen registrado exitosamente',
        puntaje
      }),
    };

  } catch (error) {
    console.error("Error en el servidor:", error.message, error.stack);
    return {
      statusCode: 500,
      body: JSON.stringify({ mensaje: 'Error interno del servidor' }),
    };
  }
};
