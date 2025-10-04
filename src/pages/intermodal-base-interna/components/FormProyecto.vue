<template>
    <v-card-text>
        <VRow>
            <!-- Proyecto -->
            <VCol cols="12" md="2">
                <VSelect v-model="formLocal.eecc" :items="['LARI','DOMINION','LITEYCA','COMFICA','COBRA']" label="EECC" :rules="[req]" density="compact" />
            </VCol>

            <VCol cols="12" md="2">
                <VSelect v-model="formLocal.prioridad" :items="[1,2]" label="Prioridad" :rules="[req]" density="compact" />
            </VCol>

            <VCol cols="12" md="2">
                <NodoSelect v-model="formLocal.nodo" :items="options.nodos" />
            </VCol>

            <VCol cols="12" md="2">
                <VTextField v-model="formLocal.uips" label="UIPS" density="compact" />
            </VCol>

            <VCol cols="12" md="2">
                <VSelect v-model="formLocal.region" :items="options.regiones" label="Región" :rules="[req]"
                density="compact" />
            </VCol>

            <VCol cols="12" md="2">
                <VSelect v-model="formLocal.departamento" :items="options.departamentos" label="Departamento" :rules="[req]"
                density="compact" />
            </VCol>

            <VCol cols="12" md="2">
                <NodoSelect v-model="formLocal.nodo_concentrador" :items="options.nodos" :label="'Nodo Concentrador'" 
                :rules="[req]" density="compact" />
            </VCol>

            <VCol cols="12" md="2">
                <VSelect v-model="formLocal.desplieges_router" :items="['FASE 1', 'FASE 2', 'ANILLO']" label="Despliege Router"
                density="compact" />
            </VCol>

            <VCol cols="12" md="2">
                <VSelect v-model="formLocal.enlace" :items="['PRINCIPAL', 'RESPALDO', 'NO']" label="Enlace"
                density="compact" />
            </VCol>

            <VCol cols="12" md="4">
                <DynamicStateInput v-model="formLocal.comercial" label="Comercial" :items="['STAND BY', 'OK']" />
            </VCol>
            
            <VCol cols="12" md="2">
                <VSelect v-model="formLocal.tipo_enlace" :items="['Tramos', 'Directo']" label="Tramos?"
                density="compact" />
            </VCol>

            <VDivider />
        </VRow>
    </v-card-text>
</template>

<script setup>
import { computed } from 'vue';
import DynamicStateInput from './DynamicStateInput.vue';
import NodoSelect from './NodoSelect.vue';

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
  options: {
    type: Object,
    default: () => ({
      regiones: [],
      departamentos: [],
      nodos: [],
      nodosConcentrador: [],
    }),
  },
})

const emit = defineEmits(['update:modelValue'])

const req = v => !!v || 'Requerido'

// Usamos una computed property para el v-model
const formLocal = computed({
  get: () => {
    return props.modelValue
  },
  set: (value) => {
    emit('update:modelValue', value)
  }
})

</script>