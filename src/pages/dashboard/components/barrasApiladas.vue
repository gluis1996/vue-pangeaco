<script setup>
import { useTheme } from 'vuetify'
import { getHorizontalBarChartConfig } from '@core/libs/chartjs/chartjsConfig'
import BarChart from '@core/libs/chartjs/components/BarChart'

const props = defineProps({
  apiData: {
    type: Object,
    required: false,
    default: null
  },
  colors: {
    type: null,
    required: false,
  },
})

const vuetifyTheme = useTheme()
const chartOptions = computed(() => getHorizontalBarChartConfig(vuetifyTheme.current.value))

// Datos por defecto si no se envía apiData
const defaultData = {
  labels: [
    'MON',
    'TUE',
    'WED ',
    'THU',
    'FRI',
  ],
  datasets: [
    {
      maxBarThickness: 15,
      label: 'Market Data',
      backgroundColor: "#ffbd1f",
      borderColor: 'transparent',
      data: [710, 350, 580, 460, 120],
    },
    {
      maxBarThickness: 15,
      backgroundColor: "#26c6da",
      label: 'Personal Data',
      borderColor: 'transparent',
      data: [430, 590, 510, 240, 360],
    },
    {
      maxBarThickness: 15,
      backgroundColor: "#4f5d70",
      label: 'Other Data',
      borderColor: 'transparent',
      data: [430, 590, 510, 240, 360],
    },
  ],
}

// Procesar datos de la API o usar datos por defecto
const data = computed(() => {
  if (!props.apiData) {
    return defaultData
  }

  // Hacemos una copia para poder modificarla
  const datasets = JSON.parse(JSON.stringify(props.apiData.datasets || []))

  // 1. Buscamos los datos de Total y Trabajados
  const totalDataset = datasets.find(d => d.label === 'Total')
  const trabajadosDataset = datasets.find(d => d.label === 'Trabajados')

  // 2. Si tenemos ambos, calculamos "Pendientes"
  if (totalDataset && trabajadosDataset) {
    const pendientesData = totalDataset.data.map((total, index) => {
      const trabajados = trabajadosDataset.data[index] || 0
      
      return total - trabajados
    })

    // 3. Añadimos el nuevo dataset de "Pendientes"
    //    (solo si no viene ya en la API)
    const pendientesExists = datasets.some(d => d.label === 'Pendientes')
    if (!pendientesExists) {
      datasets.push({
        label: 'Pendientes',
        backgroundColor: '#e74c3c', // Color rojo para pendientes
        data: pendientesData,
      })
    }
  }

  return {
    labels: props.apiData.labels || [],
    // Usamos los datasets (ahora con "Pendientes" si fue calculado)
    datasets: datasets.map(dataset => ({
      maxBarThickness: 15,
      label: dataset.label,
      backgroundColor: dataset.backgroundColor,
      borderColor: 'transparent',
      data: dataset.data,
    })),
  }
})
</script>

<template>
  <BarChart
    :height="375"
    :chart-data="data"
    :chart-options="chartOptions"
  />
</template>
