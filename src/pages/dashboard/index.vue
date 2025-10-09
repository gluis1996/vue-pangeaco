<template>
  <div class="pa-6">
    <!-- 👉 KPI Cards -->
    <VRow>
      <VCol v-for="(item, index) in kpiData" :key="index">
        <KpiCard
          :title="item.nombre"
          :value="item.valor || 0"
          :icon="item.icon"
          :color="item.color"
        />
      </VCol>
    </VRow>

    <VRow>
      <VCol cols="12">
        <CardStatisticsSalesOverview />
      </VCol>
    </VRow>

    <VRow>
      <!-- 👉 Tabla de Proyectos con Avance -->
      <VCol cols="12" md="8">
        <ProjectStatusTable :proyectos="proyectosData" />
      </VCol>

      <VCol cols="12" md="4">
        <VCard>
          <VCardItem class="d-flex flex-wrap justify-space-between gap-4">
            <VCardTitle>Resumen por Contratista</VCardTitle>
          </VCardItem>
          <VCardText>
            <barrasApiladas :api-data="datosParaBarrasApiladas" />
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <VRow>
      <!-- 👉 Lista de Proyectos sin Actualización -->
      <VCol cols="12" md="8">
        <ProjectListActualizacion :projects="projectListActualizacion" />
      </VCol>

      <!-- 👉 Gráfico de Proyectos por Contratista -->
      <VCol cols="12" md="4">
        <ProjectsByContractorChart
          :data="projectListActualizacionChart"
          class="h-100"
        />
      </VCol>
    </VRow>
  </div>
</template>

<script setup>
import { VCol, VRow } from "vuetify/components";
import KpiCard from "./components/KpiCard.vue";
import ProjectStatusTable from "./components/ProjectStatusTable.vue";
import ProjectsByContractorChart from "./components/ProjectsByContractorChart.vue";
import ProjectsByRegionChart from "./components/ProjectsByRegionChart.vue";
import ProjectListActualizacion from "./components/ProjectListActualizacion.vue";
import barrasApiladas from "./components/barrasApiladas.vue";
import CardStatisticsSalesOverview from "./components/CardStatisticsSalesOverview.vue";
import { useDashboard } from "./useDashboard.js";
import { useKpiCard } from "./usekpicard.js";
import { useProjectStatusTable } from "./useProjectStatusTable.js";
import { useProjectListActualizacion } from "./useProjectListActualizacion.js";
import { useProjectListActualizacionChart } from "./useProjectsByContractorChart";
 

const { graficosData, proyectosSinAvance } = useDashboard();
const { kpiData } = useKpiCard();
const { proyectosData } = useProjectStatusTable();
const { projectListActualizacion } = useProjectListActualizacion();
const { projectListActualizacionChart } = useProjectListActualizacionChart();

// Aquí defines o recibes de tu API el JSON para el gráfico de barras
const datosParaBarrasApiladas = {
  labels: ["DOMINION", "COBRA", "COMFICA"],
  datasets: [
    {
      label: "Total",
      backgroundColor: "#4f5d70",
      data: [1, 1, 2],
    },
    {
      label: "Trabajados",
      backgroundColor: "#f39c12",
      data: [0, 0, 0],
    },
    {
      label: "Pendientes",
      backgroundColor: "#e74c3c",
      data: [1, 1, 2],
    },
  ],
};
</script>
