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
      <VBtn 
        density="compact" 
        class="ma-1" 
        size="small" 
        :color="item.total_trabajos > 0 ? 'success' : 'primary'"
        @click="$emit('verTrabajos', item.id_proyecto)"
      >
        {{ item.total_trabajos > 0 ? 'Ver Trabajos' : 'Crear Trabajos' }}
      </VBtn>
      <VBtn 
        density="compact" 
        class="ma-1" 
        size="small" 
        @click="$emit('asignar-proyecto', item.id_proyecto)" 
        :color="item.asigando !== null ? 'warning' : 'primary'"
        >
        {{ item.asigando !== null ? 'Asignado' : 'Asignar' }}
      </VBtn>
      <VBtn density="compact" class="ma-1" size="small" color="warning" @click="$emit('editarProyecto', item.id_proyecto)" icon="ri-edit-2-line" />
      <VBtn density="compact" class="ma-1" size="small" color="error" @click="$emit('delete-proyecto', item.id_proyecto)" icon="ri-delete-bin-6-line" />
    </template>
  </VDataTable>
</template>

<script setup>

const props = defineProps(['listaproyecto'])
const emit = defineEmits(['verTrabajos','editarProyecto','asignar-proyecto', 'delete-proyecto'])

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
  total_trabajos: Number(r.total_proyectos) || 0, // Añadimos el conteo de trabajos
  asigando: Number(r.asigando) || null, // Añadimos el conteo de trabajos
})))
</script>
