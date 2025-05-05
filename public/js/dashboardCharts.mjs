document.addEventListener('DOMContentLoaded', () => {
  // COINS DISTRIBUTED
  if (walletChartData.labels.length > 0) {
    const walletChart = echarts.init(document.getElementById('wallet-chart'));
    walletChart.setOption({
      title: { text: 'Coins Distributed per User', textStyle: { color: '#fff' } },
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
        name: 'Coins',
        type: 'bar',
        data: walletChartData.values,
        itemStyle: { color: '#ff00c8' }
      }]
    });

    // Enable resizing
    window.addEventListener('resize', () => {
      walletChart.resize();
    });
  }

  // AVERAGE PER LESSON
  if (typeof promedioLeccionData !== 'undefined' && promedioLeccionData.length > 0) {
    const leccionChart = echarts.init(document.getElementById('promedios-leccion-chart'));
    leccionChart.setOption({
      title: { text: 'Average Score per Lesson', textStyle: { color: '#fff' } },
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
        name: 'Average',
        type: 'bar',
        data: promedioLeccionData.map(item => item.promedio),
        itemStyle: { color: '#00ffc8' }
      }]
    });

    // Enable resizing
    window.addEventListener('resize', () => {
      leccionChart.resize();
    });
  }

  // MOST FAILED QUESTIONS PER COURSE - DYNAMIC
  const courseSelect = document.getElementById('course-select');
  const questionsContainer = document.getElementById('questions-container');

  function clearContainer() {
    questionsContainer.innerHTML = '';
  }

  function showQuestionsByCourse(courseId) {
    clearContainer();

    const curso = cursosConErrores.find(c => c.id_curso === parseInt(courseId));
    if (!curso || !curso.lecciones.length) {
      questionsContainer.innerHTML = '<p>Select a Course</p>';
      return;
    }

    curso.lecciones.forEach(leccion => {
      const leccionDiv = document.createElement('div');
      leccionDiv.classList.add('leccion-table');

      leccionDiv.innerHTML = `
        <h3>Lesson ${leccion.id_leccion}: ${leccion.titulo}</h3>
        <table class="questions-table">
          <thead>
            <tr>
              <th>Question</th>
              <th>Errors</th>
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
    showQuestionsByCourse(selectedCourse);
  });

  // USERS - TABLE AND SEARCH
  function showUserTable(filter = '') {
    const tbody = document.querySelector('#usuarios-table tbody');
    if (!tbody) return;

    const lowerFilter = filter.toLowerCase();
    tbody.innerHTML = '';

    usuarios.forEach(u => {
      const fullName = `${u.first_name} ${u.last_name}`.toLowerCase();
      const email = u.email.toLowerCase();

      if (
        fullName.includes(lowerFilter) ||
        email.includes(lowerFilter)
      ) {
        const birthDate = new Date(u.fecha_nacimiento).toLocaleDateString('en-US');

        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${u.id_usuario}</td>
          <td>${u.first_name} ${u.last_name}</td>
          <td>${u.email}</td>
          <td>${birthDate}</td>
        `;
        tbody.appendChild(row);
      }
    });
  }

  showUserTable();

  const inputBuscar = document.getElementById('buscar-usuario');
  if (inputBuscar) {
    inputBuscar.addEventListener('input', () => {
      showUserTable(inputBuscar.value);
    });
  }

  // Sidebar navigation handling
  const sidebarLinks = document.querySelectorAll('.sidebar a');
  const sections = document.querySelectorAll('.main-section');

  sidebarLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();

      // Get data-target value
      const targetId = link.getAttribute('data-target');

      // Hide all sections
      sections.forEach(section => {
        section.style.display = 'none';
      });

      // Show the corresponding section
      const targetSection = document.getElementById(targetId);
      if (targetSection) {
        targetSection.style.display = 'block';
      }
    });
  });
});
