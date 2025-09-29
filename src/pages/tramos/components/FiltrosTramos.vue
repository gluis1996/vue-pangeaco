<template>
  <VRow class="mb-4">
    <!-- Filtro de búsqueda general -->
    <VCol cols="12" md="4">
      <VTextField
        v-model="filters.searchQuery"
        label="Buscar por IP, Nombre, Origen, Destino..."
        density="compact"
        clearable
        append-inner-icon="ri-search-line"
      />
    </VCol>

    <!-- Filtro por Estado -->
    <VCol cols="12" md="4">
      <VSelect
        v-model="filters.selectedEstado"
        :items="props.estadosUnicos"
        label="Filtrar por Estado"
        density="compact"
        clearable
      />
    </VCol>

    <!-- Filtro por Asignado -->
    <VCol cols="12" md="4">
      <VSelect
        v-model="filters.selectedAsignado"
        :items="['Asignado', 'No Asignado']"
        label="Filtrar por Asignación"
        density="compact"
        clearable
      />
    </VCol>
  </VRow>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
  estadosUnicos: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['update:modelValue']);

const filters = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});
</script>