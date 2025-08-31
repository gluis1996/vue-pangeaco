<template>
  <VCard variant="outlined" class="pa-4">
    <div class="text-subtitle-1 mb-2">Planificador de Rutas</div>

    <AppDateTimePicker
      v-model="dateRange"
      label="Fechas (rango):"
      placeholder="Seleccione rango"
      :config="{ mode: 'range' }"
      class="mb-3"
    />

    <VSelect
      v-model="tipoProgramacion"
      :items="TIPOS"
      label="Tipo de programación"
      class="mb-3"
      density="comfortable"
      hide-details="auto"
      @update:modelValue="onTipoChange && onTipoChange()"
    />

    <VRow class="mb-2" dense>
      <VCol cols="12">
        <VSelect
          v-model="selectedDepartamento"
          :items="departamentosDisponibles"
          label="Departam.:"
          density="comfortable"
          hide-details="auto"
          :disabled="!departamentosDisponibles?.length"
          @update:modelValue="() => { selectedSitio=''; selectedDistrito='' }"
        />
      </VCol>
      <VCol cols="12">
        <VSelect
          v-model="selectedSitio"
          :items="sitiosDisponibles"
          label="Sitio:"
          density="comfortable"
          hide-details="auto"
          :disabled="!selectedDepartamento"
          @update:modelValue="() => { selectedDistrito='' }"
        />
      </VCol>
      <VCol cols="12">
        <VSelect
          v-model="selectedDistrito"
          :items="distritosDisponibles"
          label="Distrito:"
          density="comfortable"
          hide-details="auto"
          :disabled="!selectedSitio"
        />
      </VCol>
    </VRow>

    <VRow class="mb-2" dense>
      <VCol cols="6">
        <VTextField v-model.number="numRutas" label="# Rutas:" type="number" min="1" hide-details="auto" />
      </VCol>
      <VCol cols="6">
        <VTextField v-model.number="numCtosPorRuta" label="# CTOs:" type="number" min="0" hide-details="auto" />
      </VCol>
    </VRow>

    <div class="text-caption">
      <div>
        Solicitado:
        <strong :class="valido ? 'text-success' : 'text-error'">{{ totalSolicitadoVista }}</strong>.
      </div>
      <div>
        Disponibles:
        <strong :class="valido ? 'text-success' : 'text-error'">{{ ctosDisponibles }}</strong>
        <VIcon v-if="valido" size="small" color="success">mdi-check</VIcon>
        <VIcon v-else size="small" color="error">mdi-alert</VIcon>
      </div>
      <div v-if="!valido" class="text-error mt-1">⚠ Excedes el límite permitido.</div>
    </div>

    <VBtn class="mt-4" block color="primary" :disabled="!puedeCrearZona" @click="$emit('crear-zona')">
      Crear Zona
    </VBtn>
  </VCard>
</template>

<script setup>
// v-model "light": defineModel (si usas Vue 3.4+). Si no, convierte a props/emit manuales.
const dateRange            = defineModel('dateRange')
const tipoProgramacion     = defineModel('tipoProgramacion')
const selectedDepartamento = defineModel('selectedDepartamento')
const selectedSitio        = defineModel('selectedSitio')
const selectedDistrito     = defineModel('selectedDistrito')
const numRutas             = defineModel('numRutas')
const numCtosPorRuta       = defineModel('numCtosPorRuta')

defineProps({
  TIPOS: Array,
  departamentosDisponibles: Array,
  sitiosDisponibles: Array,
  distritosDisponibles: Array,
  ctosDisponibles: Number,
  totalSolicitadoVista: Number,
  valido: Boolean,
  puedeCrearZona: Boolean,
  onTipoChange: Function,
})

defineEmits(['crear-zona'])
</script>

<style scoped>
.text-success { color: #2e7d32 }
.text-error   { color: #c62828 }
</style>
