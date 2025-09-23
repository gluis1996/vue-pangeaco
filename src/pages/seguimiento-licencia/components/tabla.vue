<template>

  <VCardText>
    <VRow>
      <VCol cols="12" offset-md="8" md="4">
        <VTextField v-model="search" label="Buscar" placeholder="Buscar ..." append-inner-icon="ri-search-line"
          single-line hide-details dense outlined density="compact" />
      </VCol>
    </VRow>
  </VCardText>

  <VDataTable :headers="headers" :items="items" :search="search" density="compact" :items-per-page="20"
    class="text-no-wrap">
    <!-- Columna de acción (slot por key) -->
    <template #item.id_proyecto="{ item }">      
      <VBtn 
        density="compact" 
        class="ma-1" size="small" 
        :color="item.total_licencias > 0 ? 'warning' : 'primary'"
        @click="$emit('licencia', item)">{{ item.total_licencias > 0 ? 'Editar' : 'Licencia' }}</VBtn>
      <VBtn density="compact" class="ma-1" size="small" color="error" @click="$emit('delete-proyecto', item.id_proyecto)">Eliminar
      </VBtn>
    </template>
  </VDataTable>
</template>

<script setup>

const props = defineProps(['listaproyecto'])
const emit = defineEmits(['licencia',])

const search = ref('')

const headers = [
  { title: "eecc", key: "eecc" },
  { title: "origen", key: "nodo" },
  { title: "destino", key: "nodo_concentrador" },
  { title: "fase", key: "desplieges_router" },
  { title: "enlace", key: "enlace" },
  { title: "acciones", key: "id_proyecto" },
]

const items = computed(() => (props.listaproyecto ?? []).map(r => ({
  eecc: r.eecc,
  nodo: r.nodo,
  nodo_concentrador: r.nodo_concentrador,
  desplieges_router: r.desplieges_router,
  enlace: r.enlace,
  total_licencias: r.total_licencias,  id_proyecto: r.id, // <- value del slot
})))
</script>
