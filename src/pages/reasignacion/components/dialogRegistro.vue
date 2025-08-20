<!-- src/pages/reasignacion/components/dialogRegistro.vue -->
<template>
  <VDialog
    :model-value="props.isDialogVisible"
    max-width="900"
    @update:model-value="dialogVisibleUpdate"
  >
    <VCard class="pa-3 pa-sm-6">
      <!-- Cerrar (X) -->
      <DialogCloseBtn
        variant="text"
        size="default"
        @click="emit('update:isDialogVisible', false)"
      />

      <VCardText class="pt-4">
        <h4 class="text-h4 mb-6">Registro Reasignación</h4>

        <VForm ref="refForm" @submit.prevent="registrar">
          <VRow class="gap-y-4">
            <!-- Columna izquierda: Formato + Completar -->
            <VCol cols="12" md="4">
              <VTextarea
                v-model="form.formato"
                label="Formato"
                auto-grow
                rows="10"
              />
              <VBtn class="mt-4" block @click="completarDesdeFormato">
                Completar
              </VBtn>
            </VCol>

            <!-- Columna derecha: formulario en 2 columnas -->
            <VCol cols="12" md="8">
              <VRow class="gap-y-2">
                <VCol cols="12" md="6">
                  <VTextField
                    v-model="form.cod_proyecto"
                    label="Cod Proyecto"
                    placeholder="Cod Proyecto"
                    density="comfortable"
                  />
                </VCol>

                <VCol cols="12" md="6">
                  <VTextField
                    v-model="form.line_id"
                    label="Line ID"
                    placeholder="Line Id"
                    density="comfortable"
                  />
                </VCol>

                <VCol cols="12" md="6">
                  <VTextField
                    v-model="form.fecha_ingreso"
                    label="Fecha Registro"
                    type="datetime-local"
                    density="comfortable"
                  />
                </VCol>

                <VCol cols="12" md="6">
                  <VTextField
                    v-model="form.fecha_cierre"
                    label="Fecha Cierre"
                    type="datetime-local"
                    placeholder="dd/mm/aaaa --:--"
                    density="comfortable"
                  />
                </VCol>

                <VCol cols="12" md="6">
                  <VTextField
                    v-model="form.cto_inicial"
                    label="Cto Inicio (opcional)"
                    placeholder="Ingrese CTO Inicial"
                    density="comfortable"
                  />
                </VCol>

                <VCol cols="12" md="6">
                  <VTextField
                    v-model="form.cto_final"
                    label="Cto Final (opcional)"
                    placeholder="Ingrese CTO Final"
                    density="comfortable"
                  />
                </VCol>

                <VCol cols="12" md="6">
                  <VSelect
                    v-model="form.tipo"
                    :items="tipos"
                    label="Seleccionar Tipo"
                    placeholder="Seleccionar"
                    density="comfortable"
                    clearable
                  />
                </VCol>

                <VCol cols="12" md="6">
                  <VTextField
                    v-model="form.cto_divisor"
                    label="Cto Divisor"
                    placeholder="Ingrese CTO Divisor"
                    density="comfortable"
                  />
                </VCol>

                <VCol cols="12" md="6">
                  <VTextField
                    v-model="form.borne"
                    label="Borne"
                    placeholder="Borne"
                    density="comfortable"
                    type="number"
                  />
                </VCol>
              </VRow>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>

      <!-- Acciones -->
      <VCardActions class="pt-0">
        <VSpacer />
        <VBtn variant="text" @click="emit('update:isDialogVisible', false)">
          Cerrar
        </VBtn>
        <VBtn color="primary" @click="registrar">
          Registrar
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<script setup>
import { $api } from '@/utils/api'
import { ref, reactive,watch } from 'vue'
import { VCol, VRow, VForm } from 'vuetify/components'

const hintDivisor = ref('')

const props = defineProps({
  isDialogVisible: { type: Boolean, default: false },
})

const emit = defineEmits([
  'update:isDialogVisible',
  'submit', // opcional: emite los datos al padre
])

function dialogVisibleUpdate(val) {
  emit('update:isDialogVisible', val)
}

// --- Datos del formulario
const refForm = ref(null)
const tipos = [
  'REASIGNA ALTA',
  'REASIGNA POR AVERIAS',
]

const nowLocal = () => {
  // yyyy-MM-ddThh:mm (para <input type="datetime-local">)
  const d = new Date()
  const pad = n => `${n}`.padStart(2, '0')
  const yyyy = d.getFullYear()
  const MM = pad(d.getMonth() + 1)
  const dd = pad(d.getDate())
  const hh = pad(d.getHours())
  const mm = pad(d.getMinutes())
  return `${yyyy}-${MM}-${dd}T${hh}:${mm}`
}

const form = reactive({
  formato: '',
  cod_proyecto: '',
  line_id: '',
  fecha_ingreso: nowLocal(),
  fecha_cierre: '',
  cto_inicial: '',
  cto_final: '',
  tipo: null,
  cto_divisor: '',
  borne: '',
})

// Botón "Completar" (placeholder: aquí puedes parsear `form.formato`)
const completarDesdeFormato = async () => {
  const txt = form.formato?.trim()
  if (!txt) return
  try {
    const res = await $api('reasignacion/parse',{
      method : "POST",
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }, // 🔴 importante
      body: txt,
    });

    form.cod_proyecto = res.data.req || '';
    form.line_id = res.data.line_id || '';
    form.cto_inicial = res.data.cto_inicial || '';
    form.cto_final = res.data.cto_final || '';
    form.borne = res.data.requeridas.borne || '';
    
  } catch (error) {
    
  }
}

const equalsExcept7and8 = (cand, base) => {
  if (!cand || !base) return false
  if (cand.length !== base.length) return false
  return cand.slice(0, 6) === base.slice(0, 6) && cand.slice(8) === base.slice(8)
}

// Regla de validación para el campo "Cto Divisor"
const rulesCtoDivisor = [
  v => !!v || 'Cto Divisor requerido',
  v => {
    const cf = (form.cto_final || '').trim()
    const b = Number(form.borne)

    if (!cf || !b) return true   // no molestar si faltan datos base

    // Caso 1: borne 1–8 → divisor = cto_final
    if (b >= 1 && b <= 8) {
      return v === cf || 'Para borne 1–8, debe ser exactamente igual al CTO Final.'
    }

    // Caso 2: borne 9–16 → válido si es cf+"/2" o coincide en todo salvo pos 7–8
    if (b >= 9 && b <= 16) {
      const ok = v === `${cf}/2` || equalsExcept7and8(v, cf)
      return ok || `Para borne 9–16, usa "${cf}/2" o algo como ${cf.slice(0,6)}??${cf.slice(8)}`
    }

    return 'Borne inválido (1 a 16).'
  },
]

// Hint dinámico (solo informativo)
watch([() => form.cto_final, () => form.borne], () => {
  const cf = (form.cto_final || '').trim()
  const b = Number(form.borne)

  if (!cf || !b) {
    hintDivisor.value = ''
    return
  }

  if (b >= 1 && b <= 8) {
    hintDivisor.value = 'Debe ser igual al CTO Final.'
  } else if (b >= 9 && b <= 16) {
    hintDivisor.value = `Válido: "${cf}/2" o patrón ${cf.slice(0,6)}??${cf.slice(8)} (cambia solo 7°-8°).`
  } else {
    hintDivisor.value = 'Borne debe estar entre 1 y 16.'
  }
}, { immediate: true })


// Registrar (emites al padre o llamas API aquí dentro)
function registrar() {
  // Si usas validaciones de VForm, puedes hacer: refForm.value?.validate()
  emit('submit', { ...form })
  // Cierra el diálogo si quieres
  emit('update:isDialogVisible', false)
}
</script>

<style scoped>
/* Opcional: acomoda un poco la densidad visual si lo necesitas */
</style>
