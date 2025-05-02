import express from 'express';
import mysql from 'mysql2/promise';
import session from 'express-session';

const app = express();
const PUERTO = 8080;

let connection;

// Configurar EJS y carpeta de vistas (usa 'views/' por defecto)
app.set('view engine', 'ejs');

// Servir archivos estáticos desde carpeta 'public/'
app.use(express.static('public'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configurar sesiones
app.use(session({
  secret: 'tu_secreto_seguro', // Cambia esto por una cadena segura
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Cambia a true si usas HTTPS
}));

// Middleware para proteger rutas
function isAuthenticated(req, res, next) {
  if (req.session.user) {
    return next(); // El usuario está autenticado, continuar
  }
  res.redirect('/login'); // Redirigir al login si no está autenticado
}

// Configurar CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  next();
});

// Página de inicio
app.get('/', (req, res) => {
  res.render('home');
});

// Ruta para la página de información
app.get('/info', (req, res) => {
  res.render('info'); // Asegúrate de tener un archivo info.ejs en la carpeta views
});

// Página de login
app.get('/login', (req, res) => {
  res.render('login');
});

// Manejar el login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const response = await fetch('https://toz3gahzj3xaytjuup7jkipqai0flfgy.lambda-url.us-east-1.on.aws/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok) {
      if (data.es_admin) {
        // Guardar datos del administrador en la sesión
        req.session.user = {
          es_admin: true,
          email: email,
          first_name: data.first_name // Guardar el nombre del administrador
        };

        // Redirigir al dashboard
        return res.redirect('/dashboard');
      } else if (data.idusuario) {
        // Guardar datos del usuario en la sesión
        req.session.user = {
          idusuario: data.idusuario,
          email: email,
          id_sesion: data.id_sesion
        };

        // Redirigir al juego
        return res.redirect('/game');
      } else {
        // Si no es admin ni usuario válido, mostrar error
        return res.render('login', {
          error: 'Credenciales incorrectas'
        });
      }
    } else {
      // Mostrar mensaje de error en la página de login
      return res.render('login', {
        error: data.mensaje || 'Credenciales incorrectas'
      });
    }
  } catch (err) {
    console.error('Error al contactar el login API:', err);
    return res.status(500).render('login', {
      error: 'Error al conectar con el servidor de autenticación'
    });
  }
});

// Ruta para mostrar el formulario de registro
app.get('/signup', (req, res) => {
  res.render('signup');
});

// Ruta para manejar el registro
app.post('/signup', async (req, res) => {
  const { first_name, last_name, email, password_hash, fecha_nacimiento } = req.body;

  try {
    const response = await fetch('https://eplu7fzz3pp5bh5toqxvg6tqxa0bqhtw.lambda-url.us-east-1.on.aws/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        first_name,
        last_name,
        email,
        password_hash,
        fecha_nacimiento
      })
    });

    const data = await response.json();

    if (response.ok) {
      // Redirigir al login después de un registro exitoso
      return res.redirect('/login');
    } else {
      // Mostrar mensaje de error en la página de registro
      return res.render('signup', {
        error: data.mensaje || 'Error al registrar el usuario'
      });
    }
  } catch (err) {
    console.error('Error al contactar la API de registro:', err);
    return res.status(500).render('signup', {
      error: 'Error al conectar con el servidor de registro'
    });
  }
});

// Ruta protegida para el dashboard
app.get('/dashboard', isAuthenticated, async (req, res) => {
  if (!req.session.user.es_admin) {
    return res.redirect('/login'); // Redirigir si no es administrador
  }

  try {
    // Consumir la API para obtener los datos del dashboard
    const response = await fetch('https://zskog3nphwscapavdlqybgse6m0wsszn.lambda-url.us-east-1.on.aws/');
    const data = await response.json();

    // Preparar datos para la gráfica de monedas
    const walletChartData = {
      labels: data.monedasDistribuidas.map(w => w.nombre),
      values: data.monedasDistribuidas.map(w => w.monedas)
    };

    // Preparar datos para la gráfica o tabla de promedios por lección
    const promedioLeccionData = data.promediosLeccion.map(p => ({
      leccion: `Lección ${p.id_leccion}`,
      promedio: parseFloat(p.promedio)
    }));


    // Estructura de cursos, lecciones y preguntas con errores
    const cursosConErrores = data.cursosConErrores || [];

    const usuarios = data.usuarios || [];


    // Renderizar la vista con todos los datos
    res.render('dashboard', {
      adminName: req.session.user.first_name, // Asegúrate de que esta línea esté configurada
      totalUsuarios: data.totalUsuarios,
      totalAdmins: data.totalAdmins,
      sesionesActivas: data.sesionesActivas,
      walletChartData,
      promedioLeccionData,    
      cursosConErrores,
      usuarios

    });
  } catch (err) {
    console.error('Error al consumir la API del dashboard:', err);
    res.status(500).send('Error al cargar el dashboard',err);
  }
});



// Ruta para cerrar sesión
app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Error al cerrar sesión:', err);
      return res.redirect('/dashboard');
    }
    res.redirect('/login');
  });
});



// 404
app.use((req, res) => {
  const url = req.originalUrl;
  res.status(404).render('not_found', { url });
});

// Iniciar servidor
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
