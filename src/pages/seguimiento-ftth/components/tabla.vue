<template>
  <VDataTable
    :headers="headers"
    :items="items"
    density="compact"
    :items-per-page="20"
    class="text-no-wrap"
  >
    <!-- Columna de acción (slot por key) -->
    <template #item.id_proyecto="{ value }">
      <VBtn density="compact" class="ma-1" size="small" @click="$emit('verDetalleDespliegues', value)">Despliegue</VBtn>
      <VBtn density="compact" class="ma-1" size="small" @click="$emit('verEstadoAvance', value)">Estados</VBtn>
      <VBtn density="compact" class="ma-1" size="small" @click="$emit('verDetalleDistancia', value)">Distancia</VBtn>
      <VBtn density="compact" class="ma-1" size="small" @click="$emit('verDetalle', value)">Asignar</VBtn>
    </template>
  </VDataTable>
</template>

<script setup>

const headers = [
    
];

</script>