import mysql from 'mysql2/promise';

let connection;

// 🧩 Manejador de CORS reutilizable
function handleCORS(event) {
  const headers = {
    'Access-Control-Allow-Origin': '*', // Cambia a tu dominio si lo necesitas
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
    const {
      first_name,
      last_name,
      email,
      password_hash,
      fecha_nacimiento
    } = JSON.parse(event.body);

    if (!first_name || !last_name || !email || !password_hash || !fecha_nacimiento) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ mensaje: 'Faltan campos obligatorios' }),
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

    const [existing] = await connection.execute(
      'SELECT id_usuario FROM Usuario WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      return {
        statusCode: 409,
        headers: corsHeaders,
        body: JSON.stringify({ mensaje: 'El correo ya está registrado' }),
      };
    }

    const [result] = await connection.execute(
      `INSERT INTO Usuario (first_name, last_name, email, password_hash, fecha_nacimiento)
       VALUES (?, ?, ?, ?, ?)`,
      [first_name, last_name, email, password_hash, fecha_nacimiento]
    );

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        mensaje: 'Registro exitoso',
        idUsuario: result.insertId
      }),
    };
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ mensaje: 'Error en el servidor' }),
    };
  }
};
