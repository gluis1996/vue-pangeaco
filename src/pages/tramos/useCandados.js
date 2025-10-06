import { ref } from "vue";

export function useCandados(opciones) {
  const { idSeleccionado, onSuccess, snackbar } = opciones;
  const openCandados = ref(false);
  const lista_candado_buscado = ref([]);

  async function abrirCandados(item) {
    console.log("abrir candados para el tramo:", item);
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
      console.log("candados obtenidos:", response.data);
      lista_candado_buscado.value = response;
    } catch (error) {
      console.log(error);
    }

    openCandados.value = true;
  }

  async function registrarFoto(datos) {
     // Debug al inicio
    console.log('Recibido en función:', datos);
    console.log('datos.foto es File?:', datos.foto instanceof File);
    console.log('Tipo de datos.foto:', typeof datos.foto);
    
    if (!(datos.foto instanceof File)) {
        console.error('❌ datos.foto NO es un File object!');
        return;
    }
    
    try {
      const formData = new FormData();
      formData.append("foto", datos.foto); // ← File object
      formData.append("id_proyecto_tramo", datos.id_proyecto_tramo);
      formData.append("isEdit", datos.isEdit);
      
      const response = await $api("/internodal/candado/registrar-foto-candado",{
          method: "POST",
          body: formData,}
      );

      if (response.success){
        snackbar.message = response.message || "Foto guardada correctamente.";
        snackbar.color = "secondary";
        snackbar.show = true;
      }
    } catch (error) {
      snackbar.message = response.error || "Error al guardar la foto.";
      snackbar.color = "error";
      snackbar.show = true;
    }
  }

  async function registrarCandados(data) {
    // Si el objeto 'data' contiene 'foto_file', es una subida de foto.
    if (data.foto) {
      return registrarFoto(data);
    }

    try {
      const response = await $api("/internodal/candado/registrar-candado", {
        method: "POST",
        body: data,
      });
      if (response.message === "Candado registrado correctamente") {
        openCandados.value = false;
        if (onSuccess) {
          await onSuccess(); // ✨ Llamamos al callback
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
      console.log(error);
    }
  }

  return {
    abrirCandados,
    registrarCandados,
    lista_candado_buscado,
    openCandados,
  };
}
