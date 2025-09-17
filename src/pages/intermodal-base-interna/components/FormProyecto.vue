<template>
    <v-card-text>
        <h5>Proyecto</h5>
        <VRow>
            <!-- Proyecto -->
            <VCol cols="12" md="2">
                <VTextField v-model="formLocal.ip" label="IP" density="compact" />
            </VCol>

            <VCol cols="12" md="2">
                <VSelect v-model="formLocal.eecc" :items="['LARI','DOMINION','LITEYCA','COMFICA','COBRA']" label="EECC" :rules="[req]" density="compact" />
            </VCol>

            <VCol cols="12" md="2">
                <VTextField v-model="formLocal.prioridad" type="number" label="Prioridad" :rules="[req]" density="compact" />
            </VCol>

            <VCol cols="12" md="2">
                <VTextField v-model="formLocal.nodo" label="Nodo" :rules="[req]" density="compact" />
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
                <VSelect v-model="formLocal.nodo_concentrador" :items="options.nodosConcentrador" label="Nodo concentrador"
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

            <VCol cols="12" md="2">
                <VSelect v-model="formLocal.comercial" :items="['STAND BY', 'OK']" label="Comercial" density="compact" />
            </VCol>

            <VDivider />
        </VRow>
    </v-card-text>
</template>

<script setup>
import { computed } from 'vue';

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
      nodosConcentrador: [],
    }),
  },
})

const emit = defineEmits(['update:modelValue'])

const req = v => !!v || 'Requerido'
// Usamos una computed property para el v-model
const formLocal = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

</script>