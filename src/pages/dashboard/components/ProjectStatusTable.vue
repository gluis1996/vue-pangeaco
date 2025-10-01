<template>
  <!-- eslint-disable vue/valid-v-slot -->
  <VCard title="Seguimiento de Proyectos" class="mb-6 h-100">
    <VDataTable
      fixed-header
      height="340"
      :headers="headers"
      :items="proyectos"
      class="text-no-wrap"
      hide-default-footer
      :items-per-page="-1"
    >
      <!-- eslint-disable-next-line vue/no-empty-v-slot -->
      <template #bottom />

      <template #item.p="{ item }">
        <VChip
          :color="item.p === 1 ? 'error' : 'warning'"
          size="small"
        >
          Prioridad {{ item.p }}
        </VChip>
      </template>
      <template #item.porcentaje_total="{ item }">
        <div class="d-flex align-center gap-x-2">
          <VProgressLinear
            :model-value="item.porcentaje_total"
            color="primary"
            height="8"
            rounded
          />
          <span class="text-caption">{{ parseFloat(item.porcentaje_total).toFixed(1) }}%</span>
        </div>
      </template>
    </VDataTable>
  </VCard>
</template>

<script setup>
import { VDataTable } from 'vuetify/components'

defineProps({
  proyectos: { type: Array, default: () => [] },
})

const headers = [
  { title: 'ID', key: 'id', sortable: true },
  { title: 'CONTRATA', key: 'contrata', sortable: true },
  { title: 'INICIO', key: 'inicio', sortable: true },
  { title: 'FIN', key: 'fin', sortable: true },
  { title: 'PRIORIDAD', key: 'p', sortable: true },
  { title: 'AVANCE', key: 'porcentaje_total', sortable: true },
]
</script>