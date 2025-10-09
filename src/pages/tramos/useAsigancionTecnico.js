import { ref, nextTick } from "vue";
import { $api } from "@/utils/api";

export function useAsigancionTecnico(item) {
  const {
    openDialog,
    mensajeDialog,
    tituloDialog,
    valorDialog,
    isPageLoading,
    snackbar,
    onSuccess,
  } = item;

  async function abrirDialogoAsignarTecnico(item) {
    console.log("Abriendo diálogo de asignación de técnico...");
    console.log({ ...item, accion: "Asignar_tecnico_tramo" });
    openDialog.value = false; // Fuerza el cierre
    await nextTick(); // Espera a que Vue procese el DOM
    openDialog.value = true; // Ahora sí lo abre
    mensajeDialog.value =
      "¿Deseas asignar este tramo al tecnico : " + item.tecnico + "?";
    tituloDialog.value = "Asignar Técnico a Tramo";
    valorDialog.value = { ...item, accion: "Asignar_tecnico_tramo" };
  }

  async function asignacionTramoTecnico(datos) {
    console.log("Asignando técnico al tramo con datos:", datos);

    console.log("Simulando llamada a API para asignar técnico...");
    isPageLoading.value = true;

    try {
      const response = await $api(
        `/internodal/tramo-salto/asignacion-tramo-tecnico/${datos.id}`,
        {
          method: "PUT",
          body: { nombre_tecnico: datos.tecnico },
          onResponseError({ response }) {
            snackbar.message = response._data.message || "Error al asignar técnico.";
            snackbar.color = "error";
            snackbar.show = true;
          },
        }
      );
      if (response.success) {
        snackbar.message = "Técnico asignado correctamente.";
        snackbar.color = "default";
        snackbar.show = true;
      }
    } catch (error) {
      snackbar.message = "Error al asignar técnico.";
      snackbar.color = "error";
      snackbar.show = true;
    } finally {
      isPageLoading.value = false;
      if (onSuccess) {
        await onSuccess(); // ✨ Llamamos al callback
      }
    }
  }

  return {
    abrirDialogoAsignarTecnico,
    asignacionTramoTecnico,
  };
}
