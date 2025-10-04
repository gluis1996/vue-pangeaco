<!-- src/pages/intermodal-base-interna/components/FormDiseno.vue -->
<template>
  <VCardText>
          <VRow class="mt-2">
            <VCol cols="12" md="2">
                <v-select :items="['FASE 1', 'FASE 2', 'REDISEÑADO', 'NO']" v-model="formLocal.despliege_e_i" label="Despliege E.I." density="compact"></v-select>
            </VCol>
            <VCol cols="12" md="2">
                <v-select v-model="formLocal.router" :items="[1,2]" label="Router" density="compact"></v-select>
            </VCol>
            <VCol cols="12" md="2">
                <v-select :items="['ZTE', 'POR ADJUDICAR', 'HUAWEI', 'NO REQUIERE', 'NOKIA', 'OLT']" v-model="formLocal.proveedor" label="Proveedor" density="compact"></v-select>
            </VCol>
            <VCol cols="12" md="2">
                <v-select :items="['EN PROCESO','CULMINADO','STAND BY']" v-model="formLocal.integracion_intermodal" label="Integracion Intenodal" density="compact"></v-select>
            </VCol>
            <VCol cols="12" md="4">
                <DynamicStateInput v-model="formLocal.jumpeo" label="Junpeo" :items="['PENDIENTE PEXT', 'OK','SIN ACCESO']" />
            </VCol>
            <VDivider />
          </VRow>
        </VCardText>
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

const req = v => (!!v || v === 0) || 'Requerido'

</script>