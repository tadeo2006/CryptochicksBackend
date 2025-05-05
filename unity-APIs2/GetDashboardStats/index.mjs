import mysql from 'mysql2/promise';

let connection;

// 🧩 Manejador de CORS reutilizable
function handleCORS(event) {
  const headers = {
    'Access-Control-Allow-Origin': '*', // Cambia por tu dominio si lo prefieres
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
  const corsHeaders = handleCORS(event);
  if (corsHeaders.body === '') return corsHeaders;

  try {
    if (!connection) {
      connection = await mysql.createConnection({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: 'dbCryptoChiksGame'
      });
      console.log('Conexión a la base de datos establecida');
    }

    // Total de usuarios
    const [[{ totalUsuarios }]] = await connection.execute(
      'SELECT COUNT(*) AS totalUsuarios FROM Usuario'
    );

    // Total de administradores
    const [[{ totalAdmins }]] = await connection.execute(
      'SELECT COUNT(*) AS totalAdmins FROM Administrador'
    );

    // Sesiones activas hoy
    const [[{ sesionesActivas }]] = await connection.execute(
      `SELECT COUNT(*) AS sesionesActivas
       FROM RegistroSesion
       WHERE fecha_salida IS NULL AND DATE(fecha_entrada) = CURDATE()`
    );

    // Monedas distribuidas
    const [monedasDistribuidas] = await connection.execute(
      `SELECT U.first_name AS nombre, W.monedas
       FROM Wallet W
       JOIN Usuario U ON W.id_usuario = U.id_usuario
       ORDER BY W.monedas DESC
       LIMIT 5`
    );

    // Promedio por lección
    const [promediosLeccion] = await connection.execute(
      `SELECT id_leccion, AVG(puntaje) AS promedio
       FROM Examen
       GROUP BY id_leccion`
    );

    // Preguntas con errores
    const [preguntasPorCurso] = await connection.execute(`
      SELECT
        C.id_curso,
        C.nombre AS curso_nombre,
        L.id_leccion,
        L.titulo AS leccion_titulo,
        P.id_pregunta,
        P.texto AS pregunta_texto,
        COUNT(CASE WHEN ER.es_correcta = 0 THEN 1 END) AS errores
      FROM Curso C
      JOIN Leccion L ON L.id_curso = C.id_curso
      JOIN Pregunta P ON P.id_leccion = L.id_leccion
      LEFT JOIN Examen_Respuesta ER ON ER.id_pregunta = P.id_pregunta
      WHERE C.id_curso BETWEEN 1 AND 3
      GROUP BY C.id_curso, C.nombre, L.id_leccion, L.titulo, P.id_pregunta, P.texto
      ORDER BY C.id_curso, L.id_leccion
    `);

    // Todos los usuarios
    const [usuarios] = await connection.execute(
      `SELECT * FROM Usuario`
    );

    // Estructura jerárquica: curso → lección → preguntas
    const cursosConErrores = [];

    for (const row of preguntasPorCurso) {
      let curso = cursosConErrores.find(c => c.id_curso === row.id_curso);
      if (!curso) {
        curso = {
          id_curso: row.id_curso,
          nombre: row.curso_nombre,
          lecciones: []
        };
        cursosConErrores.push(curso);
      }

      let leccion = curso.lecciones.find(l => l.id_leccion === row.id_leccion);
      if (!leccion) {
        leccion = {
          id_leccion: row.id_leccion,
          titulo: row.leccion_titulo,
          preguntas: []
        };
        curso.lecciones.push(leccion);
      }

      leccion.preguntas.push({
        id_pregunta: row.id_pregunta,
        texto: row.pregunta_texto,
        errores: row.errores
      });
    }

    for (const curso of cursosConErrores) {
      for (const leccion of curso.lecciones) {
        leccion.preguntas.sort((a, b) => b.errores - a.errores);
      }
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        totalUsuarios,
        totalAdmins,
        sesionesActivas,
        monedasDistribuidas,
        promediosLeccion,
        cursosConErrores,
        usuarios
      }),
    };

  } catch (error) {
    console.error('Error al obtener estadísticas del dashboard:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ mensaje: 'Error al obtener estadísticas' }),
    };
  }
};
