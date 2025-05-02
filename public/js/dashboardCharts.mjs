// dashboardCharts.mjs

document.addEventListener('DOMContentLoaded', () => {
  // MONEDAS DISTRIBUIDAS
  if (walletChartData.labels.length > 0) {
    const walletChart = echarts.init(document.getElementById('wallet-chart'));
    walletChart.setOption({
      title: { text: '', textStyle: { color: '#fff' } },
      tooltip: {},
      xAxis: {
        type: 'category',
        data: walletChartData.labels,
        axisLabel: { color: '#fff' }
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: '#fff' }
      },
      series: [{
        name: 'Monedas',
        type: 'bar',
        data: walletChartData.values,
        itemStyle: { color: '#ff00c8' }
      }]
    });
  }

  // PROMEDIO POR LECCIÓN
  if (typeof promedioLeccionData !== 'undefined' && promedioLeccionData.length > 0) {
    const leccionChart = echarts.init(document.getElementById('promedios-leccion-chart'));
    leccionChart.setOption({
      title: { text: '', textStyle: { color: '#fff' } },
      tooltip: {},
      xAxis: {
        type: 'category',
        data: promedioLeccionData.map(item => item.leccion),
        axisLabel: { color: '#fff' }
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: '#fff' }
      },
      series: [{
        name: 'Promedio',
        type: 'bar',
        data: promedioLeccionData.map(item => item.promedio),
        itemStyle: { color: '#00ffc8' }
      }]
    });
  }

  // DESPLAZAMIENTO SUAVE PARA LA BARRA LATERAL
  document.querySelectorAll('.sidebar a').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // PREGUNTAS MÁS FALLADAS POR CURSO - DINÁMICO
  const courseSelect = document.getElementById('course-select');
  const questionsContainer = document.getElementById('questions-container');

  function limpiarContenedor() {
    questionsContainer.innerHTML = '';
  }

  function mostrarPreguntasPorCurso(cursoId) {
    limpiarContenedor();

    const curso = cursosConErrores.find(c => c.id_curso === parseInt(cursoId));
    if (!curso || !curso.lecciones.length) {
      questionsContainer.innerHTML = '<p>No hay preguntas registradas para este curso.</p>';
      return;
    }

    curso.lecciones.forEach(leccion => {
      const leccionDiv = document.createElement('div');
      leccionDiv.classList.add('leccion-table');

      leccionDiv.innerHTML = `
        <h3>Lección ${leccion.id_leccion}: ${leccion.titulo}</h3>
        <table class="questions-table">
          <thead>
            <tr>
              <th>Pregunta</th>
              <th>Errores</th>
            </tr>
          </thead>
          <tbody>
            ${leccion.preguntas
              .sort((a, b) => b.errores - a.errores)
              .map(p => `
                <tr>
                  <td>${p.texto}</td>
                  <td>${p.errores}</td>
                </tr>
              `).join('')}
          </tbody>
        </table>
      `;

      questionsContainer.appendChild(leccionDiv);
    });
  }

  courseSelect.addEventListener('change', () => {
    const selectedCourse = courseSelect.value;
    mostrarPreguntasPorCurso(selectedCourse);
  });

  // USUARIOS - TABLA Y BUSCADOR
  function mostrarTablaUsuarios(filtro = '') {
    const tbody = document.querySelector('#usuarios-table tbody');
    if (!tbody) return;

    const filtroMin = filtro.toLowerCase();
    tbody.innerHTML = '';

    usuarios.forEach(u => {
      const nombreCompleto = `${u.first_name} ${u.last_name}`.toLowerCase();
      const correo = u.email.toLowerCase();

      if (
        nombreCompleto.includes(filtroMin) ||
        correo.includes(filtroMin)
      ) {
        const fechaNac = new Date(u.fecha_nacimiento).toLocaleDateString('en-US');
;

        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${u.id_usuario}</td>
          <td>${u.first_name} ${u.last_name}</td>
          <td>${u.email}</td>
          <td>${fechaNac}</td>

        `;
        tbody.appendChild(row);
      }
    });
  }

  mostrarTablaUsuarios();

  const inputBuscar = document.getElementById('buscar-usuario');
  if (inputBuscar) {
    inputBuscar.addEventListener('input', () => {
      mostrarTablaUsuarios(inputBuscar.value);
    });
  }

  // Manejo de navegación en el sidebar
  const sidebarLinks = document.querySelectorAll('.sidebar a');
  const sections = document.querySelectorAll('.main-section');

  sidebarLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();

      // Obtener el target de la sección a mostrar
      const targetId = link.getAttribute('data-target');

      // Ocultar todas las secciones
      sections.forEach(section => {
        section.style.display = 'none';
      });

      // Mostrar la sección correspondiente
      const targetSection = document.getElementById(targetId);
      if (targetSection) {
        targetSection.style.display = 'block';
      }
    });
  });
});
