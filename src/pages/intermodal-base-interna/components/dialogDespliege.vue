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
            <VTextField v-model="form.despliegeRouter"  label="Despliege Router" density="compact" />
          </VCol>

          <VCol cols="12" md="6">
            <VTextField v-model="form.despliegue_enlace_internodal" label="Despliege E. I." density="compact" />
          </VCol>

          <VCol cols="12" md="6">
            <VTextField v-model="form.enlace" label="Enlace" density="compact" />
          </VCol>

          <VCol cols="12" md="6">
            <VTextField v-model="form.routers" label="Routers" density="compact" />
          </VCol>

          <VCol cols="12" md="6">
            <VTextField v-model="form.proveedor" label="Proveedor" density="compact" />
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
  despliegeRouter: '',
  despliegue_enlace_internodal: '',
  enlace: '',
  routers: '',
  proveedor: '',
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
