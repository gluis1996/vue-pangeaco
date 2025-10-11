import { set } from "@vueuse/core";
import { ref } from "vue";

export const useFiabilidadTecnica = (item) => {
  const { dialogRef, isPageLoading, snackbar } = item;
  const fiabilidadData = ref(null);
  const listaBusqueda = ref([]);
  const openFiabilidad = ref(false);

  const cargarFiabilidad = async (item) => {
    console.log(item);

    try {
      const response = await $api(
        `internodal/fiabilidad/buscar-fiabilidades/${item.id}`,
        {
          method: "GET",
          onResponseError: (response) => {
            console.error("Error en la respuesta:", response);
            snackbar.message =
              response._data?.message ||
              "Error al cargar la fiabilidad técnica";
            snackbar.color = "error";
            snackbar.show = true;
          },
        }
      );
      if (!response.success) {
        console.log(response);
        snackbar.message = "Error al cargar la fiabilidad técnica";
        snackbar.color = "error";
        snackbar.show = true;
      }
      console.log("los datos para la tabla son : ", response.data);

      fiabilidadData.value = item;
      listaBusqueda.value = response.data || [];
      snackbar.message = `Se cargaron ${response.cant || 0} registros`;
      snackbar.color = "default";
      snackbar.show = true;
    } catch (error) {
      console.log(error);
      snackbar.message = "Error al cargar la fiabilidad técnica";
      snackbar.color = "error";
      snackbar.show = true;
    } finally {
      openFiabilidad.value = true;
    }
  };

  const registrarFiabilidad = async (data) => {
    isPageLoading.value = true;
    delete data.id; // Asegurarse de que no haya ID para creación
    try {
      const response = await $api(
        `internodal/fiabilidad/registrar-fiabilidad`,
        {
          method: "POST",
          body: data,
          onResponseError: (response) => {
            console.error("Error en la respuesta:", response);
            snackbar.message =
              response._data?.message || "Error al registrar la fiabilidad";
            snackbar.color = "error";
            snackbar.show = true;
          },
        }
      );

      if (!response.success) {
        console.log(response);
        snackbar.message =
          response.message || "Error al registrar la fiabilidad";
        snackbar.color = "error";
        snackbar.show = true;
        return;
      }

      console.log("Registro exitoso", response);

      await recargarDatos();

      snackbar.message = response.message || "Fiabilidad registrada con éxito";
      snackbar.color = "default";
      snackbar.show = true;
    } catch (error) {
      snackbar.message = error.message || "Error al registrar la fiabilidad";
      snackbar.color = "error";
      snackbar.show = true;
    } finally {
      isPageLoading.value = false;
      dialogRef.value?.showTable();
    }
  };

  const actualizarFiabilidad = async (data) => {
    console.log(data);
    isPageLoading.value = true;

    try {
      const response = await $api(
        `internodal/fiabilidad/actualizar-fiabilidad/${data.id}`,
        {
          method: "PUT",
          body: data,
          onResponseError: (response) => {
            console.error("Error en la respuesta:", response);
            snackbar.message =
              response._data?.message || "Error al actualizar la fiabilidad";
            snackbar.color = "error";
            snackbar.show = true;
          },
        }
      );

      if (!response.success) {
        console.log(response);
        snackbar.message =
          response.message || "Error al actualizar la fiabilidad";
        snackbar.color = "error";
        snackbar.show = true;
        return;
      }

      console.log("Actualización exitosa", response);

      await recargarDatos();

      snackbar.message = response.message || "Fiabilidad actualizada con éxito";
      snackbar.color = "default";
      snackbar.show = true;
    } catch (error) {
      snackbar.message = error.message || "Error al actualizar la fiabilidad";
      snackbar.color = "error";
      snackbar.show = true;
    } finally {
      isPageLoading.value = false;
      dialogRef.value?.showTable();
    }
  };

  const eliminarFiabilidad = async (data) => {
    console.log(data);
    isPageLoading.value = true;
    try {
      const response = await $api(
        `internodal/fiabilidad/eliminar-fiabilidad/${data.id}`,
        {
          method: "DELETE",
          onResponseError: (response) => {
            console.error("Error en la respuesta:", response);
            snackbar.message =
              response._data?.message || "Error al eliminar la fiabilidad";
            snackbar.color = "error";
            snackbar.show = true;
          },
        }
      );
      if (!response.success) {
        console.log(response);
        snackbar.message =
          response.message || "Error al eliminar la fiabilidad";
        snackbar.color = "error";
        snackbar.show = true;
        return;
      }

      console.log("Eliminación exitosa", response);

      await recargarDatos();

      snackbar.message = response.message || "Fiabilidad eliminada con éxito";
      snackbar.color = "default";
      snackbar.show = true;
    } catch (error) {
      snackbar.message = error.message || "Error al eliminar la fiabilidad";
      snackbar.color = "error";
      snackbar.show = true;
    } finally {
      isPageLoading.value = false;
      dialogRef.value?.showTable();
    }
  };

  // Nueva función para recargar los datos
  const recargarDatos = async () => {
    try {
      const response = await $api(
        `internodal/fiabilidad/buscar-fiabilidades/${fiabilidadData.value.id}`,
        {
          method: "GET",
          onResponseError: (response) => {
            console.error("Error al recargar datos:", response);
          },
        }
      );

      if (response.success) {
        listaBusqueda.value = response.data || [];
      }
    } catch (error) {
      console.error("Error al recargar datos:", error);
    }
  };

  return {
    openFiabilidad,
    fiabilidadData,
    listaBusqueda,
    cargarFiabilidad,
    registrarFiabilidad,
    actualizarFiabilidad,
    eliminarFiabilidad,
  };
};
