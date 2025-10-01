import { $api } from "@/utils/api";
import { icon } from "@/views/components/badge/demoCodeBadge";
import { ref, onMounted } from "vue";

export function useKpiCard() {
  const kpiData = ref([]);

  
  async function kpiMetricaGlobal() {
    try {
      const response = await $api("/internodal/reporte/reporte-metrica-globales");
      // Asumimos que la respuesta ya es el objeto con los datos
      if (response) {
        const kp = response.data[0];
        kpiData.value = [
          {nombre: kp.nombreP, valor: kp.proyectos_totales, icon: 'ri-briefcase-4-line', color: 'primary'},
          {nombre: kp.nombrePT, valor: kp.proyectos_terminados, icon: 'ri-task-line', color: 'success'},
          {nombre: kp.nombreTT, valor: kp.tramos_totales, icon: 'ri-route-line', color: 'info'},
          {nombre: kp.nombreTP, valor: kp.tramos_pendientes, icon: 'ri-loader-2-line', color: 'warning'},
          {nombre: kp.nobreSA, valor: kp.sin_actualizar, icon: 'ri-error-warning-line', color: 'error'},
        ];
      }
    } catch (e) {
      error.value = "Error al cargar las métricas globales.";
      console.error(e);
    } 
  }

  onMounted(kpiMetricaGlobal);

  return {
    kpiMetricaGlobal, // Opcional, por si quieres recargar manualmente
    kpiData,
  };
}
