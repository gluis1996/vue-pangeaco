<template>
  <VDialog :model-value="open" max-width="600" @update:model-value="v => emit('update:open', v)">
    <VCard>
      <VCardTitle class="text-h6">Registrar Despliegue</VCardTitle>

      <VCardText>
        <VRow dense>
          <VCol cols="12" md="6">
            <VTextField label="ID Proyecto" :model-value="idProyecto" readonly density="compact" />
          </VCol>

          <VCol cols="12" md="6">
            <VTextField v-model="form.diseno"  label="Diseño" density="compact" />
          </VCol>

          <VCol cols="12" md="6">
            <VTextField v-model="form.pext" label="Pex" density="compact" />
          </VCol>

          <VCol cols="12" md="6">
            <VTextField v-model="form.integracion_internodal" label="Integracion Intermodal" density="compact" />
          </VCol>
        </VRow>
      </VCardText>

      <VCardActions class="justify-end">
        <VBtn variant="text" @click="onCancel">Cancelar</VBtn>
        <VBtn color="primary" @click="onSubmit">{{ props.isEdit ? 'Editar' : 'Guardar' }}</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<script setup>
import { reactive, watch } from 'vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  idProyecto: { type: [String, Number], default: '' },
  initial: { type: Object, default: () => ({}) },
  isEdit: { type: Boolean, default: false },
})
const emit = defineEmits(['update:open', 'submit', 'cancel'])

const defaultForm = () => ({
  diseno: '',
  pext: '',
  integracion_internodal: '',
})
const form = reactive(defaultForm())

// Reset / Prefill cada vez que cambie initial o idProyecto
watch(
  () => [props.initial, props.idProyecto, props.open],
  () => {
    Object.assign(form, defaultForm(), props.initial || {})
  },
  { immediate: true, deep: true }
)

function onSubmit () {
  emit('submit', { id_proyecto: props.idProyecto, ...form, isEdit: props.isEdit})
  emit('update:open', false)
}

function onCancel () {
  emit('cancel')
  emit('update:open', false)
}
</script>
