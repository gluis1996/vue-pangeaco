import { ref } from "vue";

export function useAsignacion(opciones) {
  const { idSeleccionado, snackbar, onSuccess } = opciones;
  const openAsignar = ref(false); // Controla si el diálogo está abierto
  const tramoParaAsignar = ref(null); // Almacena los datos del tramo seleccionado
  const ipAsignada = ref(""); // Almacena la IP asignada temporalmente
  async function abrirDialogoAsignar(tramo) {
    const response = await $api(
      `internodal/tramo-salto/buscar-detalle-tramo/${tramo.id}`,
      { method: "GET" }
    );

    tramoParaAsignar.value = response.rows[0]; // Asignamos los datos del tramo seleccionado
    ipAsignada.value = tramo.ip_tramo || ""; // Inicializamos con la IP actual si existe
    openAsignar.value = true;
  }

  async function guardarAsignacion({ id, ip }) {
    try {
      // Endpoint para actualizar la IP y marcar como asignado
      const response = await $api(
        `internodal/tramo-salto/asignacion-proyecto-contrata/${id}`,
        {
          method: "PUT",
          body: { ip: ip },
        }
      );
      if (response.success) {
        snackbar.message = "Proyecto asignado correctamente.";
        snackbar.color = "secondary";
        snackbar.show = true;
      } else {
        // Si la API devuelve success: false pero no lanza un error
        snackbar.message =
          response.message || "No se pudo completar la asignación.";
        snackbar.color = "error";
        snackbar.show = true;
      }
    } catch (error) {
      console.error("Error al guardar la asignación:", error);
      snackbar.message = "Error al guardar la asignación.";
      snackbar.color = "error";
      snackbar.show = true;
    } finally {
      openAsignar.value = false;
      if (onSuccess) {
        await onSuccess(); // ✨ Llamamos al callback
      }
    }
  }

  return {
    abrirDialogoAsignar,
    guardarAsignacion,
    openAsignar,
    tramoParaAsignar, // Exponemos el tramo para usarlo en el template
    snackbar,
    ipAsignada,
  };
}
