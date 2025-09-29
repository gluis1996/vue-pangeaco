import { ref } from "vue";

export function useTrabajoDialog(option) {
  const { idSeleccionado, onSuccess } = option;

  const openTrabajos = ref(false);
  const datosParaEditar = ref({});
  const trabajosParaDialogo = ref([]);
  const isPageLoading = ref(false);
  const snackbar = reactive({
    show: false,
    message: "",
    color: "",
  });
  async function abrirTrabajos(data) {
    isPageLoading.value = true;
    idSeleccionado.value = data.id;
    console.log(data);

    try {
      // 1. Cargar los trabajos existentes para este proyecto
      const response = await $api(
        `internodal/trabajos/listar-trabajos-tecnico-mufas/${data.id}`,
        { method: "GET" }
      );

      if (response.mensaje) {
        response.trabajos = response.trabajo;
        delete response.trabajo;
      }
      trabajosParaDialogo.value = response;

      // 3. Abrir el diálogo
      openTrabajos.value = true;
    } catch (error) {
      console.error("Error al cargar los trabajos del proyecto:", error);
    } finally {
      isPageLoading.value = false;
    }
  }

  async function onTrabajoDialogSubmit(payload) {
    console.log("Payload del diálogo de trabajos:", payload);

    isPageLoading.value = true;
    openTrabajos.value = false;

    try {
      // 1. Separar los trabajos en dos grupos: los que tienen ID (para actualizar) y los que no (para crear).
      const trabajosParaActualizar = [];
      const trabajosParaCrear = [];

      payload.medidas.forEach((medida) => {
        const trabajo = {
          id_tramo: payload.id_tramos,
          tipo_id: medida.id_tipo,
          total: Number(medida.total) || null,
          trabajados: Number(medida.trabajado) || null,
        };

        if (medida.id) {
          // Si tiene ID, es para actualizar
          trabajo.id = medida.id;
          trabajosParaActualizar.push(trabajo);
        } else {
          // Si no tiene ID, es para crear
          trabajosParaCrear.push(trabajo);
        }
      });

      // 2. Realizar las llamadas a la API correspondientes.
      if (trabajosParaActualizar.length > 0) {
        await $api("internodal/trabajos/actualizar-trabajos", {
          method: "PUT",
          body: trabajosParaActualizar,
        });
      }
      console.log('este es el trabajo para crear', trabajosParaCrear);
      
      if (trabajosParaCrear.length > 0) {
        await $api("internodal/trabajos/registrar-trabajos", {
          method: "POST",
          body: trabajosParaCrear,
        });
      }

      snackbar.message = "Trabajos guardados correctamente.";
      snackbar.color = "info";
      snackbar.show = true;

      if (onSuccess) {
        await onSuccess(); // ✨ Llamamos al callback
      }
    } catch (error) {
      console.error("Error al guardar trabajos:", error);
      snackbar.message = "Error al guardar los trabajos.";
      snackbar.color = "error";
      snackbar.show = true;
    } finally {
      isPageLoading.value = false;
    }
  }

  return {
    abrirTrabajos,
    onTrabajoDialogSubmit,
    openTrabajos,
    trabajosParaDialogo,
    snackbar,
    idSeleccionado,
  };
}
