<!-- src/pages/intermodal-base-interna/components/dialog.vue -->
<template>
  <!-- NOTA: Para este ejemplo, he creado un componente FormDiseno.vue que no está en el contexto. -->
  <!-- Puedes seguir este patrón para los demás VCardText. -->
  <VDialog v-model="openLocal" max-width="1200" :retain-focus="false">
    <VCard>
      <VCardTitle class="text-h6">Nuevo Registro</VCardTitle>
      <VForm ref="formRef">        
        <FormProyecto v-model="form.proyecto" :options="options" />
        <FormDiseno v-model="form.diseno" />
        <FormIntegracion v-model="form.integracion" />
        <FormCapex v-model="form" />
        <FormPex v-model="form.pex" />
      </VForm>

      <VCardText class="d-flex gap-4">
        <VBtn :disabled="!isComplete" @click="onSubmit">Submit</VBtn>
        <VBtn color="secondary" variant="tonal" @click="onCancel">Cancel</VBtn>
      </VCardText>
    </VCard>
  </VDialog>
</template>

<script setup>
import { reactive, ref, watch, computed } from 'vue'
import { VCardText } from 'vuetify/components'
import FormProyecto from './FormProyecto.vue' // 1. Importar el nuevo componente
import FormDiseno from './FormDiseno.vue' // 1. Importar el nuevo componente
import FormIntegracion from './FormIntegracion.vue' // 1. Importar el nuevo componente
import FormCapex from './FormCapex.vue' // 1. Importar el nuevo componente
import FormPex from './FormPex.vue'
/* -------- props / emits -------- */
const props = defineProps({
  open: { type: Boolean, default: false },
  options: {
    type: Object,
    default: () => ({
      regiones: [],
      departamentos: [],
      nodosConcentrador: [],
      tipos_trabajos: [], // [{ id_tipo, nombre, unidad? }]
    }),
  },
})
const emit = defineEmits(['update:open', 'submit', 'cancel'])

/* -------- v-model puente -------- */
const openLocal = computed({
  get: () => props.open,
  set: v => emit('update:open', v),
})

/* -------- form -------- */
const formRef = ref(null)

const defaultForms = () => ({
  proyecto: {
    ip: null, eecc: '', prioridad: '', nodo: '', uips: null,
    region: '', departamento: '', nodo_concentrador: '',
    desplieges_router: '', enlace: '', comercial: '',
  },
  diseno: {
    estado_diseño: '', distancia: '', aereo: '', sub_c_red: '', sub_s_red: '', tramo: '',
  },
  integracion: {
    despliege_e_i: '', router: '', proveedor: '', integracion_intermodal: '', jumpeo: '',
  },
  capex: {
    mat: '', mo: '',
  },
  pex: {
    estado_pex: '', fecha_interna: '', kick_off: '', culminacion: '',
  },
})

const form = reactive(defaultForms())

const FIELDS_PROYECTO = [
  'ip', 'eecc', 'prioridad', 'nodo', 'uips', 'region', 'departamento', 'nodo_concentrador'
]

/* -------- reset al abrir -------- */
watch(() => props.open, v => {
  if (v) {
    // Resetea el formulario a su estado inicial.
    // Los componentes hijos se encargarán de sus propios campos.
    Object.assign(form, defaultForms())
    requestAnimationFrame(() => formRef.value?.resetValidation())
  }
})

/* -------- validación mínima -------- */
const isComplete = computed(() => {
  // Separa los campos opcionales de los requeridos para mayor claridad.
  const requiredProjectFields = FIELDS_PROYECTO.filter(k => !['ip', 'uips'].includes(k))

  // Valida que todos los campos requeridos tengan un valor.
  const okProyectoRequerido = requiredProjectFields.every(k => {
    const value = form.proyecto[k]
    return value !== '' && value !== null && value !== undefined
  })
  return okProyectoRequerido
})

/* -------- submit / cancel -------- */
async function onSubmit() {
  // Construimos el objeto con la estructura deseada
  const rawPayload = {
    proyecto: form.proyecto,
    diseno: form.diseno,
    integracion: form.integracion,
    capex: form.capex,
    pex: form.pex,
  }

  // Recorremos cada sección y convertimos los campos vacíos "" a null.
  const payload = JSON.parse(JSON.stringify(rawPayload), (key, value) => {
    return value === '' ? null : value
  })

  emit('submit', payload)
  emit('update:open', false)
}

function onCancel() {
  emit('cancel')
  emit('update:open', false)
}
</script>
