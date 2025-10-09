import { $api } from "@/utils/api";
import { reactive, ref } from "vue";

export function useTramoDialog(opciones) {
  const { idSeleccionado,snackbar, onSuccess,isPageLoading } = opciones;
  const openLicencia = ref(false);
  const lista_data = ref([]);
  const licenciasDelProyecto = ref([]);
  const currentUser = ref([]);


  async function recibirIdDesdeTabla(value) {
    isPageLoading.value = true;
    // Maneja si 'value' es un objeto o solo el ID
    const tramoId = typeof value === 'object' && value !== null ? value.id : value;
    const tramoData = typeof value === 'object' && value !== null ? value : {};

    idSeleccionado.value = tramoId;
    lista_data.value = tramoData;

    try {
      if (tramoData.cant_licencia > 0) {
        const response = await $api(
          `/internodal/licencia/buscar-licencia/${tramoId}`,
          {
            method: "GET",
          }
        );
        licenciasDelProyecto.value = response.response;
      } else {
        licenciasDelProyecto.value = [];
      }
    } catch (error) {
       
    } finally {
      isPageLoading.value = false;
    }
    openLicencia.value = true;
  }

  async function crearLicencia(data) {
    if (data.licencias.length === 0) {
      snackbar.message = "No hay licencias para guardar.";
      snackbar.color = "error";
      snackbar.show = true;
      return;
    }
    if (data.isedit) {
      await editar(data.licencias);
    } else {
      await guardar(data.licencias);
    }
  }

  const guardar = async (data) => {
    isPageLoading.value = true;

    try {
      const response = await $api("/internodal/licencia/registrar-licencia", {
        method: "POST",
        body: data,
        onResponseError({ response }) {
           
          snackbar.message =
            response._data?.error || "Ocurrió un error inesperado.";
          snackbar.color = "error";
          snackbar.show = true;
        },
      });
       
      
      if (response.success) {
        snackbar.message = "Licencias guardadas correctamente.";
        snackbar.color = "info";
        snackbar.show = true;
        openLicencia.value = false;
        if (onSuccess) {
          await onSuccess(); // ✨ Llamamos al callback
        }
      }
    } catch (error) {
       
      snackbar.message = "No se pudo conectar con el servidor. Inténtalo de nuevo más tarde.";
      snackbar.color = "error";
      snackbar.show = true;
    } finally {
      isPageLoading.value = false;
    }
  };

  const editar = async (data) => {
    isPageLoading.value = true;
    try {
      const response = await $api("/internodal/licencia/actualizar-registrar-licencias",{
          method: "PUT",
          body: data,
          onResponseError({ response }) {
             
            snackbar.message =
              response._data?.error || "Ocurrió un error inesperado.";
            snackbar.color = "error";
            snackbar.show = true;
          },
        }
      );
      if (response.success) {
        snackbar.message = "Licencias actualizadas correctamente.";
        snackbar.color = "info";
        snackbar.show = true;
        openLicencia.value = false;
        if (onSuccess) {
          await onSuccess(); // ✨ Llamamos al callback
        }
      }
    } catch (error) {
       
      snackbar.message = "No se pudo conectar con el servidor. Inténtalo de nuevo más tarde.";
      snackbar.color = "error";
      snackbar.show = true;
    }finally{
      isPageLoading.value = false;
    }
  };

  return {
    recibirIdDesdeTabla,
    crearLicencia,
    openLicencia,
    idSeleccionado,
    lista_data,
    licenciasDelProyecto,
    currentUser,
    snackbar,
    isPageLoading,
  };
}
