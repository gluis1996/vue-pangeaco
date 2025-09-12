<template>
  <div class="flex items-center gap-3">
    <!-- Usa tu componente existente -->
    <AppDateTimePicker
      v-model="date"
      label="Fecha"
      placeholder="Selecciona fecha"
    />
    <VBtn color="primary" @click="consultar">Consultar</VBtn>
  </div>

  <ResultDialog
    :open="open"
    :title="`Resultado (${date || '–'})`"
    :items="items"
    :loading="loading"
    :error="error"
    @close="open = false"
  />
</template>

<!-- pages/Index.vue -->
<script setup>
import { ref } from 'vue'
import ResultDialog from '@/pages/trabajos-timbrados/components/ResultDialog.vue'

const date = ref('')          // fecha seleccionada
const open = ref(false)       // controla el diálogo
const items = ref([])         // resultados de la API
const loading = ref(false)
const error = ref('')

async function consultar() {
  if (!date.value) {
    error.value = 'Selecciona una fecha.'
    items.value = []
    open.value = true
    return
  }

  open.value = true
  loading.value = true
  error.value = ''
  items.value = []

  try {
    // Ajusta la URL/param según tu backend
    console.log(date.value);
    
  } catch (e) {
    error.value = e?.message ?? 'Error consultando la API.'
  } finally {
    loading.value = false
  }
}
</script>