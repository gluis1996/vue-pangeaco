<template>
  <VSheet class="pa-4" border rounded>
    <VRow align="center">
      <VCol cols="12" md="4">
        <VTextField
          v-model.number="numeroSaltos"
          label="Cantidad de Saltos"
          type="number"
          min="0"
          density="compact"
          variant="outlined"
          placeholder="Ingrese un número"
        />
      </VCol>
    </VRow>

    <VDivider v-if="numeroSaltos > 0" class="my-4" />

    <VRow v-if="numeroSaltos > 0">
      <VCol
        v-for="(salto, index) in ubicaciones"
        :key="index"
        cols="12"
        md="4"
      >
        <label class="v-label text-caption">Salto #{{ index + 1 }}</label>
        <NodoSelect 
          v-model="ubicaciones[index].nombre_nodo"
          @nodo-selected="data => onNodoSelected(index, data)"
        />
      </VCol>
    </VRow>
  </VSheet>
</template>

<script setup>
import { ref, watch } from 'vue'
import { VSheet, VRow, VCol, VTextField, VDivider } from 'vuetify/components'
import UbicacionSelect from './UbicacionSelect.vue';
import NodoSelect from './NodoSelect.vue';

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['update:modelValue'])

const numeroSaltos = ref(props.modelValue.length || 0)

// Estado interno para manejar los v-model de los UbicacionSelect.
// Ahora será un array de objetos: [{ id: 123, nombre_nodo: '...' }, ...]
const ubicaciones = ref(JSON.parse(JSON.stringify(props.modelValue)))

function onNodoSelected(index, nodoData) {
  if (nodoData) {
    // Cuando se selecciona un nodo, guardamos su ID.
    ubicaciones.value[index].id = nodoData.id
  } else {
    // Si se limpia la selección, reseteamos el ID.
    ubicaciones.value[index].id = null
  }
}

watch(numeroSaltos, (newVal, oldVal) => {
  const newCount = Number(newVal) || 0
  const currentCount = ubicaciones.value.length
  
  // Sincroniza el array 'ubicaciones' con la cantidad deseada
  const newUbicaciones = Array.from({ length: newCount }, (_, i) => {
    return ubicaciones.value[i] || { id: null, nombre_nodo: null, orden: i + 1 }
  })
  ubicaciones.value = newUbicaciones
})

watch(ubicaciones, (newVal) => {
  // Emitir el valor directamente, asegurando que el orden esté correcto
  const payload = newVal.map((u, i) => ({ ...u, orden: i + 1 }))
  // Evitar bucles infinitos comparando antes de emitir
  if (JSON.stringify(payload) !== JSON.stringify(props.modelValue)) {
    emit('update:modelValue', payload)
  }
}, { deep: true })

// Sincronizar desde el padre si el v-model cambia externamente
watch(() => props.modelValue, (newVal) => {
  // Comparamos para evitar bucles infinitos
  if (JSON.stringify(newVal) !== JSON.stringify(ubicaciones.value)) {
    ubicaciones.value = JSON.parse(JSON.stringify(newVal))
    numeroSaltos.value = newVal.length
  }
}, { deep: true })
</script>