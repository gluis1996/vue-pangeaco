<template>
  <VDialog 
    :model-value="open" 
    max-width="1200" 
    @update:model-value="v => emit('update:open', v)"
  >
    <VCard>
      <VCardTitle class="text-h6">Registrar/Editar Despliegue</VCardTitle>

      <FormDiseno v-model="form" />

      <VCardActions class="justify-end">
        <VBtn variant="text" @click="onCancel">Cancelar</VBtn>
        <VBtn color="primary" @click="onSubmit">{{ props.isEdit ? 'Editar' : 'Guardar' }}</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<script setup>
import { reactive, watch } from 'vue'
import FormDiseno from '@/pages/intermodal-base-interna/components/FormDiseno.vue'


const props = defineProps({
  open: { type: Boolean, default: false },
  idProyecto: { type: [String, Number], default: '' },
  initial: { type: Object, default: () => ({}) },
  isEdit: { type: Boolean, default: false },
})
const emit = defineEmits(['update:open', 'submit', 'cancel'])

const defaultForm = () => ({
  estado_diseño: '',
  distancia: '',
  aereo: '',
  sub_c_red: '',
  sub_s_red: '',
  tramo: '', // Aunque es calculado, es bueno tenerlo para el reseteo
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
