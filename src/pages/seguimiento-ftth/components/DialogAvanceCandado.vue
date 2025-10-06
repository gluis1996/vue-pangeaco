<template>
  <VDialog
    :model-value="open"
    max-width="1200px"
    @update:model-value="(v) => emit('update:open', v)"
  >
    <VCard>
      <v-card-title class="text-h6">
        Registrar Avance de Candados - Tramo #
      </v-card-title>
      
      <VCardText>
        <!-- Lista de candados -->
        <VRow>
          <VCol
            v-for="candado in candados"
            :key="candado.id"
            cols="12"
            sm="6"
            md="4"
          >
            <VCard
              :class="[
                'candado-card cursor-pointer',
                candado.uploading ? 'border-info' : 
                candado.upload_success ? 'border-success pulse-success' :
                candado.upload_error ? 'border-error pulse-error' :
                candado.foto_pendiente ? 'border-purple' :
                candado.foto_avance ? 'border-success' : 'border-warning'
              ]"
              elevation="2"
              @click="!candado.uploading && !candado.foto_pendiente && seleccionarCandado(candado)"
            >
              <VCardText class="text-center pa-4 position-relative">
                
                <!-- Loading overlay durante subida -->
                <VOverlay
                  v-if="candado.uploading"
                  contained
                  class="d-flex align-center justify-center"
                  opacity="0.8"
                >
                  <div class="text-center">
                    <VProgressCircular
                      :model-value="candado.upload_progress"
                      size="64"
                      width="6"
                      color="primary"
                    >
                      {{ candado.upload_progress }}%
                    </VProgressCircular>
                    <p class="text-caption mt-2 text-white">Subiendo...</p>
                  </div>
                </VOverlay>

                <!-- Preview de imagen seleccionada con controles -->
                <div v-if="candado.preview_local" class="mb-3">
                  <VImg
                    :src="candado.preview_local"
                    height="120"
                    class="rounded"
                    cover
                  />
                  
                  <!-- Botones de control si está pendiente -->
                  <div v-if="candado.foto_pendiente" class="mt-3 d-flex gap-2 justify-center">
                    <VBtn
                      color="success"
                      size="small"
                      variant="elevated"
                      @click.stop="confirmarEnvioFoto(candado.id)"
                    >
                      <VIcon icon="tabler-upload" start />
                      Enviar
                    </VBtn>
                    <VBtn
                      color="error"
                      size="small"
                      variant="outlined"
                      @click.stop="cancelarFoto(candado.id)"
                    >
                      <VIcon icon="tabler-x" start />
                      Cambiar
                    </VBtn>
                  </div>
                </div>

                <!-- Icono de estado -->
                <VIcon
                  :icon="getStatusIcon(candado)"
                  :color="getStatusColor(candado)"
                  size="48"
                  class="mb-2"
                />
                
                <!-- Serial del candado -->
                <h6 class="text-h6 mb-2">{{ candado.serial }}</h6>
                
                <!-- Estado dinámico -->
                <VChip
                  :color="getStatusColor(candado)"
                  size="small"
                  class="mb-2"
                >
                  {{ getStatusText(candado) }}
                </VChip>

                <!-- Instrucción para foto pendiente -->
                <div v-if="candado.foto_pendiente" class="mt-2">
                  <VAlert
                    type="info"
                    density="compact"
                    class="text-caption"
                  >
                    Revisa la foto y decide si enviar o cambiar
                  </VAlert>
                </div>

                <!-- Mensaje de error si existe -->
                <div v-if="candado.upload_error" class="mt-2">
                  <VAlert
                    type="error"
                    density="compact"
                    class="text-caption"
                  >
                    Error: {{ candado.error_message }}
                  </VAlert>
                </div>
                
                <!-- Botón ver foto si existe -->
                <div v-if="candado.foto_avance && !candado.preview_local" class="mt-2">
                  <VBtn
                    size="small"
                    color="primary"
                    variant="text"
                    @click.stop="verFoto(candado.foto_avance)"
                  >
                    Ver Foto
                  </VBtn>
                </div>

                <!-- Badge de éxito animado -->
                <VIcon
                  v-if="candado.upload_success"
                  icon="tabler-check-circle"
                  color="success"
                  size="32"
                  class="success-badge"
                />
              </VCardText>
            </VCard>
          </VCol>
        </VRow>
        
        <!-- Input de archivo oculto -->
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          style="display: none"
          @change="onFileSelected"
        />
      </VCardText>
      
      <VCardActions class="justify-end">
        <VBtn variant="text" @click="onCancel">
          Cancelar
        </VBtn>
        <VBtn color="primary" @click="onSave">
          Cerrar
        </VBtn>
      </VCardActions>
    </VCard>
    
    <!-- Dialog para ver foto -->
    <VDialog
      v-model="dialogFoto"
      max-width="800px"
    >
      <VCard>
        <VCardTitle>Vista de Foto</VCardTitle>
        <VCardText class="pa-0">
          <VImg
            :src="fotoVisualizacion"
            max-height="600px"
            contain
          />
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn color="primary" @click="dialogFoto = false">
            Cerrar
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </VDialog>
</template>

<script setup>
import { ref, watch, computed } from "vue";

const props = defineProps({
  open: { type: Boolean, default: false },
  candadosData: {
    type: Object,
    default: () => ({ data: [], foto_general: null })
  }
});

const emit = defineEmits([
  "update:open", 
  "cancel", 
  "foto-subida" // { candadoId, file }
]);

// Estados reactivos
const fileInput = ref(null);
const candadoSeleccionado = ref(null);
const dialogFoto = ref(false);
const fotoVisualizacion = ref('');
const candadosLocales = ref([]);

// Computed para obtener candados con estados locales
const candados = computed(() => {
  const apiCandados = props.candadosData?.data || [];
  
  // Combinar datos de API con estados locales
  return apiCandados.map(candado => {
    const local = candadosLocales.value.find(c => c.id === candado.id) || {};
    return {
      ...candado,
      ...local, // Estados locales como uploading, preview_local, etc.
    };
  });
});

// Función para seleccionar un candado y abrir selector de archivos
function seleccionarCandado(candado) {
  candadoSeleccionado.value = candado;
  fileInput.value?.click();
}

// Función cuando se selecciona un archivo
function onFileSelected(event) {
  const file = event.target.files[0];
  
  if (file && candadoSeleccionado.value) {
    const candadoId = candadoSeleccionado.value.id;
    
    // Crear preview local inmediato SIN subir aún
    const previewUrl = URL.createObjectURL(file);
    
    // Actualizar estado local del candado con la foto seleccionada
    updateCandadoLocal(candadoId, {
      uploading: false,
      preview_local: previewUrl,
      file_selected: file, // Guardamos el archivo para subir después
      foto_pendiente: true // Flag para mostrar botones de acción
    });
    
    // Limpiar el input para permitir seleccionar otra foto
    event.target.value = '';
    candadoSeleccionado.value = null;
  }
}

// Nueva función para confirmar y enviar la foto
function confirmarEnvioFoto(candadoId) {
  const candadoLocal = candadosLocales.value.find(c => c.id === candadoId);
  const candadoOriginal = props.candadosData?.data?.find(c => c.id === candadoId);
  
  if (!candadoLocal || !candadoLocal.file_selected || !candadoOriginal) return;
  
  // Cambiar a estado de subida
  updateCandadoLocal(candadoId, {
    uploading: true,
    foto_pendiente: false,
    upload_progress: 0
  });
  
  // Emitir los datos correctos del candado original + foto
  const payloadToEmit = {
    candadoId: candadoOriginal.id,           // ← ID del candadosData
    file: candadoLocal.file_selected,        // ← Archivo seleccionado
    serial: candadoOriginal.serial,          // ← Serial del candadosData
    id_proyecto_tramo: candadoOriginal.id_proyecto_tramo, // ← Datos adicionales si los necesitas
    onProgress: (progress) => updateUploadProgress(candadoId, progress),
    onSuccess: () => onUploadSuccess(candadoId),
    onError: (error) => onUploadError(candadoId, error)
  };
  
  emit('foto-subida', payloadToEmit);
}

// Nueva función para cancelar/cambiar foto
function cancelarFoto(candadoId) {
  const candadoLocal = candadosLocales.value.find(c => c.id === candadoId);
  
  // Liberar memoria del preview
  if (candadoLocal && candadoLocal.preview_local) {
    URL.revokeObjectURL(candadoLocal.preview_local);
  }
  
  // Limpiar estado local
  const index = candadosLocales.value.findIndex(c => c.id === candadoId);
  if (index >= 0) {
    candadosLocales.value.splice(index, 1);
  }
}

// Función para actualizar estado local de un candado
function updateCandadoLocal(candadoId, updates) {
  const index = candadosLocales.value.findIndex(c => c.id === candadoId);
  
  if (index >= 0) {
    // Actualizar candado existente
    candadosLocales.value[index] = { ...candadosLocales.value[index], ...updates };
  } else {
    // Agregar nuevo candado local
    candadosLocales.value.push({ id: candadoId, ...updates });
  }
}

// Función para actualizar progreso de subida
function updateUploadProgress(candadoId, progress) {
  updateCandadoLocal(candadoId, { upload_progress: progress });
}

// Función cuando la subida es exitosa
function onUploadSuccess(candadoId) {
  updateCandadoLocal(candadoId, {
    uploading: false,
    upload_success: true,
    upload_progress: 100
  });
  
  // Limpiar preview local después de 2 segundos para mostrar la nueva foto de la API
  setTimeout(() => {
    updateCandadoLocal(candadoId, {
      preview_local: null,
      upload_success: false
    });
  }, 2000);
}

// Función cuando hay error en la subida
function onUploadError(candadoId, error) {
  updateCandadoLocal(candadoId, {
    uploading: false,
    upload_error: true,
    error_message: error
  });
  
  // Limpiar error después de 5 segundos
  setTimeout(() => {
    updateCandadoLocal(candadoId, {
      upload_error: false,
      error_message: null,
      preview_local: null
    });
  }, 5000);
}

// Función para ver una foto existente
function verFoto(fotoUrl) {
  fotoVisualizacion.value = fotoUrl;
  dialogFoto.value = true;
}

// Helper functions para estados dinámicos
function getStatusIcon(candado) {
  if (candado.uploading) return 'tabler-upload';
  if (candado.upload_success) return 'tabler-check-circle';
  if (candado.upload_error) return 'tabler-alert-circle';
  if (candado.foto_avance) return 'tabler-check-circle';
  return 'tabler-camera';
}

function getStatusColor(candado) {
  if (candado.uploading) return 'info';
  if (candado.upload_success) return 'success';
  if (candado.upload_error) return 'error';
  if (candado.foto_avance) return 'success';
  if (candado.foto_pendiente) return 'purple';
  return 'warning';
}

function getStatusText(candado) {
  if (candado.uploading) return 'Subiendo...';
  if (candado.upload_success) return '¡Subida Exitosa!';
  if (candado.upload_error) return 'Error en Subida';
  if (candado.foto_avance) return 'Foto Registrada';
  if (candado.foto_pendiente) return 'Foto Seleccionada';
  return 'Sin Foto';
}

function onSave() {
  limpiarEstadosLocales();
  emit("update:open", false);
}

function onCancel() {
  limpiarEstadosLocales();
  emit("cancel");
  emit("update:open", false);
}

// Limpiar todos los estados locales al cerrar
function limpiarEstadosLocales() {
  candadosLocales.value.forEach(candado => {
    if (candado.preview_local) {
      URL.revokeObjectURL(candado.preview_local);
    }
  });
  candadosLocales.value = [];
}

// Watch para detectar cambios en los datos
watch(() => props.candadosData, (newData) => {
  // Los datos se actualizan automáticamente
}, { immediate: true });
</script>

<style scoped>
.candado-card {
  transition: all 0.3s ease;
  border: 2px solid transparent;
  position: relative;
}

.candado-card:hover:not(.uploading) {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.border-success {
  border-color: rgb(var(--v-theme-success)) !important;
}

.border-warning {
  border-color: rgb(var(--v-theme-warning)) !important;
}

.border-info {
  border-color: rgb(var(--v-theme-info)) !important;
}

.border-error {
  border-color: rgb(var(--v-theme-error)) !important;
}

.border-purple {
  border-color: rgb(var(--v-theme-purple)) !important;
}

.cursor-pointer {
  cursor: pointer;
}

/* Animaciones de pulso para feedback */
.pulse-success {
  animation: pulse-success 1.5s ease-in-out infinite;
}

.pulse-error {
  animation: pulse-error 1.5s ease-in-out infinite;
}

@keyframes pulse-success {
  0% { border-color: rgb(var(--v-theme-success)); }
  50% { 
    border-color: rgba(var(--v-theme-success), 0.5);
    box-shadow: 0 0 20px rgba(var(--v-theme-success), 0.3);
  }
  100% { border-color: rgb(var(--v-theme-success)); }
}

@keyframes pulse-error {
  0% { border-color: rgb(var(--v-theme-error)); }
  50% { 
    border-color: rgba(var(--v-theme-error), 0.5);
    box-shadow: 0 0 20px rgba(var(--v-theme-error), 0.3);
  }
  100% { border-color: rgb(var(--v-theme-error)); }
}

/* Badge de éxito animado */
.success-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  animation: bounce-in 0.6s ease-out;
}

@keyframes bounce-in {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* Estado de subida */
.uploading {
  cursor: not-allowed !important;
  opacity: 0.8;
}

/* Overlay mejorado */
.v-overlay--contained {
  border-radius: inherit;
}
</style>
