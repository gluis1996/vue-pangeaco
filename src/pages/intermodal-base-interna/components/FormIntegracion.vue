<!-- src/pages/intermodal-base-interna/components/FormDiseno.vue -->
<template>
  <VCardText>
          <h5>Integracion</h5>
          <VRow>
            <VCol cols="12" md="2">
                <v-select :items="['ok', 'no']" v-model="formLocal.despliege_e_i" label="Despliege E.I." density="compact"></v-select>
            </VCol>
            <VCol cols="12" md="2">
                <VTextField v-model="formLocal.router" type="number" :rules="[req, v => v >= 0 || 'No se admiten negativos']" label="Router" density="compact" suffix="cant"></VTextField>
            </VCol>
            <VCol cols="12" md="2">
                <v-select :items="['ZTE', 'POR ADJUDICAR', 'HUAWEI', 'NO REQUIERE', 'NOKIA', 'OLT']" v-model="formLocal.proveedor" label="Proveedor" density="compact"></v-select>
            </VCol>
            <VCol cols="12" md="2">
                <v-select :items="['EN PROCESO','CULMINADO','STAND BY']" v-model="formLocal.integracion_intermodal" label="Integracion Intenodal" density="compact"></v-select>
            </VCol>
            <VCol cols="12" md="2">
                <v-select :items="['PENDIENTE PEXT', 'OK','SIN ACCESO']" v-model="formLocal.jumpeo" label="Junpeo" density="compact"></v-select>
            </VCol>
            <VDivider />
          </VRow>
        </VCardText>
</template>

<script setup>
import { computed } from 'vue';

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