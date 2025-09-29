<template>

  <VCardText>
    <VRow>
      <VCol cols="12" offset-md="8" md="4">
        <VTextField v-model="search" label="Buscar" placeholder="Buscar ..." append-inner-icon="ri-search-line"
          single-line hide-details dense outlined density="compact" />
      </VCol>
    </VRow>
  </VCardText>

  <VDataTable 
    :headers="headers" 
    :items="items" 
    :search="search" 
    density="compact" 
    :items-per-page="20"
    class="text-no-wrap">
    <!-- Columna de acción (slot por key) -->
    <template #item.acciones="{ item }">      
      <VBtn 
        density="compact" 
        class="ma-1" size="small" 
        :color="item.total_licencias > 0 ? 'warning' : 'primary'"
        @click="$emit('licencia', item)">{{ item.total_licencias > 0 ? 'Editar' : 'Licencia' }}</VBtn>
    </template>
  </VDataTable>
  
</template>

<script setup>

const props = defineProps(['listaproyecto'])
const emit = defineEmits(['licencia',])

const search = ref('')

const headers = [
  { title: "id", key: "id" },
  { title: "ID Proyecto", key: "id_proyecto" },
  { title: "ip_tramo", key: "ip_tramo" },
  { title: "Nombre Tramo", key: "nombre_tramo" },
  { title: "Origen", key: "nodo_origen" },
  { title: "Destino", key: "nodo_destino" },
  { title: "estado", key: "estado" },
  { title: "Asignado", key: "asignado" },
  { title: "Acciones", key: "acciones" },
]

const items = computed(()=> (props.listaproyecto ?? []).map(r => ({
  id: r.id,
  id_proyecto: r.id_proyecto,
  ip_tramo: r.ip_tramo,
  nombre_tramo: r.nombre_tramo,
  nodo_origen: r.nodo_origen,
  nodo_destino: r.nodo_destino,
  estado: r.estado,
  asignado: r.asignado === 1 || r.asignado === true,
  // El valor para el slot de acciones puede ser cualquier cosa, usualmente el ID del item.
  acciones: r.id, 
})))
</script>
