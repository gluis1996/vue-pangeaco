import { ref } from "vue";

export function useCandados(opciones) {
  const { idSeleccionado, onSuccess } = opciones;
  const openCandados = ref(false);
  const lista_candado_buscado = ref([]);
  async function abrirCandados(item) {
    console.log("abrir candados para el tramo:", item);
    idSeleccionado.value = item.id;
    try {
      const response = await $api(`/internodal/candado/buscar-candado/${item.id}`, {
        method: "GET",
      });
      if (!response.success) {
        console.log("Error al obtener candados:", response.error);        
      }
      console.log("candados obtenidos:", response.data);
      lista_candado_buscado.value = response.data;
    } catch (error) {
      console.log(error);      
    }

    openCandados.value = true;
  }

  async function registrarCandados(data) {
    console.log("datos para guardar candados:", data);
    try {
      const response = await $api("/internodal/candado/registrar-candado", {
        method: "POST",
        body: data,
      });
      console.log("respuesta al guardar candados:", response);
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
