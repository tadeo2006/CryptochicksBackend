document.addEventListener('DOMContentLoaded', () => {
    if (logrosChartData.labels.length > 0) {
      const logrosChart = echarts.init(document.getElementById('logros-chart'));
      logrosChart.setOption({
        title: { text: 'Usuarios con Más Logros', textStyle: { color: '#fff' } },
        tooltip: {},
        xAxis: { type: 'category', data: logrosChartData.labels, axisLabel: { color: '#fff' } },
        yAxis: { type: 'value', axisLabel: { color: '#fff' } },
        series: [{
          name: 'Logros',
          type: 'bar',
          data: logrosChartData.values,
          itemStyle: { color: '#00ffc8' }
        }]
      });
    }
  
    if (walletChartData.labels.length > 0) {
      const walletChart = echarts.init(document.getElementById('wallet-chart'));
      walletChart.setOption({
        title: { text: 'Monedas Distribuidas por Usuario', textStyle: { color: '#fff' } },
        tooltip: {},
        xAxis: { type: 'category', data: walletChartData.labels, axisLabel: { color: '#fff' } },
        yAxis: { type: 'value', axisLabel: { color: '#fff' } },
        series: [{
          name: 'Monedas',
          type: 'bar',
          data: walletChartData.values,
          itemStyle: { color: '#ff00c8' }
        }]
      });
    }
  
    if (cursosChartData.labels.length > 0) {
      const cursosChart = echarts.init(document.getElementById('cursos-chart'));
      cursosChart.setOption({
        title: { text: 'Top 5 Cursos Más Completados', textStyle: { color: '#fff' } },
        tooltip: {},
        xAxis: { type: 'category', data: cursosChartData.labels, axisLabel: { color: '#fff' } },
        yAxis: { type: 'value', axisLabel: { color: '#fff' } },
        series: [{
          name: 'Completados',
          type: 'bar',
          data: cursosChartData.values,
          itemStyle: { color: '#ffa500' }
        }]
      });
    }
  });
  