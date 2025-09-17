<template>
  <v-card-text>
    <h5>Pex</h5>
    <VRow>
      <!-- Cada campo ahora es un componente dinámico -->
      <VCol cols="12" md="6">
        <DynamicStateInput
          v-model="formLocal.estado_pex"
          label="Estado Pex"
          :items="['CULMINADO', 'EN PROCESO', 'STAND BY']"
        />
      </VCol>

      <VCol cols="12" md="6">
        <DynamicStateInput
          v-model="formLocal.fecha_interna"
          label="Fecha Interna"
          :items="['OK', 'STAND BY']"
        />
      </VCol>

      <VCol cols="12" md="6">
        <DynamicStateInput v-model="formLocal.kick_off" label="Kick Off" :items="['OK', 'STAND BY']" />
      </VCol>

      <VCol cols="12" md="6">
        <DynamicStateInput v-model="formLocal.culminacion" label="Culminacion" :items="['EN PROCESO', 'OK', 'STAND BY']" />
      </VCol>
    </VRow>
  </v-card-text>
</template>

<script setup>
import { computed } from 'vue';
import DynamicStateInput from './DynamicStateInput.vue';

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:modelValue'])

// Usamos una computed property para el v-model
const formLocal = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

</script>