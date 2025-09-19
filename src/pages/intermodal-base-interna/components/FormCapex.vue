<template>
  <VCardText>
          <h5>Capex</h5>
          <VRow>
            <VCol cols="12" md="2">
              <v-text-field v-model="formLocal.capex.mat" type="number" label="Mat" suffix="$"></v-text-field>
            </VCol>
            <VCol cols="12" md="2">
              <v-text-field v-model="formLocal.capex.mo" type="number" label="Mo" suffix="$"></v-text-field>
            </VCol>
            <VCol cols="12" md="2">
                <v-text-field v-model="capexTotal" label="Capex" type="number" suffix="$" readonly></v-text-field>
            </VCol>
            <VCol cols="12" md="2">
                <v-text-field v-model="costoAereo" label="Costo Aéreo" type="number" suffix="$" readonly></v-text-field>
            </VCol>
            <VCol cols="12" md="2">
                <v-text-field v-model="costoOpexSub" label="Costo Sub" type="number" suffix="$" readonly></v-text-field>
            </VCol>
            <VCol cols="12" md="2">
                <v-text-field v-model="costoOpex" label="Costo Opex" type="number" suffix="$" readonly></v-text-field>
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

const capexTotal = computed(() => {
  const mat = Number(formLocal.value.capex.mat) || 0
  const mo = Number(formLocal.value.capex.mo) || 0
  return mat + mo
})

const costoAereo = computed(() => {
  const valorAereo = Number(formLocal.value.diseno.aereo) || 0
  return Math.ceil(valorAereo / 50) * 3.75 * 1.4 * 12
})

const costoOpexSub = computed(() => {
  const vasred = Number(formLocal.value.diseno.sub_s_red) || 0
  return Math.ceil(vasred / 100) * 73.84 * 12
})

const costoOpex = computed(() => {
  return costoAereo.value + costoOpexSub.value
})

</script>