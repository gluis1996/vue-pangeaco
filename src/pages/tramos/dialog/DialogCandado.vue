<template>
  <VDialog
    :model-value="open"
    max-width="800px"
    @update:model-value="v => emit('update:open', v)"
  >
    <VCard>
      <v-card-title class="text-h6">
        {{ isEdit ? 'Editar' : 'Agregar' }} Candados al Tramo #{{ idProyecto }}
      </v-card-title>
      <VCardText>
        <!-- Usamos v-model para los candados y v-model:foto para la foto -->
        <FormCandado v-model="candados" v-model:foto="fotoGeneral" />
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

const props = defineProps({
  open: { type: Boolean, default: false },
  idProyecto: { type: [Number, String], default: 0 },
  initialData: { type: Array, default: () => [] },
  isEdit: { type: Boolean, default: false },
})

const emit = defineEmits(['update:open', 'save', 'cancel'])

// Creamos variables reactivas para los datos del formulario
const candados = ref([])
const fotoGeneral = ref({ file: null, preview: null })

function onSave() {
  // Emitimos un objeto con todos los datos necesarios
  emit('save', {
    id_proyecto_tramo: props.idProyecto,
    candados: candados.value, // Ahora enviamos la lista completa de objetos
    // Enviamos el archivo de la foto si existe
    foto_file: fotoGeneral.value.file,
    // Si no hay un archivo nuevo pero había una foto antes, no la borramos.
    // Si el usuario borra la foto, fotoGeneral.preview será null.
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
    // Mapeamos los datos de los candados (id y serial)
    candados.value = props.initialData.map(item => ({
      id: item.id,
      serial: item.serial,
    }));

    // Buscamos la URL de la foto general. Asumimos que si existe,
    // es la misma para todos los candados del grupo.
    const fotoUrlExistente = props.initialData.find(item => item.foto_url)?.foto_url || null;

    // Poblamos el objeto de la foto para la previsualización inicial
    fotoGeneral.value = {
      file: null, // El archivo no se carga, solo la URL de previsualización
      preview: fotoUrlExistente,
    };
  } else {
    // Limpiamos los datos cuando el diálogo se cierra para el próximo uso.
    candados.value = [];
    fotoGeneral.value = { file: null, preview: null };
  }
}, { immediate: true })
</script>