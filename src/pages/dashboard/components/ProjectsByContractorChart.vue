<template>
  <VCard title="Proyectos por Contratista (EECC)">
    <VCardText>
      <VueApexCharts
        type="bar"
        :options="chartOptions"
        :series="chartOptions.series"
        height="350"
      />
    </VCardText>
  </VCard>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  data: { type: Array, default: () => [] },
})

const chartOptions = computed(() => {
  if (!props.data || props.data.length === 0) {
    return { series: [] }
  }

  const categories = props.data.map(item => item.contrata)
  const enProgresoData = props.data.map(item => item.pendientes)
  const completadosData = props.data.map(item => item.completados)

  return {
    chart: {
      type: 'bar',
      stacked: true,
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '50%',
      },
    },
    xaxis: {
      categories,
    },
    yaxis: { title: { text: 'Nº de Proyectos' } },
    legend: { position: 'top' },
    fill: { opacity: 1 },
    series: [
      { name: 'En Progreso', data: enProgresoData },
      { name: 'Completados', data: completadosData },
    ],
  }
})
</script>