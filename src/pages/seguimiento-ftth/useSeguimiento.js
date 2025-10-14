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
  const selectedDespliegue = ref(null);
  const selectedEnlace = ref(null);
  const sortBy = ref('avance_total');
  const sortDesc = ref(true);

  const opcionesOrden = [
    { text: 'Última Actualización', value: 'ultima_actualizacion' },
    { text: 'Mayor Avance', value: 'avance_total' },
  ];
  
  // --- Listas para los nuevos filtros ---
  const listaDespliegues = ref([]);
  const listaEnlaces = ref([]);

  // --- Lista de EECCs, despliegues y enlaces (se cargan una sola vez) ---
  const listaEECCs = ref([]);
  async function fetchEECCs() {
    try {
      // Solicitamos todos los datos sin paginar para obtener valores únicos para filtros
      // Añadimos parámetro especial "all=true" para intentar obtener todos los registros sin filtros implícitos
      // Y un perPage muy alto para asegurar que obtenemos todos los datos
      const response = await $api(`internodal/reporte/reporte-avance-tramos?all=true&perPage=1000`, { 
        method: 'GET' 
      });
      
      console.log('Respuesta para cargar filtros:', response);
      
      if (response.success) {
        const allItems = response.result.items || response.result; // Compatible con ambas estructuras de respuesta
        console.log(`Total de registros obtenidos para filtros: ${allItems.length}`);
        
        // Extraer valores únicos para cada filtro
        const eeccs = new Set(allItems.map(item => item.eecc));
        listaEECCs.value = Array.from(eeccs).filter(Boolean); // Elimina nulos o vacíos
        
        // Extraer valores únicos para desplieges_router
        const despliegues = new Set(allItems.map(item => item.desplieges_router));
        listaDespliegues.value = Array.from(despliegues).filter(Boolean).sort();
        console.log('Valores únicos de despliegues:', listaDespliegues.value);
        
        // Extraer valores únicos para enlace
        const enlaces = new Set(allItems.map(item => item.enlace));
        listaEnlaces.value = Array.from(enlaces).filter(Boolean).sort();
        console.log('Valores únicos de enlaces:', listaEnlaces.value);
      }
    } catch (error) {
      console.error("Error al cargar listas de filtros:", error);
    }
  }

  // --- Función para analizar la distribución de despliegues y enlaces ---
  async function analizarDistribucion() {
    try {
      // Solicitamos todos los datos sin paginar 
      const response = await $api(`internodal/reporte/reporte-avance-tramos?all=true&perPage=1000`, { 
        method: 'GET' 
      });
      
      if (response.success) {
        const allItems = response.result.items || response.result;
        
        // Análisis de distribución de despliegues
        const distribucionDespliegues = {};
        allItems.forEach(item => {
          const valor = item.desplieges_router || 'null/undefined';
          distribucionDespliegues[valor] = (distribucionDespliegues[valor] || 0) + 1;
        });
        console.log('Distribución de valores de desplieges_router:', distribucionDespliegues);
        
        // Análisis de distribución de enlaces
        const distribucionEnlaces = {};
        allItems.forEach(item => {
          const valor = item.enlace || 'null/undefined';
          distribucionEnlaces[valor] = (distribucionEnlaces[valor] || 0) + 1;
        });
        console.log('Distribución de valores de enlace:', distribucionEnlaces);
      }
    } catch (error) {
      console.error("Error al analizar distribución:", error);
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
      if (selectedDespliegue.value) params.append('desplieges_router', selectedDespliegue.value);
      if (selectedEnlace.value) params.append('enlace', selectedEnlace.value);
      if (sortBy.value) params.append('sortBy', sortBy.value);
      params.append('sortOrder', sortDesc.value ? 'desc' : 'asc');

      // Loguear los parámetros enviados
      console.log('Parámetros de filtrado enviados:', params.toString());
      console.log('Filtro despliegue seleccionado:', selectedDespliegue.value);

      const response = await $api(`internodal/reporte/reporte-avance-tramos?${params.toString()}`, {
        method: 'GET',
      });

      // Log de la respuesta
      console.log('Respuesta del backend:', response);

      if (response.success && response.result) {
        itemsList.value = response.result.items || [];
        
        // Si estamos filtrando por despliegue, verificamos los resultados
        if (selectedDespliegue.value) {
          console.log(`Filtrando por despliegue: "${selectedDespliegue.value}"`);
          console.log(`Resultados encontrados: ${itemsList.value.length}`);
          
          // Verificamos si los resultados tienen el valor de despliegue esperado
          const desplieguesEnResultados = new Set(itemsList.value.map(item => item.desplieges_router));
          console.log('Valores de despliegue en los resultados:', Array.from(desplieguesEnResultados));
        }
        
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
  watch([searchQuery, selectedEECC, selectedStatus, selectedUpdateTime, selectedDespliegue, selectedEnlace, sortBy, sortDesc], () => {
    currentPage.value = 1;
    listar_asignaciones();
  });

  // Cuando cambia la página, solo recargamos
  watch(currentPage, listar_asignaciones);

  // --- Carga inicial de datos ---
  onMounted(() => {
    fetchEECCs();
    listar_asignaciones();
    // Ejecutamos el análisis de distribución para diagnóstico
    analizarDistribucion();
  });

  return {
    // Estado
    isPageLoading, itemsList, listaEECCs, listaDespliegues, listaEnlaces,
    // Filtros
    searchQuery, selectedEECC, selectedStatus, selectedUpdateTime, selectedDespliegue, selectedEnlace,
    // Ordenamiento
    sortBy, sortDesc, opcionesOrden,
    // Paginación
    currentPage, itemsPerPage, totalItems, totalPages,
    // Funciones
    listar_asignaciones
  };
}