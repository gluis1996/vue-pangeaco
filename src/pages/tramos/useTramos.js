import { ref, reactive, computed, onMounted } from 'vue';
import { $api } from '@/utils/api';

/**
 * @description Composable para gestionar la lógica de la página de Tramos.
 */
export function useTramos() {
  // =================================================================
  // State
  // =================================================================
  const lista_tramos = ref([]); // Almacena la lista original de tramos obtenida de la API.
  const isLoading = ref(false);
  const error = ref(null);
  const filtros = reactive({
    searchQuery: '',
    selectedEstado: null,
    selectedAsignado: null,
  });

  // =================================================================
  // API Calls
  // =================================================================
  /**
   * Carga la lista de tramos desde el backend.
   */
  async function cargarTramos() {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await $api('internodal/tramo-salto/listar-tramos', { method: 'GET' });
      lista_tramos.value = response.rows || [];
    } catch (e) {
      error.value = 'Error al cargar los tramos.';
      console.error('Error fetching tramos:', e);
    } finally {
      isLoading.value = false;
    }
  }

  // =================================================================
  // Lifecycle Hooks
  // =================================================================
  onMounted(cargarTramos);

  // =================================================================
  // Computed Properties
  // =================================================================
  /**
   * Extrae los estados únicos de la lista de tramos para usarlos en el filtro de selección.
   */
  const estadosUnicos = computed(() => {
    const estados = new Set(lista_tramos.value.map(item => item.estado));
    return Array.from(estados).filter(Boolean);
  });

  /**
   * Aplica los filtros y el ordenamiento a la lista de tramos.
   * Esta es la lista que se pasa finalmente a la tabla para ser renderizada.
   */
  const filteredTramos = computed(() => {
    return lista_tramos.value
      .filter(item => {
        // Filtro por búsqueda de texto
        const searchMatch = !filtros.searchQuery || Object.values(item).some(val => String(val).toLowerCase().includes(filtros.searchQuery.toLowerCase()));
        // Filtro por estado
        const estadoMatch = !filtros.selectedEstado || item.estado === filtros.selectedEstado;
        // Filtro por asignación
        const asignadoMatch = !filtros.selectedAsignado || (item.asignado === 1 || item.asignado === true) === (filtros.selectedAsignado === 'Asignado');
        
        return searchMatch && estadoMatch && asignadoMatch;
      })
      .sort((a, b) => {
        // Ordena por id_proyecto y luego por el campo 'orden'
        if (a.id_proyecto < b.id_proyecto) return -1;
        if (a.id_proyecto > b.id_proyecto) return 1;
        return a.orden - b.orden;
      });
  });

  // Exponemos el estado y las funciones que el componente necesitará
  return {
    filtros,
    estadosUnicos,
    filteredTramos,
    isLoading,
    error,
    cargarTramos, // ✨ Exportamos la función para que el componente la pueda usar
  };
}