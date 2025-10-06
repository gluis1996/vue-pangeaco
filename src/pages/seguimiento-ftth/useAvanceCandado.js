import { $api } from "@/utils/api";
import { ref } from "vue";

export function useAvanceCandado(opciones) {
  const { snackbar, idSeleccionado, onSuccess } = opciones;
  const openDialogCandado = ref(false);
  const candadosData = ref([]);
  const currentTramoId = ref(null); // ← Agregar esta variable
  
  async function cargarCandado(item) {
    // Lógica para cargar el candado
    currentTramoId.value = item.id; // ← Guardar el ID para recargas
    openDialogCandado.value = true;
    console.log('🔄 Cargando candados para tramo ID:', item.id);
    try{
      // Simulamos una llamada a la API
      const response = await $api(`/internodal/candado/buscar-candado/${item.id}`,{
        method: 'GET',
        onResponseError({ response }) {
          console.error('Error en la respuesta del API:', response._data);
        }
      })
      candadosData.value = response;
      console.log(response);
    }catch(error){
        console.log(error);
    }
  }

  // Función para manejar cuando se sube una foto desde el componente
  async function onFotoSubida(payload) {
    console.log('🔄 onFotoSubida ejecutándose...');
    console.log('📦 Payload recibido:', payload);
    
    // 1. VALIDAR QUE LLEGARON TODOS LOS DATOS NECESARIOS
    if (!payload) {
      console.error('❌ Error: No se recibió payload');
      if (snackbar) {
        snackbar.add({
          text: 'Error: No se recibieron datos',
          color: 'error'
        });
      }
      return;
    }

    const { candadoId, file, serial, id_proyecto_tramo } = payload;

    // 2. VALIDAR CADA CAMPO REQUERIDO
    const validaciones = [
      { campo: 'candadoId', valor: candadoId, tipo: 'number' },
      { campo: 'file', valor: file, tipo: 'object' },
      { campo: 'serial', valor: serial, tipo: 'string' },
      { campo: 'id_proyecto_tramo', valor: id_proyecto_tramo, tipo: 'number' }
    ];

    for (const validacion of validaciones) {
      if (!validacion.valor) {
        console.error(`❌ Error: ${validacion.campo} es requerido`);
        if (snackbar) {
          snackbar.add({
            text: `Error: ${validacion.campo} es requerido`,
            color: 'error'
          });
        }
        return;
      }
    }

    // 3. VALIDAR QUE EL ARCHIVO SEA UNA IMAGEN
    if (!file.type || !file.type.startsWith('image/')) {
      console.error('❌ Error: El archivo debe ser una imagen');
      if (snackbar) {
        snackbar.add({
          text: 'Error: El archivo debe ser una imagen',
          color: 'error'
        });
      }
      return;
    }

    // 4. VALIDAR TAMAÑO DEL ARCHIVO (ejemplo: máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB en bytes
    if (file.size > maxSize) {
      console.error('❌ Error: El archivo es demasiado grande (máximo 5MB)');
      if (snackbar) {
        snackbar.add({
          text: 'Error: El archivo es demasiado grande (máximo 5MB)',
          color: 'error'
        });
      }
      return;
    }

    // 5. MOSTRAR INFORMACIÓN DETALLADA DE LO QUE SE VA A ENVIAR
    console.log('✅ Validaciones pasadas. Datos a enviar:');
    console.log('   📋 Candado ID:', candadoId);
    console.log('   📷 Archivo:', file.name);
    console.log('   📏 Tamaño:', (file.size / 1024 / 1024).toFixed(2), 'MB');
    console.log('   🏷️ Tipo:', file.type);
    console.log('   🔢 Serial:', serial);
    console.log('   🎯 Proyecto/Tramo:', id_proyecto_tramo);

    try {
      // 6. PREPARAR FormData PARA ENVÍO
      const formData = new FormData();
      formData.append('foto', file);
      formData.append('candado_id', candadoId);
      formData.append('id_proyecto_tramo', id_proyecto_tramo);
      formData.append('serial', serial);

      console.log('📤 Enviando a API...');
      
      // 7. LLAMAR A CALLBACKS DE PROGRESO SI EXISTEN
      if (payload.onProgress) {
        payload.onProgress(0);
      }

      // 8. HACER LA LLAMADA A LA API (descomenta cuando tengas el endpoint)
      
      const uploadResponse = await $api('/internodal/candado/actualizar-avance-candado', {
        method: 'POST',
        body: formData,
        onUploadProgress: (progress) => {
          if (payload.onProgress) {
            payload.onProgress(Math.round((progress.loaded / progress.total) * 100));
          }
        }
      });
      
      console.log('✅ Respuesta de la API:', uploadResponse);
      

      // 9. SIMULAR PROGRESO POR AHORA
      const simularProgreso = () => {
        let progreso = 0;
        const interval = setInterval(() => {
          progreso += 20;
          if (payload.onProgress) {
            payload.onProgress(progreso);
          }
          
          if (progreso >= 100) {
            clearInterval(interval);
            
            // 10. LLAMAR CALLBACK DE ÉXITO
            if (payload.onSuccess) {
              payload.onSuccess();
            }
            
            // 11. RECARGAR DATOS
            recargarCandados();
            
            // 12. MOSTRAR NOTIFICACIÓN DE ÉXITO
            if (snackbar) {
              snackbar.add({
                text: `✅ Foto del candado ${serial} subida correctamente`,
                color: 'success'
              });
            }
            
            console.log('🎉 Subida simulada completada exitosamente');
          }
        }, 500);
      };

      simularProgreso();
      
    } catch (error) {
      console.error('❌ Error al subir foto:', error);
      
      // 13. LLAMAR CALLBACK DE ERROR
      if (payload.onError) {
        payload.onError(error.message || 'Error desconocido');
      }
      
      // 14. MOSTRAR NOTIFICACIÓN DE ERROR
      if (snackbar) {
        snackbar.add({
          text: 'Error al subir la foto',
          color: 'error'
        });
      }
    }
  }

  // Función para recargar los candados después de subir una foto
  async function recargarCandados() {
    if (currentTramoId.value) {
      try {
        console.log('🔄 Recargando candados para tramo:', currentTramoId.value);
        
        const response = await $api(`/internodal/candado/buscar-candado/${currentTramoId.value}`, {
          method: "GET",
        });
        
        candadosData.value = response;
        console.log('✅ Candados recargados:', response);
        
      } catch (error) {
        console.error('❌ Error al recargar candados:', error);
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
