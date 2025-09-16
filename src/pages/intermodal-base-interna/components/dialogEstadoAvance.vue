<template>
  <VDialog :model-value="open" max-width="600" @update:model-value="v => emit('update:open', v)">
    <VCard>
      <VCardTitle class="text-h6">Registrar/Editar Estados Avance</VCardTitle>

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

        <VRow dense>
          <!-- Selector de modo -->
          <VCol cols="12" md="6">
            <VSelect
              v-model="form.modo"
              :items="[
                { title: 'Estado', value: 'estado' },
                { title: 'Fecha',  value: 'fecha'  },
              ]"
              label="Tipo de valor"
              density="compact"
              variant="outlined"
            />
          </VCol>

          <!-- Campo dinámico: fecha o estado -->
          <VCol cols="12" md="6">
            <!-- Si es fecha -->
            <AppDateTimePicker
              v-if="form.modo === 'fecha'"
              v-model="form.valor"
              label="Fecha"
              density="compact"
              variant="outlined"
              :hide-actions="false"
            />

            <!-- Si es estado -->
            <VSelect
              v-else
              v-model="form.valor"
              :items="ESTADOS"
              label="Estado"
              density="compact"
              variant="outlined"
              clearable
            />
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

// 👇 Define tus estados disponibles aquí
const ESTADOS = [
  'Pendiente',
  'En progreso',
  'Completado',
  'Observado',
]

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
  modo: 'estado',   // 'estado' | 'fecha'
  valor: null,      // string (estado) o string/Date (fecha)
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

// Si quieres emitir la fecha en ISO (YYYY-MM-DD) cuando sea fecha:
function valorNormalizado () {
  if (form.modo === 'fecha' && form.valor) {
    // VDateInput devuelve string YYYY-MM-DD por defecto; ajusta si te llega Date
    if (form.valor instanceof Date) {
      const y = form.valor.getFullYear()
      const m = String(form.valor.getMonth() + 1).padStart(2, '0')
      const d = String(form.valor.getDate()).padStart(2, '0')
      return `${y}-${m}-${d}`
    }
    return String(form.valor)
  }
  return form.valor ?? null // estados: string o null
}

function onSubmit () {
  emit('submit', { 
                id_proyecto: props.idProyecto, 
                ...form, 
                valor: valorNormalizado(),
                isEdit: props.isEdit})
  emit('update:open', false)
}

function onCancel () {
  emit('cancel')
  emit('update:open', false)
}
</script>
