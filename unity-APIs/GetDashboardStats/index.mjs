import mysql from 'mysql2/promise';

let connection;

export const handler = async (event) => {
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

    // Consulta: total de usuarios
    const [[{ totalUsuarios }]] = await connection.execute(
      'SELECT COUNT(*) AS totalUsuarios FROM Usuario'
    );

    // Consulta: total de administradores
    const [[{ totalAdmins }]] = await connection.execute(
      'SELECT COUNT(*) AS totalAdmins FROM Administrador'
    );

    // Consulta: sesiones activas hoy
    const [[{ sesionesActivas }]] = await connection.execute(
      `SELECT COUNT(*) AS sesionesActivas
       FROM RegistroSesion
       WHERE fecha_salida IS NULL AND DATE(fecha_entrada) = CURDATE()`
    );

    // Consulta: usuarios con más logros
    const [usuariosConLogros] = await connection.execute(
      `SELECT U.first_name AS nombre, COUNT(L.id_logro) AS cantidad
       FROM Logro L
       JOIN Usuario U ON L.id_usuario = U.id_usuario
       GROUP BY L.id_usuario
       ORDER BY cantidad DESC
       LIMIT 5`
    );

    // Consulta: monedas distribuidas por usuario
    const [monedasDistribuidas] = await connection.execute(
      `SELECT U.first_name AS nombre, W.monedas
       FROM Wallet W
       JOIN Usuario U ON W.id_usuario = U.id_usuario
       ORDER BY W.monedas DESC
       LIMIT 5`
    );

    // Consulta: top 5 cursos más completados
    const [cursosPopulares] = await connection.execute(
      `SELECT C.nombre, COUNT(*) AS completados
       FROM Usuario_Curso UC
       JOIN Curso C ON UC.id_curso = C.id_curso
       WHERE UC.completado = 1
       GROUP BY UC.id_curso
       ORDER BY completados DESC
       LIMIT 5`
    );

    // Respuesta
    return {
      statusCode: 200,
      body: JSON.stringify({
        totalUsuarios,
        totalAdmins,
        sesionesActivas,
        usuariosConLogros,
        monedasDistribuidas,
        cursosPopulares
      }),
    };
  } catch (error) {
    console.error('Error al obtener estadísticas del dashboard:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ mensaje: 'Error al obtener estadísticas' }),
    };
  }
};
