<template>
  <VCardText>
    <!-- 1. Trabajos Opcionales con Checkboxes -->
    <VRow>
      <VCol v-for="trabajo in trabajosOpcionales" :key="trabajo.id_tipo" cols="12" md="4" sm="6">
        <VCheckbox v-model="formLocal.tipos_trabajos" :label="trabajo.nombre" :value="trabajo.id_tipo" />
      </VCol>
    </VRow>

    <!-- 2. Contenedor para TODOS los campos de texto (fijos y dinámicos) -->
    <VRow v-for="trabajo in trabajosMostrados" :key="trabajo.id_tipo" class="mt-2 align-center">
      <VCol cols="12" md="4">
        <label>{{ trabajo.nombre }} <span v-if="trabajosFijosIds.includes(trabajo.id_tipo)" class="text-error">*</span></label>
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
import { computed, watch, onMounted } from 'vue'

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

// --- Lógica de separación de trabajos ---
const trabajosFijosIds = [4, 5, 6, 7] // IDs de trabajos siempre visibles
const trabajosOpcionalesIds = [1, 2, 3] // IDs de trabajos con checkbox

const trabajosOpcionales = computed(() =>
  props.options.tipos_trabajos.filter(t => trabajosOpcionalesIds.includes(t.id_tipo))
)

// --- Estado local del formulario ---
const formLocal = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// --- Lógica de renderizado ---
const trabajosMostrados = computed(() => {
  // Ordena los trabajos para que los fijos aparezcan primero
  return formLocal.value.medidas.slice().sort((a, b) => {
    const aIsFijo = trabajosFijosIds.includes(a.id_tipo)
    const bIsFijo = trabajosFijosIds.includes(b.id_tipo)
    if (aIsFijo && !bIsFijo) return -1
    if (!aIsFijo && bIsFijo) return 1
    return a.id_tipo - b.id_tipo // Orden secundario por ID
  })
})

// --- Sincronización de datos ---
watch(
  () => formLocal.value.tipos_trabajos,
  (selectedIds) => {
    // Combina los IDs fijos con los seleccionados en los checkboxes
    const todosLosIdsActivos = [...new Set([...trabajosFijosIds, ...selectedIds])]

    const newMedidas = todosLosIdsActivos.map(id => {
      // Reutiliza el dato si ya existe
      const existing = formLocal.value.medidas.find(m => m.id_tipo === id)
      if (existing) return existing

      // Crea un nuevo objeto si no existe
      const tipoTrabajo = props.options.tipos_trabajos.find(t => t.id_tipo === id)
      return {
        id_tipo: id,
        nombre: tipoTrabajo?.nombre || '',
        unidad: tipoTrabajo?.unidad || 'cant',
        total: '', // Usar string vacío para VTextField
        trabajado: '',
      }
    })

    // Actualiza el array de medidas, eliminando los que ya no están activos
    formLocal.value.medidas = newMedidas
  },
  { deep: true }
)

onMounted(() => {
  // Asegura que el estado inicial sea correcto al montar el componente
  const idsIniciales = formLocal.value.tipos_trabajos || []
  
  // Forzamos la inclusión de los trabajos fijos en el estado inicial
  formLocal.value.tipos_trabajos = [...new Set([...trabajosFijosIds, ...idsIniciales])]
})

</script>