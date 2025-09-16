<template>
  <VDialog :model-value="open" max-width="600" @update:model-value="v => emit('update:open', v)">
    <VCard>
      <VCardTitle class="text-h6">Registrar/Editar Distancia</VCardTitle>

      <VCardText>
        <VRow dense>
          <VCol cols="12" md="6">
            <VTextField label="ID Proyecto" :model-value="idProyecto" readonly density="compact" />
          </VCol>

          <VCol cols="12" md="6">
            <VTextField v-model="form.distancia" type="number"  label="Distancia" density="compact" />
          </VCol>

          <VCol cols="12" md="6">
            <VTextField v-model="form.aereo" type="number" label="Pex" density="compact" />
          </VCol>

          <VCol cols="12" md="6">
            <VTextField v-model="form.sub_c_red" type="number" label="Integracion Intermodal" density="compact" />
          </VCol>

          <VCol cols="12" md="6">
            <VTextField v-model="form.sub_s_red" type="number" label="Integracion Intermodal" density="compact" />
          </VCol>

          <VCol cols="12" md="6">
            <VTextField v-model="form.tramo" type="number" label="Integracion Intermodal" density="compact" />
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
  distancia: '',
  aereo: '',
  sub_c_red: '',
  sub_s_red: '',
  tramo: ''
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

watch(
  () => [form.aereo, form.sub_c_red, form.sub_s_red], // 1. Observa los campos 'aereo' y 'sub_c_red'
  ([aereo, sub_c_red, sub_s_red]) => {           // 2. Cuando cambian, ejecuta esta función
    form.tramo = (Number(aereo) || 0) + (Number(sub_c_red) || 0 ) + (Number(sub_s_red) || 0 ) // 3. Suma los valores y actualiza 'tramo'
  }
)

// Si quieres emitir la fecha en ISO (YYYY-MM-DD) cuando sea fecha:


function onSubmit () {
  emit('submit', { 
                    id_proyecto: props.idProyecto, 
                    ...form, 
                    isEdit: props.isEdit})
  emit('update:open', false)
}

function onCancel () {
  emit('cancel')
  emit('update:open', false)
}
</script>
