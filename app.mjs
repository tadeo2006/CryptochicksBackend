import express from 'express';
import mysql from 'mysql2/promise';

const app = express();
const PUERTO = 8080;

let connection;

// Configurar EJS y carpeta de vistas (usa 'views/' por defecto)
app.set('view engine', 'ejs');

// Servir archivos estáticos desde carpeta 'public/'
app.use(express.static('public'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  next();
});

// ✅ Página de inicio
app.get('/', (req, res) => {
  res.render('home');
});

// ✅ Consultar tabla de usuarios
app.get('/db', async (req, res) => {
  try {
    const [rows] = await connection.execute('SELECT * FROM Usuario');
    res.render('db', { rows });
  } catch (err) {
    console.error('Error en /db:', err);
    res.status(500).send('Error al acceder a la base de datos');
  }
});


// ❌ 404
app.use((req, res) => {
  const url = req.originalUrl;
  res.status(404).render('not_found', { url });
});

// 🚀 Iniciar servidor
async function main() {
  try {
    connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: 'dbCryptoChiksGame'
    });

    console.log('Conectado a la base de datos');

    app.listen(PUERTO, () => {
      console.log(`Servidor HTTP corriendo en http://localhost:${PUERTO}`);
    });
  } catch (err) {
    console.error('No se pudo conectar a la base de datos:', err);
  }
}

main();
