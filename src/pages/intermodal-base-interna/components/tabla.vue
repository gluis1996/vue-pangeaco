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
      <VBtn density="compact" class="ma-1" size="small" @click="$emit('verTrabajos', value)">Trabajos</VBtn>
      <VBtn density="compact" class="ma-1" size="small" @click="$emit('asignar-proyecto', value)">Asignar</VBtn>
      <VBtn density="compact" class="ma-1" size="small" @click="$emit('editarProyecto', value)">Editar</VBtn>
    </template>
  </VDataTable>
</template>

<script setup>

const props = defineProps(['listaproyecto'])
const emit = defineEmits(['verTrabajos','editarProyecto','asignar-proyecto'])

const headers = [
  { title: "ip",                key: "ip" },
  { title: "prioridad",         key: "prioridad" },
  { title: "nodo",              key: "nodo" },
  { title: "uips",              key: "uips" },
  { title: "region",            key: "region" },
  { title: "dpto",              key: "departamento" },
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
  dpto: r.departamento,
  nodo_concentrador: r.nodo_concentrador,
  eecc: r.eecc,
  id_proyecto: r.id, // <- value del slot
})))
</script>
