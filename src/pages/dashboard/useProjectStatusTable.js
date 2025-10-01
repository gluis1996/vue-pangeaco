import { $api } from "@/utils/api";
import { onMounted, ref } from "vue";

export function useProjectStatusTable() {
  const proyectosData = ref([]);

  async function fetchProyectos() {
    try {
        const response = await $api('/internodal/reporte/avance-promedio-proyecto');
        // console.log(response);
        proyectosData.value = response.data; 
    } catch (error) {
        console.log(error);
    }
  }
  onMounted(fetchProyectos);
  return {
    fetchProyectos,
    proyectosData,
  };
}
