<template>
  <VCardText>
    <h5>Trabajos</h5>
    <VRow>
      <VCol cols="12">
        <VSelect
          v-model="formLocal.tipos_trabajos"
          :items="options.tipos_trabajos"
          item-title="nombre"
          item-value="id_tipo"
          label="Seleccionar Tipos de Trabajo"
          multiple
          chips
          closable-chips
          density="compact"
        />
      </VCol>
    </VRow>

    <!-- Contenedor para los campos dinámicos -->
    <VRow v-for="trabajo in formLocal.medidas" :key="trabajo.id_tipo" class="mt-2 align-center">
      <VCol cols="12" md="4">
        <label>{{ trabajo.nombre }}</label>
      </VCol>
      <VCol cols="12" md="4">
        <VTextField
          v-model="trabajo.total"
          type="number"
          label="Total a Instalar"
          :suffix="trabajo.unidad"
          density="compact"
          :min="0"
        />
      </VCol>
      <VCol cols="12" md="4">
        <VTextField
          v-model="trabajo.trabajado"
          type="number"
          label="Trabajado"
          :suffix="trabajo.unidad"
          density="compact"
          :min="0"
        />
      </VCol>
    </VRow>
  </VCardText>
</template>

<script setup>
import { computed, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
  options: {
    type: Object,
    default: () => ({ tipos_trabajos: [] }),
  },
})

const emit = defineEmits(['update:modelValue'])

const formLocal = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

watch(
  () => formLocal.value.tipos_trabajos,
  (selectedIds) => {
    const newMedidas = selectedIds.map(id => {
      const existing = formLocal.value.medidas.find(m => m.id_tipo === id)
      if (existing) return existing

      const tipoTrabajo = props.options.tipos_trabajos.find(t => t.id_tipo === id)
      return {
        id_tipo: id,
        nombre: tipoTrabajo?.nombre || '',
        unidad: tipoTrabajo?.unidad || 'cant',
        total: null,
        trabajado: null,
      }
    })
    formLocal.value.medidas = newMedidas
  },
  { deep: true }
)

// Inicializa el array de medidas si no existe
if (!formLocal.value.medidas) {
  formLocal.value.medidas = []
}

</script>