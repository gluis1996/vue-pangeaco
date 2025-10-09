<template>
  <div>
    <!-- Sección para la foto -->
    <VRow align="center" class="mb-2">
      <VCol cols="12" sm="8">
        <VFileInput
          :model-value="fotoFile"
          label="Foto"
          accept="image/*"
          density="compact"
          prepend-icon="tabler-camera"
          @update:model-value="handleFileChange"
          @click:clear="() => handleFileChange([])"
        />
      </VCol>
      <VCol cols="12" sm="4">
        <VBtn
          color="primary"
          block
          :disabled="!fotoFile.length"
          @click="subirFoto"
        >
          Subir Foto
        </VBtn>
      </VCol>
    </VRow>

    <!-- Previsualización de la foto -->
    <div v-if="fotoPreview" class="mb-4">
      <VImg
        :src="fotoPreview"
        aspect-ratio="16/9"
        class="border rounded"
        max-height="200"
        cover
        style="cursor: pointer;"
        @click="isPrevisualizacionDialogVisible = true"
      />
      <!-- Botón de eliminar foto (solo cuando hay una foto inicial) -->
      <VBtn
        v-if="props.initialFotoUrl"
        color="error"
        size="small"
        variant="tonal"
        class="mt-2"
        prepend-icon="tabler-trash"
        @click="eliminarFoto"
      >
        Eliminar Foto
      </VBtn>
    </div>

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
  </div>
</template>

<script setup>
import { ref, watch, onBeforeUnmount } from 'vue';

// --- Props y Emits ---
const props = defineProps({
  initialFotoUrl: {
    type: String,
    default: null,
  },
});

const emit = defineEmits(['upload-foto', 'delete-foto']);

// --- Estado local ---
const fotoFile = ref([]); // Para el v-model de VFileInput (siempre espera un array)
const fotoPreview = ref(null);
const isPrevisualizacionDialogVisible = ref(false);
let previewUrl = null;

// --- Lógica ---
function subirFoto() {
  if (fotoFile.value.length > 0)
    emit('upload-foto', fotoFile.value[0]);
}

function eliminarFoto() {
  // Limpiar la previsualización
  fotoPreview.value = null;
  
  // Limpiar el archivo seleccionado
  fotoFile.value = [];
  
  // Limpiar la URL de preview si existe
  if (previewUrl) {
    URL.revokeObjectURL(previewUrl);
    previewUrl = null;
  }
  
  // Emitir evento para que el componente padre maneje la eliminación
  emit('delete-foto');
}

function handleFileChange(files) {
  const file = files?.[0];

  if (previewUrl) {
    URL.revokeObjectURL(previewUrl);
    previewUrl = null;
  }

  if (file) {
    fotoFile.value = [file];
    previewUrl = URL.createObjectURL(file);
    fotoPreview.value = previewUrl;
  } else {
    fotoFile.value = [];
    fotoPreview.value = props.initialFotoUrl;
  }
}

watch(() => props.initialFotoUrl, newUrl => {
  fotoPreview.value = newUrl;
}, { immediate: true });

onBeforeUnmount(() => {
  if (previewUrl) {
    URL.revokeObjectURL(previewUrl);
  }
});
</script>