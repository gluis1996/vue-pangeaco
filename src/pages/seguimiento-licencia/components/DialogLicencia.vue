<!-- src/pages/seguimiento-licencia/components/DialogLicencia.vue -->
<template>
  <VDialog
    :model-value="open"
    max-width="1200px"
    @update:model-value="val => emit('update:open', val)"
  >
    <VCard>
      <VCardTitle class="text-h6 d-flex justify-center">
        Agregamos/Editamos Lista de Licencias 
      </VCardTitle>

      <VCardText>
        <VForm ref="formRef">
          <div class="text-center mb-4">
            <div class="text-body-2">Proyecto #{{ id_proyecto ?? '-' }}</div>
            <div class="text-subtitle-2">
              {{ data?.nodo_origen }}/{{ data?.nodo_destino }}/{{ data?.estado }}
            </div>
          </div>

          <!-- Controles: cantidad + acciones -->
          <VRow class="mb-2 align-center">
            <VCol cols="12" md="8" class="d-flex align-center">
                <VTextField
                v-model.number="cantidad"
                :label="modoSimple ? '¿Cuántas filas (nombre + observación)?' : '¿Cuántas licencias?'"
                type="number"
                :min="minimo"
                density="compact"
                persistent-hint
                class="flex-grow-1"
                />
            </VCol>
            <VCol cols="12" md="4" class="d-flex align-center gap-2">
                <VBtn size="small" @click="agregarUno">+ Agregar</VBtn>
                <VBtn v-if="!isedit" size="small" color="secondary" variant="tonal" @click="limpiar">Limpiar</VBtn>
            </VCol>
        </VRow>

        

        <!-- Filas -->
        <VRow
          v-for="(fila, i) in filas"
          :key="fila.uiId"
          class="mb-1"
        >
          <!-- Modo SIMPLE: sólo nombre + observación -->
          <template v-if="modoSimple">
            <VCol cols="12" md="5">
              <UbicacionSelect v-model.trim="fila.nombre_distrito"/>
            </VCol>
            <VCol cols="12" md="5">
              <VTextField
                v-model.trim="fila.observacion"
                label="Observación"
                density="compact"
                hide-details
              />
            </VCol>
            <VCol cols="12" md="2" class="d-flex align-center justify-center">
              <!-- Solo mostramos el botón si el rol es 'administrador' -->
              <VBtn 
                v-if="props.userRole === 'administrador'"
                icon="ri-delete-bin-6-line" 
                variant="text" color="error" 
                @click="quitar(i)" />
            </VCol>
          </template>

          <!-- Modo COMPLETO: todos los campos -->
          <template v-else>
            <VCol cols="12" md="1">
              <!-- Reemplazamos el VTextField por un simple label -->
              <div class="d-flex flex-column" style="height: 40px; justify-content: center;">
                <div class="text-caption text-disabled">ID</div>
                <div class="font-weight-medium">{{ fila.id || 'Nuevo' }}</div>
              </div>
            </VCol>
            <VCol cols="12" md="3">
                <UbicacionSelect v-model.trim="fila.nombre_distrito" :readonly="fila.estado_expediente === 'entregado'"/>
            </VCol>
            <VCol cols="12" md="2">
              <VSelect
                v-model.trim="fila.estado_expediente"
                label="Estado"
                density="compact"
                :items="['pendiente','entregado','pendiente firma']"
                :readonly="fila.estado_expediente === 'entregado'"
              />
            </VCol>
            <VCol cols="12" md="2">
              <AppDateTimePicker
                v-model="fila.fecha_ingreso"
                label="Ingreso"
                type="date"
                :rules="[
                  v => fila.estado_expediente !== 'entregado' || !!v || 'Requerido si es entregado',
                  v => !fila.fecha_vigencia || !v || new Date(v) < new Date(fila.fecha_vigencia) || 'La fecha de ingreso debe ser anterior a la fecha de vigencia'
                ]"
                density="compact"
                :readonly="fila.estado_expediente === 'entregado'"
              />
            </VCol>
            <VCol cols="12" md="2">
              <AppDateTimePicker
                v-model="fila.fecha_vigencia"
                label="Vigencia"
                type="date"
                :rules="[
                  v => fila.estado_expediente !== 'entregado' || !!v || 'Requerido si es entregado',
                  v => !fila.fecha_ingreso || !v || new Date(v) > new Date(fila.fecha_ingreso) || 'La fecha de vigencia debe ser posterior a la fecha de ingreso'
                ]"
                density="compact"
                :readonly="fila.estado_expediente === 'entregado'"
              />
            </VCol>
            <VCol cols="12" md="2" >
              <VTextField
                v-model.trim="fila.observacion"
                label="Observación"
                density="compact"
                hide-details
                :readonly="fila.estado_expediente === 'entregado'"
              />
              <!-- Solo mostramos el botón si el rol es 'administrador' y no está entregado -->
              <VBtn 
                v-if="props.userRole === 'administrador'"
                icon="ri-delete-bin-6-line" 
                variant="text" color="error" 
                @click="quitar(i)" :disabled="fila.estado_expediente === 'entregado'" />
            </VCol>
          </template>
        </VRow>
        </VForm>
      </VCardText>

      <VCardActions class="justify-end">
        <VBtn variant="tonal" color="secondary" @click="onCancel">Cancelar</VBtn>
        <VBtn color="primary" @click="onGuardar">{{ isedit ? 'Editar' : 'Guardar'}}</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import UbicacionSelect from '@/pages/intermodal-base-interna/components/UbicacionSelect.vue'
import { VSelect, VForm } from 'vuetify/components'
const props = defineProps({
  open:         { type: Boolean, default: false },
  id_proyecto:  { type: Number,  default: 0 },
  data:         { type: Object,  default: () => ({}) },
  items:        { type: Array,   default: () => [] }, // ← lista inicial del padre
  isedit:{ type: Boolean, default: false },
  userRole: { type: String, default: '' },
  minimo: { type: Number, default: 0 },
})
const emit = defineEmits(['update:open', 'cancel', 'save'])

/* -------- Estado -------- */
const cantidad = ref(0)
const filas    = ref([])
const formRef = ref(null)

/* -------- Modo simple/completo --------
   simple = NO hay datos iniciales
--------------------------------------- */
const modoSimple = computed(() => !(Array.isArray(props.items) && props.items.length > 0))

/* -------- Helpers -------- */
const req = v => (!!v && String(v).trim().length > 0) || 'Requerido'
const uuid = () => (crypto?.randomUUID?.() ?? `id_${Date.now()}_${Math.random().toString(16).slice(2)}`)

function newRow(overrides = {}) {
  // estructura mínima para ambos modos; los de completo se rellenan sólo si hay datos
  return {
    uiId: uuid(),
    id: null,
    nombre_distrito: '',
    observacion: '',
    estado_expediente: '',
    fecha_ingreso: '',
    fecha_vigencia: '',
    id_proyecto: props.id_proyecto ?? null,
    ...overrides,
  }
}

/* -------- Precarga al abrir -------- */
watch(() => props.open, (isOpen) => {
  if (!isOpen) return

  if (Array.isArray(props.items) && props.items.length) {
    // MODO COMPLETO: clona todos los campos
    filas.value = props.items.map(it =>
      newRow({
        id: it.id ?? null,
        nombre_distrito: it.nombre_distrito ?? '',
        observacion: it.observacion ?? '',
        estado_expediente: it.estado_expediente ?? '',
        fecha_ingreso: it.fecha_ingreso ?? '',
        fecha_vigencia: it.fecha_vigencia ?? '',
        id_proyecto: it.id_proyecto ?? props.id_proyecto ?? null,
      })
    )
  } else {
    // MODO SIMPLE: empieza vacío (o si quieres, crea 1 fila por defecto)
    filas.value = []
    // Si prefieres arrancar con una fila: filas.value = [newRow()]
  }
  cantidad.value = filas.value.length
})

/* -------- Ajuste por cantidad -------- */
watch(cantidad, (n) => {
  const objetivo = Math.max(0, Math.floor(n || 0))
  const actual = filas.value.length
  if (objetivo > actual) {
    for (let i = actual; i < objetivo; i++) filas.value.push(newRow())
  } else if (objetivo < actual) {
    filas.value.splice(objetivo)
  }
})

/* -------- Acciones -------- */
function agregarUno() {
  filas.value.push(newRow())
  cantidad.value = filas.value.length
}
function limpiar() {
  filas.value = []
  cantidad.value = 0
}
function quitar(i) {
  filas.value.splice(i, 1)
  cantidad.value = filas.value.length
}

/* -------- Guardar -------- */
async function onGuardar() {
  if (!formRef.value) return

  const { valid } = await formRef.value.validate()

  if (!valid) return // Si el formulario no es válido, detenemos la ejecución aquí.

  // En modo completo enviamos todos los campos
  const licencias = filas.value.map(f => {
    const base = {
      id: f.id ?? null,
      id_tramo: f.id_proyecto ?? props.id_proyecto ?? null,
      nombre_distrito: (f.nombre_distrito ?? '').toString().trim(),
      observacion: (f.observacion ?? '').toString().trim(),
    }
    if (modoSimple.value) return base
    return {
      ...base,
      estado_expediente: (f.estado_expediente ?? '').toString().trim(),
      fecha_ingreso: f.fecha_ingreso || '',
      fecha_vigencia: f.fecha_vigencia || '',
    }
  })

  const payload = {
    licencias,isedit: props.isedit,
  }
  emit('save', payload)
  emit('update:open', false)
}

function onCancel() {
  emit('cancel')
  emit('update:open', false)
}
</script>
