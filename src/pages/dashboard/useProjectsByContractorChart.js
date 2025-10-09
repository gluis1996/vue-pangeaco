import { onMounted, ref } from "vue";

export function useProjectListActualizacionChart() {
    const projectListActualizacionChart = ref([]);
    async function fetchProjectListActualizacion() {
        try {
            const response = await $api('/internodal/reporte/reporte-avance-por-contrata');
            projectListActualizacionChart.value = response.data;
        } catch (error) {
             
        }
    }
    onMounted(fetchProjectListActualizacion);
    return {
    projectListActualizacionChart,
  };

}