<!-- src/pages/intermodal-base-interna/components/dialog.vue -->
<template>
  <VDialog v-model="openLocal" max-width="800">
    <VCard>
      <VCardTitle class="text-h6">Nuevo Registro</VCardTitle>

      <VCardText>
        <VForm ref="formRef">
          <VRow class="mt-2">
            <!-- Proyecto -->
            <VCol cols="12" md="4"><VTextField v-model="form.ip" label="IP" density="compact"/></VCol>
            <VCol cols="12" md="4"><VTextField v-model="form.eecc" label="EECC" :rules="[req]" density="compact"/></VCol>
            <VCol cols="12" md="4"><VTextField v-model="form.prioridad" type="number" label="Prioridad" :rules="[req]" density="compact"/></VCol>

            <VCol cols="12" md="4"><VTextField v-model="form.nodo" label="Nodo" :rules="[req]" density="compact"/></VCol>
            <VCol cols="12" md="4"><VTextField v-model="form.uips" label="UIPS" density="compact"/></VCol>

            <VCol cols="12" md="4">
              <VSelect v-model="form.region" :items="options.regiones" label="Región" :rules="[req]" density="compact"/>
            </VCol>
            <VCol cols="12" md="4">
              <VSelect v-model="form.dpto" :items="options.departamentos" label="Departamento" :rules="[req]" density="compact"/>
            </VCol>
            <VCol cols="12" md="4">
              <VSelect v-model="form.nodo_concentrador" :items="options.nodosConcentrador" label="Nodo concentrador" :rules="[req]" density="compact"/>
            </VCol>

            <!-- Medidas -->
            <VCol cols="12"><h5>Medidas</h5></VCol>
            <VCol cols="12">
              <VAutocomplete
                v-model="form.tipos_trabajos"
                :items="options.tipos_trabajos"
                item-title="nombre"
                item-value="id_tipo"
                chips
                multiple
                label="Tipos de Trabajo"
                placeholder="Seleccionar"
              />
            </VCol>

            <!-- Especial: PRUEBAS -->
            <VCol cols="12" md="6" v-if="form.tipos_trabajos.includes(SPECIAL_IDS.PRUEBAS)">
              <VTextField
                v-model="form.pruebas.cantidad_cto"
                label="Cantidad CTO (PRUEBAS)"
                type="number"
                density="compact"
              />
            </VCol>

            <!-- Especial: INSTALACION PASIVOS -->
            <VCol cols="12" md="6" v-if="form.tipos_trabajos.includes(SPECIAL_IDS.PASIVOS)">
              <VTextField
                v-model="form.pasivos.total_mufa"
                label="Total MUFA (INSTALACION PASIVOS)"
                type="number"
                density="compact"
              />
            </VCol>

            <!-- Genéricas (excluye PRUEBAS y PASIVOS) -->
            <VCol cols="12">
              <VRow v-if="medidasGenericas.length">
                <VCol
                  v-for="m in medidasGenericas"
                  :key="m.id_tipo"
                  cols="12" md="6"
                >
                  <VTextField
                    v-model="m.valor"
                    :label="m.nombre"
                    :suffix="m.unidad"
                    type="number"
                    density="compact"
                    placeholder="Ingrese valor"
                  />
                </VCol>
              </VRow>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>

      <VDivider />

      <VCardText class="d-flex gap-4">
        <VBtn :disabled="!isComplete" @click="onSubmit">Submit</VBtn>
        <VBtn color="secondary" variant="tonal" @click="onCancel">Cancel</VBtn>
      </VCardText>
    </VCard>
  </VDialog>
</template>

<script setup>
import { reactive, ref, watch, computed } from 'vue'

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
const form = reactive({
  ip: null,
  eecc: '',
  prioridad: '',
  nodo: '',
  uips: null,
  region: '',
  dpto: '',
  nodo_concentrador: '',
  tipos_trabajos: [],
  medidas: [],

  pruebas: { cantidad_cto: null },
  pasivos: { total_mufa: null },
})

/* -------- helpers simples -------- */
const req = v => (!!v || v === 0) || 'Requerido'

const FIELDS_PROYECTO = [
  'ip','eecc','prioridad','nodo','uips','region','dpto','nodo_concentrador'
]

const SPECIAL_IDS = computed(() => {
  const byName = name =>
    props.options.tipos_trabajos.find(t => (t?.nombre || '').toLowerCase() === name.toLowerCase())?.id_tipo ?? null
  return {
    PRUEBAS: byName('PRUEBAS'),
    PASIVOS: byName('INSTALACION PASIVOS'),
  }
})

const medidasGenericas = computed(() => {
  const { PRUEBAS, PASIVOS } = SPECIAL_IDS.value
  return form.medidas.filter(m => m.id_tipo !== PRUEBAS && m.id_tipo !== PASIVOS)
})

/* -------- sync medidas con selección (versión simple) -------- */
watch(
  () => form.tipos_trabajos,
  (ids) => {
    const next = ids.map(id => {
      const def = props.options.tipos_trabajos.find(t => t.id_tipo === id) || {}
      const prev = form.medidas.find(m => m.id_tipo === id)
      return prev ? prev : { ...def, valor: null }
    })
    form.medidas = next.sort((a,b) => a.id_tipo - b.id_tipo)

    // si se deselecciona especiales, limpiar sus inputs
    if (!ids.includes(SPECIAL_IDS.value.PRUEBAS)) form.pruebas.cantidad_cto = null
    if (!ids.includes(SPECIAL_IDS.value.PASIVOS)) form.pasivos.total_mufa = null
  },
  { immediate: true }
)

/* -------- reset al abrir -------- */
watch(() => props.open, v => {
  if (v) {
    Object.assign(form, {
      ip: null, eecc: '', prioridad: '', nodo: '', uips: null,
      region: '', dpto: '', nodo_concentrador: '',
      tipos_trabajos: [], medidas: [],
      pruebas: { cantidad_cto: null },
      pasivos: { total_mufa: null },
    })
    requestAnimationFrame(() => formRef.value?.resetValidation())
  }
})

/* -------- validación mínima -------- */
const isComplete = computed(() => {
  // Separa los campos opcionales de los requeridos para mayor claridad.
  const requiredProjectFields = FIELDS_PROYECTO.filter(k => !['ip', 'uips'].includes(k))

  // Valida que todos los campos requeridos tengan un valor.
  const okProyectoRequerido = requiredProjectFields.every(k => {
    const value = form[k]
    return value !== '' && value !== null && value !== undefined
  })

  const needPruebas = form.tipos_trabajos.includes(SPECIAL_IDS.value.PRUEBAS)
  const needPasivos = form.tipos_trabajos.includes(SPECIAL_IDS.value.PASIVOS)

  const okPruebas = !needPruebas || (form.pruebas.cantidad_cto !== null && form.pruebas.cantidad_cto !== '' && !isNaN(Number(form.pruebas.cantidad_cto)))
  const okPasivos = !needPasivos || (form.pasivos.total_mufa !== null && form.pasivos.total_mufa !== '' && !isNaN(Number(form.pasivos.total_mufa)))

  return okProyectoRequerido && okPruebas && okPasivos
})

/* -------- submit / cancel -------- */
async function onSubmit () {
    const { valid } = await formRef.value.validate()
  if (!valid) return

  // 1) Proyecto (igual)
  const proyecto = {}
  for (const k of FIELDS_PROYECTO) proyecto[k] = form[k]
  proyecto.prioridad = Number(proyecto.prioridad ?? 0)

  // 2) RESUMEN (solo genéricos: excluye PRUEBAS y PASIVOS)
  //    trabajos_resumen: { tipo_id, total_instalar, instalado }
  const { PRUEBAS, PASIVOS } = SPECIAL_IDS.value
  const resumen = form.medidas
    .filter(m => m.id_tipo !== PRUEBAS && m.id_tipo !== PASIVOS)
    .map(m => ({
      tipo_id: m.id_tipo,
      total_instalar: Number(m.valor ?? 0),
      instalado: 0,
    }))

  // 3) ESPECIALES (van directo a sus tablas con proyecto_id en el padre)
  const pruebas = form.tipos_trabajos.includes(PRUEBAS)
    ? {
        tipo_id: PRUEBAS,
        cantidad_cto: Number(form.pruebas.cantidad_cto ?? 0),
        // si luego agregas más campos aquí, van tal cual
      }
    : null

  const pasivos = form.tipos_trabajos.includes(PASIVOS)
    ? {
        tipo_id: PASIVOS,
        total_mufa: Number(form.pasivos.total_mufa ?? 0),
        // mufa_inst, mufa_empalmados, rotulado, etc. cuando los tengas
      }
    : null

  // 4) Emitir al padre con la NUEVA forma
  emit('submit', { proyecto, resumen, pruebas, pasivos })
  emit('update:open', false)
}

function onCancel () {
  emit('cancel')
  emit('update:open', false)
}
</script>
