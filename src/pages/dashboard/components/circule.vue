<script setup>
import { ref, computed, onMounted } from 'vue'

const chartColors = {
  donut: {
    series1: '#72E128',
    series2: '#8EE753',
    series3: '#AAED7E',
    series4: '#C7F3A9',
  },
}

const headingColor = 'rgba(var(--v-theme-on-background), var(--v-high-emphasis-opacity))'
const labelColor = 'rgba(var(--v-theme-on-background), var(--v-medium-emphasis-opacity))'

// 1. Estado reactivo para almacenar los datos de la API
const apiData = ref([])
const isLoading = ref(true)

// 2. Simulación de llamada a la API al montar el componente
onMounted(async () => {
  // En un caso real, harías una llamada a tu API aquí
  // const response = await $api('/tu-endpoint-de-grafico')
  // apiData.value = response.data

  // Datos de ejemplo simulando la respuesta de la API
  const mockApiData = [
    { label: 'Dirección Incorrecta', valor: 13 },
    { label: 'Condiciones Climáticas', valor: 25 },
    { label: 'Feriados', valor: 22 },
    { label: 'Daño en Tránsito', valor: 40 },
  ]

  apiData.value = mockApiData
  isLoading.value = false
})

// 3. Propiedades computadas para generar la configuración del gráfico dinámicamente
const deliveryExceptionsChartSeries = computed(() => {
  return apiData.value.map(item => item.valor)
})

const deliveryExceptionsChartConfig = computed(() => ({
  // Las etiquetas se extraen de los datos de la API
  labels: apiData.value.map(item => item.label),

  // El resto de la configuración se mantiene igual
  colors: [
    chartColors.donut.series1,
    chartColors.donut.series2,
    chartColors.donut.series3,
    chartColors.donut.series4,
  ],
  stroke: { width: 0 },
  dataLabels: {
    enabled: false,
    formatter(val) {
      return `${ Number.parseInt(val) }%`
    },
  },
  legend: {
    show: true,
    position: 'bottom',
    offsetY: 10,
    markers: {
      width: 8,
      height: 8,
      offsetX: -3,
    },
    itemMargin: {
      horizontal: 15,
      vertical: 5,
    },
    fontSize: '13px',
    fontWeight: 400,
    labels: {
      colors: headingColor,
      useSeriesColors: false,
    },
  },
  tooltip: { theme: false },
  grid: { padding: { top: 15 } },
  plotOptions: {
    pie: {
      donut: {
        size: '75%',
        labels: {
          show: true,
          value: {
            fontSize: '24px',
            color: headingColor,
            fontWeight: 500,
            offsetY: -23,
            formatter(val) {
              return `${ Number.parseInt(val) }%`
            },
          },
          name: { offsetY: 22 },
          total: {
            show: true,
            fontSize: '1rem',
            label: 'AVG. Exceptions',
            color: labelColor,
            formatter() {
              return '30%'
            },
          },
        },
      },
    },
  },
  responsive: [{
    breakpoint: 420,
    options: { chart: { height: 400 } },
  }],
}))

const moreList = [
  {
    title: 'Refresh',
    value: 'refresh',
  },
  {
    title: 'Update',
    value: 'update',
  },
  {
    title: 'Share',
    value: 'share',
  },
]
</script>

<template>
  <VCard>
    <VCardItem title="Delivery exceptions">
      <template #append>
        <MoreBtn :menu-list="moreList" />
      </template>
    </VCardItem>
    <VCardText class="d-flex align-center justify-center">
      <!-- Mostrar un loader mientras se cargan los datos -->
      <VProgressCircular
        v-if="isLoading"
        indeterminate
        color="primary"
      />
      <VueApexCharts
        v-else
        type="donut"
        height="428"
        :options="deliveryExceptionsChartConfig"
        :series="deliveryExceptionsChartSeries"
      />
    </VCardText>
  </VCard>
</template>
