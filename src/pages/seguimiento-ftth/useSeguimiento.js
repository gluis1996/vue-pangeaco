import { ref, computed, onMounted } from 'vue';
import { $api } from '@/utils/api';

export function useSeguimiento() {
  const lista_asignacion = ref([]);
  const isPageLoading = ref(false);
  const searchQuery = ref('');
  const selectedEECC = ref(null);
  const selectedStatus = ref(null);
  const sortBy = ref('ultima_actualizacion');
  const sortDesc = ref(true);

  const opcionesOrden = [
    { text: 'Última Actualización', value: 'ultima_actualizacion' },
    { text: 'Mayor Avance', value: 'avance_total' },
  ];

  async function listar_asignaciones() {
    isPageLoading.value = true;
    try {
      const response = await $api(`internodal/reporte/reporte-avance-tramos`, {
        method: 'GET',
      });
      lista_asignacion.value = response.result || [];
    } catch (error) {
      console.error("Error al listar asignaciones:", error);
      lista_asignacion.value = [];
    } finally {
      isPageLoading.value = false;
    }
  }

  onMounted(listar_asignaciones);

  const listaEECCs = computed(() => {
    const eeccs = new Set(lista_asignacion.value.map(item => item.eecc));
    return Array.from(eeccs).filter(Boolean);
  });

  const processedList = computed(() => {
    let items = [...lista_asignacion.value];

    if (searchQuery.value) {
      const lowerCaseQuery = searchQuery.value.toLowerCase();
      items = items.filter(item => {
        const ip = item.ip_tramo?.toLowerCase() || '';
        const eecc = item.eecc?.toLowerCase() || '';
        const principal = item.principal?.toLowerCase() || '';
        const tramo = item.tramo?.toLowerCase() || '';
        return ip.includes(lowerCaseQuery) || eecc.includes(lowerCaseQuery) || principal.includes(lowerCaseQuery) || tramo.includes(lowerCaseQuery);
      });
    }

    if (selectedEECC.value) {
      items = items.filter(item => item.eecc === selectedEECC.value);
    }

    if (selectedStatus.value) {
      switch (selectedStatus.value) {
        case 'Asignados':
          items = items.filter(item => item.asignado === 1 && item.ip_tramo);
          break;
        case 'Sin Asignar':
          items = items.filter(item => item.asignado === 0 || !item.ip_tramo);
          break;
      }
    }

    if (sortBy.value) {
      items.sort((a, b) => {
        let valA = a[sortBy.value];
        let valB = b[sortBy.value];

        if (sortBy.value === 'ultima_actualizacion') {
          const parseTime = (str) => {
            const parts = str.match(/(\d+)\s*días\s*(\d+)\s*horas\s*(\d+)\s*minutos/);
            if (!parts) return Infinity;
            return parseInt(parts[1]) * 24 * 60 + parseInt(parts[2]) * 60 + parseInt(parts[3]);
          };
          valA = parseTime(valA);
          valB = parseTime(valB);
        }

        if (valA < valB) return sortDesc.value ? 1 : -1;
        if (valA > valB) return sortDesc.value ? -1 : 1;
        return 0;
      });
    }
    return items;
  });

  return {
    isPageLoading, searchQuery, selectedEECC, selectedStatus, sortBy, sortDesc,
    opcionesOrden, listaEECCs, processedList, listar_asignaciones
  };
}