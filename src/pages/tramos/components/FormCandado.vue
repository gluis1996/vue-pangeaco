<template>
  <VCard border flat>
    <VCardText>
      <h6 class="text-h6 mb-4">Números de Serie</h6>
      <!-- 1. Input para la cantidad -->
      <VTextField
        v-model.number="cantidad"
        label="Cantidad de Candados"
        type="number"
        placeholder="Ingrese un número"
        :min="1"
        clearable
        class="mb-4"
      />

      <!-- 3. Inputs dinámicos para los números de serie -->
      <VRow v-if="cantidad > 0">
        <VCol
          v-for="(item, index) in seriales"
          :key="index"
          cols="12"
          sm="6"
          md="4"
        >
          <div class="d-flex align-center gap-2">
            <VTextField
              v-model="item.serial"
              :label="`Serial Candado #${index + 1}`"
              placeholder="S/N"
              density="compact"
              class="flex-grow-1"
            />
            <VBtn
              color="error"
              icon="ri-delete-bin-2-line"
              size="small"
              @click="eliminarCandado(index, item.id)"
            />
          </div>
        </VCol>
      </VRow>
    </VCardText>
  </VCard>
</template>

<script setup>
import { $api } from "@/utils/api";
import { ref, watch } from "vue";

// --- Props y Emits ---
const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
  idProyectoTramo: {
    type: [Number, String],
    default: null,
  },
});

const emit = defineEmits([
  "update:modelValue",
  "candado-eliminado",
  "error-eliminacion",
]);

// --- Estado local ---
const cantidad = ref(0);
const seriales = ref([]);

// --- Lógica ---

// Observador para la cantidad:
// Cuando el número en "Cantidad de Candados" cambia,
// se ajusta la cantidad de inputs para los seriales.
watch(cantidad, (newCantidad) => {
  const num = Number(newCantidad) || 0;

  // Redimensionamos el array, manteniendo los valores existentes.
  // Ahora cada elemento es un objeto. Los nuevos no tienen 'id'.
  seriales.value = Array.from(
    { length: num },
    (_, i) =>
      seriales.value[i] || {
        id: null,
        serial: "",
      }
  );
});

// Observador para los seriales:
// Cuando se escribe en cualquier input de serial,
// se emite la lista completa y actualizada al componente padre.
watch(
  seriales,
  (newSeriales) => {
    emit("update:modelValue", newSeriales);
  },
  { deep: true }
); // 'deep' es crucial para detectar cambios dentro del array.

// --- Sincronización con el padre ---

// Observador para el modelValue (datos que vienen del padre):
// Cuando el padre nos pasa una nueva lista de seriales,
// actualizamos la cantidad y los inputs locales.
watch(
  () => props.modelValue,
  (newModelValue) => {
    // Solo actualizamos si el valor del padre es diferente al local para evitar bucles.
    if (JSON.stringify(newModelValue) !== JSON.stringify(seriales.value)) {
      // Hacemos una copia profunda para evitar mutaciones no deseadas
      const cleanData = JSON.parse(JSON.stringify(newModelValue));
      cantidad.value = cleanData.length;
      seriales.value = cleanData;
    }
  },
  { immediate: true }
);

async function eliminarCandado(index, candadoId) {
   

  // Si el candado tiene un ID (existe en la BD), intentamos eliminarlo del backend
  try {
    // Aquí iría la llamada a la API
    // await $axios.delete(`/api/candados/${candadoId}`);

    // Emitimos evento de éxito
    // emit('candado-eliminado', {
    //   id: candadoId,
    //   index,
    //   idProyectoTramo: props.idProyectoTramo
    // });
     

    const response = await $api(
      `/internodal/candado/borrar-candado/${candadoId}`,
      {
        method: "DELETE",
        onResponseError({ response }) {
           
        },
      }
    );
     
  } catch (error) {
    console.error("Error al eliminar el candado:", error);

    // Si hay error, salimos sin eliminar del array local
    return;
  }

  // Solo llegamos aquí si:
  // 1. No hay ID (candado nuevo, solo local)
  // 2. La eliminación del backend fue exitosa

  // Elimina el candado en la posición 'index'
  seriales.value.splice(index, 1);

  // Actualiza la cantidad automáticamente
  cantidad.value = seriales.value.length;

  // El watch() detecta el cambio y emite al padre automáticamente
   
}
</script>
