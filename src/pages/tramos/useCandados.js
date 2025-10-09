import { ref } from "vue";
import { $api } from "@/utils/api";

export function useCandados(opciones) {
  const { idSeleccionado, onSuccess, snackbar, isPageLoading } = opciones;
  const openCandados = ref(false);
  const lista_candado_buscado = ref([]);

  async function abrirCandados(item) {
    idSeleccionado.value = item.id;
    try {
      const response = await $api(
        `/internodal/candado/buscar-candado/${item.id}`,
        {
          method: "GET",
        }
      );
      if (!response.success) {
        console.log("Error al obtener candados:", response.error);
      }
      lista_candado_buscado.value = response;
    } catch (error) {
      console.log(error);
    }

    openCandados.value = true;
  }

  async function registrarFoto(datos) {
    isPageLoading.value = true;
    if (!(datos.foto instanceof File)) {
      snackbar.message = "❌ datos.foto NO es un File object!";
      snackbar.color = "error";
      snackbar.show = true;
      return;
    }

    try {
      const formData = new FormData();
      formData.append("foto", datos.foto); // ← File object
      formData.append("id_proyecto_tramo", datos.id_proyecto_tramo);
      formData.append("isEdit", datos.isEdit);

      const response = await $api(
        "/internodal/candado/registrar-foto-candado",
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.success) {
        snackbar.message = response.message || "Foto guardada correctamente.";
        snackbar.color = "default";
        snackbar.show = true;
      }
    } catch (error) {
      snackbar.message = response.error || "Error al guardar la foto.";
      snackbar.color = "error";
      snackbar.show = true;
    } finally {
      isPageLoading.value = false;
    }
  }

  async function registrarCandados(data) {
    // ✅ Solo maneja candados, NO foto
    isPageLoading.value = true;
    try {
      const response = await $api("/internodal/candado/registrar-candado", {
        method: "POST",
        body: {
          id_proyecto_tramo: data.id_proyecto_tramo,
          candados: data.candados,
          isEdit: data.isEdit,
        },
      });

      if (response.message === "Candado registrado correctamente") {
        openCandados.value = false;
        if (onSuccess) {
          await onSuccess();
        }
        snackbar.message = "Candados guardados correctamente.";
        snackbar.color = "info";
        snackbar.show = true;
      } else {
        snackbar.message = response.error || "Error al guardar los candados.";
        snackbar.color = "error";
        snackbar.show = true;
      }
    } catch (error) {
      console.error("Error al guardar candados:", error);
      snackbar.message = "Error al guardar los candados.";
      snackbar.color = "error";
      snackbar.show = true;
    } finally {
      isPageLoading.value = false;
    }
  }

  async function eliminarFoto(datos) {
    isPageLoading.value = true;
    try {
      const response = await $api(
        `/internodal/candado/eliminar-candado-principal/${datos.id_proyecto_tramo}`,
        {
          method: "DELETE",
          onResponseError({ response }) {
            snackbar.message =
              response._data.message || "Error al eliminar la foto.";
            snackbar.color = "error";
            snackbar.show = true;
          },
        }
      );
      if (response.success) {
        snackbar.message = response.message || "Foto eliminada correctamente.";
        snackbar.color = "default";
        snackbar.show = true;
      }
    } catch (error) {
      console.error("Error al eliminar la foto:", error);
      snackbar.message = "Error al eliminar la foto.";
      snackbar.color = "error";
      snackbar.show = true;
    } finally {
      isPageLoading.value = false;
    }
  }

  return {
    abrirCandados,
    registrarCandados,
    registrarFoto,
    eliminarFoto,
    lista_candado_buscado,
    openCandados,
  };
}
