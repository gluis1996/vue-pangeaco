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
          v-for="i in cantidad"
          :key="i"
          cols="12"
          sm="6"
          md="4"
        >
          <VTextField
            v-model="seriales[i - 1].serial"
            :label="`Serial Candado #${i}`"
            placeholder="S/N"
            density="compact"
          />
        </VCol>
      </VRow>
    </VCardText>
  </VCard>
</template>

<script setup>
import { ref, watch } from 'vue';

// --- Props y Emits ---
const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['update:modelValue']);

// --- Estado local ---
const cantidad = ref(0);
const seriales = ref([]);

// --- Lógica ---

// Observador para la cantidad:
// Cuando el número en "Cantidad de Candados" cambia,
// se ajusta la cantidad de inputs para los seriales.
watch(cantidad, newCantidad => {
  const num = Number(newCantidad) || 0;

  // Redimensionamos el array, manteniendo los valores existentes.
  // Ahora cada elemento es un objeto. Los nuevos no tienen 'id'.
  seriales.value = Array.from({ length: num }, (_, i) => seriales.value[i] || {
    id: null,
    serial: '',
  });
});

// Observador para los seriales:
// Cuando se escribe en cualquier input de serial,
// se emite la lista completa y actualizada al componente padre.
watch(seriales, newSeriales => {
  emit('update:modelValue', newSeriales);
}, { deep: true }); // 'deep' es crucial para detectar cambios dentro del array.

// --- Sincronización con el padre ---

// Observador para el modelValue (datos que vienen del padre):
// Cuando el padre nos pasa una nueva lista de seriales,
// actualizamos la cantidad y los inputs locales.
watch(() => props.modelValue, newModelValue => {
  // Solo actualizamos si el valor del padre es diferente al local para evitar bucles.
  if (JSON.stringify(newModelValue) !== JSON.stringify(seriales.value)) {
    // Hacemos una copia profunda para evitar mutaciones no deseadas
    const cleanData = JSON.parse(JSON.stringify(newModelValue));
    cantidad.value = cleanData.length;
    seriales.value = cleanData;
  }
}, { immediate: true });
</script>