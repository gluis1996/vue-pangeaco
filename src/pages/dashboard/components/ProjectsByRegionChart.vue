<template>
  <VCard title="Distribución por Región" class="h-100">
    <VCardText>
      <VueApexCharts
        type="donut"
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
    return { series: [], labels: [] }
  }

  const series = props.data.map(item => item.total_proyectos)
  const labels = props.data.map(item => item.region)

  return {
    chart: {
      type: 'donut',
    },
    labels,
    series,
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: true,
            total: { show: true, label: 'Total' },
          },
        },
      },
    },
    legend: { position: 'bottom' },
  }
})
</script>