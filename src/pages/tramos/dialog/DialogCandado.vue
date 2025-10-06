<template>
  <VDialog
    :model-value="open"
    max-width="900px"
    @update:model-value="v => emit('update:open', v)"
  >
    <VCard>
      <v-card-title class="text-h6">
        {{ isEdit ? 'Editar' : 'Agregar' }} Candados al Tramo #{{ idProyecto }}
      </v-card-title>
      <VCardText>
        <FormCandado v-model="candados" />

        <VDivider class="my-4" />

        <h6 class="text-h6 mb-4">Foto General de los Candados</h6>
        
        <!-- El uploader de fotos ahora vive aquí directamente -->
        <FotoUploader
          :initial-foto-url="fotoGeneral.preview"
          @upload-foto="onUploadFoto"
        />
      </VCardText>
      <VCardActions class="justify-end">
        <VBtn variant="text" @click="onCancel">
          Cancelar
        </VBtn>
        <VBtn color="primary" @click="onSave">
          {{ isEdit ? 'Editar' : 'Guardar' }}
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import FormCandado from '../components/FormCandado.vue'
import FotoUploader from '../components/FotoUploader.vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  idProyecto: { type: [Number, String], default: 0 },
  initialData: { type: Object, default: () => ({ data: [], foto_general: null }) },
  isEdit: { type: Boolean, default: false },
})

const emit = defineEmits(['update:open', 'save', 'cancel'])

// Creamos variables reactivas para los datos del formulario
const candados = ref([])
const fotoGeneral = ref({ preview: null })

function onUploadFoto(file) {
  // Este evento se dispara desde FormCandado con el archivo a subir.
  // Aquí se llamaría a la API para subir la foto.
  // Por ahora, simulamos la subida y emitimos un evento 'save' solo para la foto.
  emit('save', {
    id_proyecto_tramo: props.idProyecto,
    foto: file,
    isEdit: props.isEdit, // Podrías necesitarlo para el endpoint
  })
  // Opcional: podrías cerrar el diálogo o mostrar una notificación de éxito aquí.
}

function onSave() {
  // Emitimos un objeto con todos los datos necesarios
  emit('save', {
    id_proyecto_tramo: props.idProyecto,
    candados: candados.value, // Ahora enviamos la lista completa de objetos
    foto_delete: !fotoGeneral.value.preview && props.initialData.some(item => item.foto_url),
    isEdit: props.isEdit,
  })
  emit('update:open', false)
}

function onCancel() {
  emit('cancel')
  emit('update:open', false)
}

// 4. Cuando el diálogo se abre, poblamos los datos. Cuando se cierra, los limpiamos.
watch(() => props.open, (isOpen) => {
  if (isOpen) {
    // Si initialData tiene la estructura de respuesta API completa
    const candadosData = props.initialData.data || props.initialData;
    
    // Mapeamos los datos de los candados (id y serial)
    candados.value = candadosData.map(item => ({
      id: item.id,
      serial: item.serial,
    }));

    // La foto_general está en el nivel raíz de la respuesta API
    const fotoUrlExistente = props.initialData.foto_general || null;

    // Poblamos el objeto de la foto para la previsualización inicial
    fotoGeneral.value = {
      preview: fotoUrlExistente,
    };
  } else {
    // Limpiamos los datos cuando el diálogo se cierra para el próximo uso.
    candados.value = [];
    fotoGeneral.value = { preview: null };
  }
}, { immediate: true })
</script>