<template>
  <VDataTable
    :headers="headers"
    :items="items"
    density="compact"
    :items-per-page="20"
    class="text-no-wrap"
  >
    <!-- Columna de acción (slot por key) -->
    <template #item.id_proyecto="{ item }">
      <!-- El botón de trabajos ahora es dinámico -->
      <VBtn density="compact" class="ma-1" size="small" @click="$emit('tramo', item.id_proyecto)"> tramos </VBtn>
      <VBtn density="compact" class="ma-1" size="small" color="warning" @click="$emit('editarProyecto', item.id_proyecto)" icon="ri-edit-2-line" />
      <VBtn density="compact" class="ma-1" size="small" color="error" @click="$emit('delete-proyecto', item.id_proyecto)" icon="ri-delete-bin-6-line" />
    </template>
  </VDataTable>
</template>

<script setup>

const props = defineProps(['listaproyecto'])
const emit = defineEmits(['verTrabajos','editarProyecto','asignar-proyecto', 'delete-proyecto','tramo'])

const headers = [
  { title: "id",              key: "id" },
  { title: "origen",              key: "nodo" },
  { title: "destino", key: "nodo_concentrador" },
  { title: "tipo", key: "tipo_enlace" },
  { title: "prioridad",         key: "prioridad" },
  { title: "uips",              key: "uips" },
  { title: "region",            key: "region" },
  { title: "dpto",              key: "departamento" },
  { title: "eecc",              key: "eecc" },
  { title: "acciones",          key: "id_proyecto" },
]

const items = computed(()=> (props.listaproyecto ?? []).map(r => ({
  id: r.id,
  prioridad: r.prioridad,
  nodo: r.nodo,
  uips: r.uips,
  region: r.region,
  departamento: r.departamento,
  nodo_concentrador: r.nodo_concentrador,
  eecc: r.eecc,
  tipo_enlace: r.tipo_enlace,
  id_proyecto: r.id, // <- value del slot
  total_trabajos: Number(r.total_proyectos) || 0, // Añadimos el conteo de trabajos
  asigando: Number(r.asigando) || null, // Añadimos el conteo de trabajos
})))
</script>
