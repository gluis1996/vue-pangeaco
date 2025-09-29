import { ref } from 'vue';
import { $api } from '@/utils/api';

export function useAvanceDialog(isPageLoading, onDataUpdated) {
  const isDialogVisible = ref(false);
  const detalleData = ref(null);

  const listar_detalle = async (item) => {
    isPageLoading.value = true;
    try {
      const response = await $api(`internodal/trabajos/listar-trabajos-tecnico-mufas/${item}`, {
        method: 'GET',
        onResponseError({ response }) {
          console.error('Error en la respuesta del API:', response._data);
        }
      });

      if (response.trabajo) {
        response.trabajos = response.trabajo;
        delete response.trabajo;
      }
      
      detalleData.value = response;
      isDialogVisible.value = true;
    } catch (error) {
      console.error('Error al listar el detalle:', error);
    } finally {
      isPageLoading.value = false;
    }
  }

  return {
    isDialogVisible,
    detalleData,
    listar_detalle,
  };
}