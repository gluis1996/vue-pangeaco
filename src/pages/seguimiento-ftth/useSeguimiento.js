import { ref, computed, onMounted, watch } from 'vue';
import { $api } from '@/utils/api';

/**
 * Parsea una cadena de tiempo en formato "X días Y horas Z minutos" a un total de minutos.
 * @param {string} str - La cadena de tiempo a parsear.
 * @returns {number} El número total de minutos, o Infinity si el formato es inválido.
 */
const parseTime = (str) => {
  if (!str) return Infinity;
  const parts = str.match(/(\d+)\s*días\s*(\d+)\s*horas\s*(\d+)\s*minutos/);
  if (!parts) return Infinity;
  return parseInt(parts[1]) * 24 * 60 + parseInt(parts[2]) * 60 + parseInt(parts[3]);
};

export function useSeguimiento() {
  // --- Estado para los datos y la paginación ---
  const itemsList = ref([]);
  const totalItems = ref(0);
  const totalPages = ref(1);
  const itemsPerPage = ref(6); // Puedes ajustar este valor
  const currentPage = ref(1);

  // --- Estado para los filtros y ordenamiento ---
  const isPageLoading = ref(false);
  const searchQuery = ref('');
  const selectedEECC = ref(null);
  const selectedStatus = ref(null);
  const selectedUpdateTime = ref(null);
  const sortBy = ref('avance_total');
  const sortDesc = ref(true);

  const opcionesOrden = [
    { text: 'Última Actualización', value: 'ultima_actualizacion' },
    { text: 'Mayor Avance', value: 'avance_total' },
  ];

  // --- Lista de EECCs (se carga una sola vez) ---
  const listaEECCs = ref([]);
  async function fetchEECCs() {
    try {
      // Obtenemos la lista completa de tramos sin paginación para extraer las EECCs únicas.
      // El backend debería ignorar 'page' y 'perPage' si se le pide una lista completa.
      // O, idealmente, tener un endpoint específico para esto.
      // Como solución, pedimos todos los items para derivar las EECCs.
      const response = await $api(`internodal/reporte/reporte-avance-tramos`, { method: 'GET' });
      if (response.success) {
        const allItems = response.result.items || response.result; // Compatible con ambas estructuras de respuesta
        const eeccs = new Set(allItems.map(item => item.eecc));
        listaEECCs.value = Array.from(eeccs).filter(Boolean); // Elimina nulos o vacíos
      }
    } catch (error) {
      console.error("Error al cargar lista de EECCs:", error);
    }
  }

  // --- Función principal para obtener los datos ---
  async function listar_asignaciones() {
    isPageLoading.value = true;
    try {
      // Construimos los parámetros de la URL
      const params = new URLSearchParams();
      params.append('page', currentPage.value);
      params.append('perPage', itemsPerPage.value);
      if (searchQuery.value) params.append('search', searchQuery.value);
      if (selectedEECC.value) params.append('eecc', selectedEECC.value);
      if (selectedStatus.value) params.append('status', selectedStatus.value === 'Asignados' ? 'asignado' : 'sin_asignar');
      if (selectedUpdateTime.value) params.append('updateTime', selectedUpdateTime.value === '< 24h' ? 'lt24h' : 'gt24h');
      if (sortBy.value) params.append('sortBy', sortBy.value);
      params.append('sortOrder', sortDesc.value ? 'desc' : 'asc');

      const response = await $api(`internodal/reporte/reporte-avance-tramos?${params.toString()}`, {
        method: 'GET',
      });

      if (response.success && response.result) {
        itemsList.value = response.result.items || [];
        const { pagination } = response.result;
        totalItems.value = pagination.totalItems || 0;
        totalPages.value = pagination.totalPages || 1;
        currentPage.value = pagination.currentPage || 1;
      }
    } catch (error) {
      console.error("Error al listar asignaciones:", error);
      itemsList.value = [];
    } finally {
      isPageLoading.value = false;
    }
  }

  // --- Observadores para reaccionar a los cambios ---
  // Cuando cambia un filtro, volvemos a la página 1 y recargamos
  watch([searchQuery, selectedEECC, selectedStatus, selectedUpdateTime, sortBy, sortDesc], () => {
    currentPage.value = 1;
    listar_asignaciones();
  });

  // Cuando cambia la página, solo recargamos
  watch(currentPage, listar_asignaciones);

  // --- Carga inicial de datos ---
  onMounted(() => {
    fetchEECCs();
    listar_asignaciones();
  });

  return {
    // Estado
    isPageLoading, itemsList, listaEECCs,
    // Filtros
    searchQuery, selectedEECC, selectedStatus, selectedUpdateTime,
    // Ordenamiento
    sortBy, sortDesc, opcionesOrden,
    // Paginación
    currentPage, itemsPerPage, totalItems, totalPages,
    // Funciones
    listar_asignaciones
  };
}