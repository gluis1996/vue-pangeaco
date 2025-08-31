<template>
  <VCard variant="outlined" class="px-3 py-2">
    <VRow class="align-center">
      <VCol cols="12" md="7" class="py-2">
        <div class="text-subtitle-1 font-weight-bold">
          {{ zona.departamento }} - {{ zona.sitio }}<span v-if="zona.distrito"> - {{ zona.distrito }}</span>
        </div>
      </VCol>
      <VCol cols="12" md="5" class="d-flex gap-2 justify-end py-2">
        <VBtn color="success" size="small" @click="$emit('add-route')">Agregar Ruta</VBtn>
        <VBtn color="error" size="small" @click="$emit('remove-zone')">Eliminar Zona</VBtn>
      </VCol>
    </VRow>

    <div class="table-scroll">
      <table class="tabla-zona">
        <thead>
          <tr>
            <th>Ruta</th>
            <th v-for="(f, fi) in zona.fechas" :key="fi">
              {{ f }}
              <VBtn icon size="x-small" variant="text" @click="$emit('remove-day', fi)" class="ml-1">
                <VIcon size="14">mdi-close</VIcon>
              </VBtn>
            </th>
            <th>T</th>
            <th>A</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(r, ri) in zona.rutas" :key="ri">
            <td class="col-ruta">{{ r.nombre }}</td>
            <td v-for="(f, fi) in zona.fechas" :key="fi" class="col-num">
              <VTextField
                v-model.number="zona.rutas[ri].ctos[fi]"
                type="number"
                density="compact"
                hide-details
                min="0"
                @update:modelValue="$emit('recalc')"
              />
            </td>
            <td class="col-num">{{ totalFila(ri) }}</td>
            <td class="col-num">
              <VBtn color="error" size="x-small" @click="$emit('remove-route', ri)">X</VBtn>
            </td>
          </tr>
          <tr class="fila-total">
            <td>Total</td>
            <td v-for="(f, fi) in zona.fechas" :key="'t-'+fi" class="col-num">
              {{ totalPorDia(fi) }}
            </td>
            <td class="col-num">{{ totalZona }}</td>
            <td></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="d-flex justify-end mt-3">
      <VBtn color="primary" @click="$emit('process')">Procesar Asignación CTO</VBtn>
    </div>
  </VCard>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  zona: { type: Object, required: true },
})

defineEmits(['add-route','remove-route','remove-day','remove-zone','process','recalc'])

const totalFila = (ri) => props.zona.rutas[ri].ctos.reduce((a, b) => a + (+b || 0), 0)
const totalPorDia = (fi) => props.zona.rutas.reduce((a, r) => a + (+r.ctos[fi] || 0), 0)
const totalZona = computed(() =>
  props.zona.rutas.reduce((acc, r) => acc + r.ctos.reduce((a, b) => a + (+b || 0), 0), 0)
)
</script>

<style scoped>
.table-scroll { overflow-x: auto; }
.tabla-zona { width: 100%; border-collapse: collapse; }
.tabla-zona th, .tabla-zona td { border: 1px solid rgba(0,0,0,0.08); padding: 6px 8px; white-space: nowrap; }
.tabla-zona .col-num { text-align: center; min-width: 70px; }
.tabla-zona .col-ruta { min-width: 120px; font-weight: 600; }
.fila-total { background: rgba(0,0,0,0.03); font-weight: 600; }
</style>
