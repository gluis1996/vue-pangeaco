<template>
    <h6>Tabla de Programaciones</h6>
    <VDataTable
        :headers="headers"
        :items="items"                
        density="compact"
        :items-per-page="20"
        class="text-no-wrap"
    >
        <!-- Columna de acción (slot por key) -->
        <template #item.detalle="{ item }">
        <VBtn size="small" @click="$emit('verDetalle', item.detalle)">Ver</VBtn>
        </template>

        <!-- Mensaje cuando no hay datos -->
        <template #no-data>
        <div class="pa-4">Sin programaciones</div>
        </template>
  </VDataTable>
</template>

<script setup>
import { computed } from 'vue'   // 👈 esto faltaba
import { VBtn } from 'vuetify/components';
// import { computed, ref } from 'vue'
const props = defineProps(['listaprogramcion'])
const emit = defineEmits(['verDetalle'])
const headers = [
  { title: "tipo", key: "tipo" },
  { title: "Semana", key: "semana" },
  { title: "Cant. Progr.", key: "CantidadProgramado" },
  { title: "Cant. Traba.", key: "CantidadTrabajado" },
  { title: "Cant. Pendi.", key: "CantidadPendiente" },
  { title: "Estado", key: "estado" },
  { title: "Detalle", key: "detalle" },
];

const items = computed(()=>{
    return (props.listaprogramcion ?? []).map(r => ({
        tipo : r.tipo,
        semana: r.semana_programada,
        CantidadProgramado: r.cantidad_programados,
        CantidadTrabajado: r.cantidad_trabajado,
        CantidadPendiente: r.pendientes,
        estado: r.estado,
        detalle: r.id_programacion,
    }));
});

</script>