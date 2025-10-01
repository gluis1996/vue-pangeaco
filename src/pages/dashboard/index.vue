<template>
  <div class="pa-6">
    <VRow >
      <VCol v-for="(item, index) in kpiData" :key="index">
        <KpiCard 
          :title="item.nombre" 
          :value="item.valor || 0" 
          :icon="item.icon" 
          :color="item.color" />
      </VCol>
    </VRow>

    <VRow>
      <!-- Tabla de Proyectos con Avance -->
      <VCol cols="12" md="8">
        <ProjectStatusTable :proyectos="proyectosData" />
      </VCol>

      <VCol cols="12" md="4">
        <ProjectsByRegionChart :data="graficosData.distribucionPorRegion" />
      </VCol>
    </VRow>

    <VRow>
      <VCol cols="12" md="8">
        <ProjectListActualizacion :projects="projectListActualizacion" />
      </VCol>

      <!-- Gráficos -->
      <VCol cols="12" md="4">
        <ProjectsByContractorChart :data="projectListActualizacionChart" class="h-100" />
      </VCol>
    </VRow>
  </div>
</template>

<script setup>
import { VCol, VRow } from 'vuetify/components'
import KpiCard from './components/KpiCard.vue'
import ProjectStatusTable from './components/ProjectStatusTable.vue'
import ProjectsByContractorChart from './components/ProjectsByContractorChart.vue'
import ProjectsByRegionChart from './components/ProjectsByRegionChart.vue'
import ProjectListActualizacion from './components/ProjectListActualizacion.vue'
import { useDashboard } from './useDashboard.js'
import { useKpiCard } from './usekpicard.js'
import { useProjectStatusTable } from './useProjectStatusTable.js'
import { useProjectListActualizacion } from './useProjectListActualizacion.js'
import { useProjectListActualizacionChart } from './useProjectsByContractorChart'
console.log('Dashboard component loaded');



const { graficosData, proyectosSinAvance } = useDashboard();
const { kpiData } = useKpiCard();
const { proyectosData } = useProjectStatusTable();
const { projectListActualizacion } = useProjectListActualizacion();
const { projectListActualizacionChart } = useProjectListActualizacionChart();



</script>