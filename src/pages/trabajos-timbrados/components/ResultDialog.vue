<template>
  <VDialog :model-value="props.open" max-width="800"
           @update:model-value="val => { if (!val) emit('close') }">
    <VCard>
      <VCardTitle class="text-h6">{{ props.title }}</VCardTitle>
      <VCardText>
        <VAlert v-if="props.error" type="error" class="mb-3">
          {{ props.error }}
        </VAlert>

        <VProgressLinear v-else-if="props.loading" indeterminate />

        <template v-else>
          <div v-if="!props.items.length">Sin datos.</div>
          <table v-else class="w-100">
            <thead>
              <tr>
                <th v-for="h in Object.keys(props.items[0])" :key="h" class="text-left">
                  {{ h }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, i) in props.items" :key="i">
                <td v-for="h in Object.keys(props.items[0])" :key="h">
                  {{ row[h] }}
                </td>
              </tr>
            </tbody>
          </table>
        </template>
      </VCardText>

      <VCardActions>
        <VSpacer />
        <VBtn variant="text" @click="emit('close')">Cerrar</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<!-- components/ResultDialog.vue -->
<script setup>
const props = defineProps({
  open: Boolean,                         // ¿el diálogo está abierto?
  title: { type: String, default: 'Resultados' },
  items: { type: Array, default: () => [] }, // filas que mostrar
  loading: Boolean,                      // indicador de carga
  error: { type: String, default: '' },  // mensaje de error
})
const emit = defineEmits(['close'])      // el hijo puede pedir "cerrar"
</script>