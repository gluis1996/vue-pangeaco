import { $api } from "@/utils/api";
import { ref } from "vue";

export function useAvanceCandado(opciones) {
  const { snackbar, idSeleccionado, onSuccess } = opciones;
  const openDialogCandado = ref(false);
  const candadosData = ref([]);
  const currentTramoId = ref(null); // ← Agregar esta variable
  
  async function cargarCandado(item) {
    currentTramoId.value = item.id;
    openDialogCandado.value = true;
    
    try{
      const response = await $api(`/internodal/candado/buscar-candado/${item.id}`,{
        method: 'GET',
        onResponseError({ response }) {
          // Error manejado por el API
        }
      })
      candadosData.value = response;
    }catch(error){
      // Error manejado silenciosamente
    }
  }

  async function onFotoSubida(payload) {
    if (!payload) {
      if (snackbar) {
        snackbar.add({
          text: 'Error: No se recibieron datos',
          color: 'error'
        });
      }
      return;
    }

    const { candadoId, file, serial, id_proyecto_tramo } = payload;

    const validaciones = [
      { campo: 'candadoId', valor: candadoId, tipo: 'number' },
      { campo: 'file', valor: file, tipo: 'object' },
      { campo: 'serial', valor: serial, tipo: 'string' },
      { campo: 'id_proyecto_tramo', valor: id_proyecto_tramo, tipo: 'number' }
    ];

    for (const validacion of validaciones) {
      if (!validacion.valor) {
        if (snackbar) {
          snackbar.add({
            text: `Error: ${validacion.campo} es requerido`,
            color: 'error'
          });
        }
        return;
      }
    }

    if (!file.type || !file.type.startsWith('image/')) {
      if (snackbar) {
        snackbar.add({
          text: 'Error: El archivo debe ser una imagen',
          color: 'error'
        });
      }
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      if (snackbar) {
        snackbar.add({
          text: 'Error: El archivo es demasiado grande (máximo 5MB)',
          color: 'error'
        });
      }
      return;
    }

    try {
      const formData = new FormData();
      formData.append('foto', file);
      formData.append('candado_id', candadoId);
      formData.append('id_proyecto_tramo', id_proyecto_tramo);
      formData.append('serial', serial);

      if (payload.onProgress) {
        payload.onProgress(0);
      }

      const uploadResponse = await $api('/internodal/candado/actualizar-avance-candado', {
        method: 'POST',
        body: formData,
        onUploadProgress: (progress) => {
          if (payload.onProgress) {
            payload.onProgress(Math.round((progress.loaded / progress.total) * 100));
          }
        }
      });

      const simularProgreso = () => {
        let progreso = 0;
        const interval = setInterval(() => {
          progreso += 20;
          if (payload.onProgress) {
            payload.onProgress(progreso);
          }
          
          if (progreso >= 100) {
            clearInterval(interval);
            
            if (payload.onSuccess) {
              payload.onSuccess();
            }
            
            recargarCandados();
            
            if (snackbar) {
              snackbar.add({
                text: `✅ Foto del candado ${serial} subida correctamente`,
                color: 'success'
              });
            }
          }
        }, 500);
      };

      simularProgreso();
      
    } catch (error) {
      if (payload.onError) {
        payload.onError(error.message || 'Error desconocido');
      }
      
      if (snackbar) {
        snackbar.add({
          text: 'Error al subir la foto',
          color: 'error'
        });
      }
    }
  }

  async function recargarCandados() {
    if (currentTramoId.value) {
      try {
        const response = await $api(`/internodal/candado/buscar-candado/${currentTramoId.value}`, {
          method: "GET",
        });
        
        candadosData.value = response;
        
      } catch (error) {
        // Error manejado silenciosamente
      }
    }
  }

  return {
    openDialogCandado,
    candadosData,
    cargarCandado,
    onFotoSubida,
    recargarCandados,
  };
}
