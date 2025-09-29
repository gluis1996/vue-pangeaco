<template>
  <VCard border flat>
    <VCardText>
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

      <!-- 2. Input para la foto general -->
      <VFileInput
        :model-value="fotoFile"
        label="Foto General de los Candados"
        accept="image/*"
        density="compact"
        prepend-icon="tabler-camera"
        class="mb-4"
        @update:model-value="handleFileChange"
        @click:clear="() => handleFileChange([])"
      />

      <!-- Previsualización de la foto -->
      <VImg
        v-if="fotoPreview"
        :src="fotoPreview"
        aspect-ratio="16/9"
        class="mb-4 border rounded"
        max-height="200"
        cover
        style="cursor: pointer;"
        @click="isPrevisualizacionDialogVisible = true"
      />

      <!-- Diálogo para previsualización a pantalla completa -->
      <VDialog
        v-model="isPrevisualizacionDialogVisible"
        max-width="900px"
      >
        <VCard>
          <VCardText class="pa-2">
            <VImg :src="fotoPreview" max-height="80vh" />
          </VCardText>
          <VCardActions>
            <VSpacer />
            <VBtn color="primary" @click="isPrevisualizacionDialogVisible = false">
              Cerrar
            </VBtn>
          </VCardActions>
        </VCard>
      </VDialog>

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
import { ref, watch, onBeforeUnmount } from 'vue';

// --- Props y Emits ---
// Este componente ahora usa dos v-model:
// 1. `modelValue` para la lista de candados (seriales).
// 2. `foto` para el archivo de la foto.
const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
  foto: {
    type: Object, // Espera un objeto { file: File | null, preview: string | null }
    default: () => ({ file: null, preview: null }),
  },
});

const emit = defineEmits(['update:modelValue', 'update:foto']);

// --- Estado local ---
const cantidad = ref(0);
const seriales = ref([]);
const fotoFile = ref([]); // Para el v-model de VFileInput (siempre espera un array)
const fotoPreview = ref(null);
const isPrevisualizacionDialogVisible = ref(false);

// Array para mantener un registro de las URLs de previsualización creadas
let previewUrl = null; // Solo necesitamos una URL ahora

// --- Lógica ---

function handleFileChange(files) {
  const file = files[0]; // VFileInput devuelve un array

  // Limpiamos la URL de previsualización anterior si existe
  if (previewUrl) {
    URL.revokeObjectURL(previewUrl);
    previewUrl = null;
  }

  if (file) {
    // Si hay un archivo, lo guardamos y creamos una URL de previsualización
    fotoFile.value = [file];
    previewUrl = URL.createObjectURL(file);
    fotoPreview.value = previewUrl;
    emit('update:foto', { file: file, preview: previewUrl });
  } else {
    // Si se limpia el archivo, reseteamos los valores
    fotoFile.value = [];
    fotoPreview.value = null;
    emit('update:foto', { file: null, preview: null });
  }
}

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

// Observador para la foto que viene del padre
watch(() => props.foto, newFoto => {
  // Sincronizamos la previsualización
  fotoPreview.value = newFoto?.preview || null;
  fotoFile.value = newFoto?.file ? [newFoto.file] : [];
}, { immediate: true });

// --- Limpieza ---
// Es importante liberar las URLs de previsualización para evitar fugas de memoria.
onBeforeUnmount(() => {
  if (previewUrl) {
    URL.revokeObjectURL(previewUrl);
  }
});

</script>