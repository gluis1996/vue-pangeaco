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
import { computed } from 'vue'
import dayjs from 'dayjs'

const props = defineProps(['listaproyecto'])
const emit = defineEmits(['verDetalleDespliegues','verEstadoAvance','verDetalleDistancia','verDetalle'])

const headers = [
  { title: "ip",                key: "ip" },
  { title: "prioridad",         key: "prioridad" },
  { title: "nodo",              key: "nodo" },
  { title: "uips",              key: "uips" },
  { title: "region",            key: "region" },
  { title: "dpto",              key: "dpto" },
  { title: "nodo concentrador", key: "nodo_concentrador" },
  { title: "eecc",              key: "eecc" },
  { title: "acciones",          key: "id_proyecto" },
]

const items = computed(()=> (props.listaproyecto ?? []).map(r => ({
  ip: r.ip,
  prioridad: r.prioridad,
  nodo: r.nodo,
  uips: r.uips,
  region: r.region,
  dpto: r.dpto,
  nodo_concentrador: r.nodo_concentrador,
  eecc: r.eecc,
  id_proyecto: r.id_proyecto, // <- value del slot
})))
</script>
