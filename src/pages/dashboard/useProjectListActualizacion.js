import { onMounted, ref } from "vue";

export function useProjectListActualizacion() {
  const projectListActualizacion = ref([]);

  async function fetchProjectListActualizacion() {
    try {
        const response = await $api('/internodal/reporte/avance-promedio-tamos-asignados');
        projectListActualizacion.value = response.data;
    } catch (error) {
        console.log(error);
        
    }
  }
  onMounted(fetchProjectListActualizacion);
  return {
    projectListActualizacion,
  };
}