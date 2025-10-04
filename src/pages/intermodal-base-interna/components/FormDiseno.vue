<!-- src/pages/intermodal-base-interna/components/FormDiseno.vue -->
<template>
  <VCardText>
    <VRow class="mt-2">
      <VCol cols="12" md="2">
        <v-select
          v-model="formLocal.estado_diseño"
          :items="['EN PROCESO', 'CULMINADO', 'STAND BY']"
          label="Estado Diseño"
          density="compact"
        ></v-select>
      </VCol>
      <VCol cols="12" md="2">
        <VTextField
          v-model="formLocal.distancia"
          type="number"
          label="Distancia"
          density="compact"
          :min="0"
          :rules="[req, (v) => v >= 0 || 'No se admiten negativos']"
          suffix="mt"
        ></VTextField>
      </VCol>
      <VCol cols="12" md="2">
        <VTextField
          v-model="formLocal.aereo"
          type="number"
          label="Tramo Total Aéreo"
          :min="0"
          :rules="[req, (v) => v >= 0 || 'No se admiten negativos']"
          suffix="mt"
          density="compact"
        ></VTextField>
      </VCol>
      <VCol cols="12" md="2">
        <VTextField
          v-model="formLocal.sub_c_red"
          type="number"
          label="T. Sub. C. FTTH"
          density="compact"
          suffix="mt"
          :min="0"
          :rules="[req, (v) => v >= 0 || 'No se admiten negativos']"
        ></VTextField>
      </VCol>

      <VCol cols="12" md="2">
        <VTextField
          v-model="formLocal.sub_s_red"
          type="number"
          label="T. Sub. S. FTTH"
          density="compact"
          suffix="mt"
          :min="0"
          :rules="[req, (v) => v >= 0 || 'No se admiten negativos']"
        />
      </VCol>

      <VCol cols="12" md="2">
        <VTextField
          v-model="formLocal.tramo"
          type="number"
          label="Tramo"
          density="compact"
          suffix="mt"
          :min="0"
          :rules="[req, (v) => v >= 0 || 'No se admiten negativos']"
          readonly
        ></VTextField>
      </VCol>

      <VCol cols="12" md="4">
        <VTextField
          v-model="formLocal.pasivo_origen"
          type="text"
          label="Pasivo Origen"
          density="compact"
        ></VTextField>
      </VCol>

      <VCol cols="12" md="4">
        <VTextField
          v-model="formLocal.pasivo_destino"
          type="text"
          label="Pasivo Destino"
          density="compact"
        ></VTextField>
      </VCol>

      <VCol cols="12" md="2">
        <VTextField
          v-model="formLocal.canalizacion_nueva"
          type="number"
          label="Canalización Nueva"
          density="compact"
          suffix="un"
          :min="0"
          :rules="[req, (v) => v >= 0 || 'No se admiten negativos']"
        />
      </VCol>

      <VCol cols="12" md="2">
        <VTextField
          v-model="formLocal.camaras_aperturar"
          type="number"
          label="Cámaras a Aperturar"
          density="compact"
          suffix="un"
          :min="0"
          :rules="[req, (v) => v >= 0 || 'No se admiten negativos']"
        />
      </VCol>

      <VCol cols="12" md="2">
        <VTextField
          v-model="formLocal.postes_electricos_existente"
          type="number"
          label="Postes Eléctricos Existente"
          density="compact"
          suffix="mt"
          :min="0"
          :rules="[req, (v) => v >= 0 || 'No se admiten negativos']"
        />
      </VCol>

      <VCol cols="12" md="2">
        <VTextField
          v-model="formLocal.postes_propios_existentes"
          type="number"
          label="Postes Propios Existentes"
          density="compact"
          suffix="mt"
          :min="0"
          :rules="[req, (v) => v >= 0 || 'No se admiten negativos']"
        />
      </VCol>

      <VCol cols="12" md="2">
        <VTextField
          v-model="formLocal.postes_tdp_existentes"
          type="number"
          label="Postes TDP Existentes"
          density="compact"
          suffix="mt"
          :min="0"
          :rules="[req, (v) => v >= 0 || 'No se admiten negativos']"
        />
      </VCol>

      <VCol cols="12" md="2">
        <VTextField
          v-model="formLocal.postes_nuevos_generar"
          type="number"
          label="Postes Nuevos a Generar"
          density="compact"
          suffix="mt"
          :min="0"
          :rules="[req, (v) => v >= 0 || 'No se admiten negativos']"
        />
      </VCol>

      

      <VDivider />
    </VRow>
  </VCardText>
</template>

<script setup>
import { computed, watch } from "vue";

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["update:modelValue"]);

// Usamos una computed property para el v-model
const formLocal = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

// La regla 'req' la necesitará este componente también
const req = (v) => !!v || v === 0 || "Requerido";

watch(
  () => [
    formLocal.value.aereo,
    formLocal.value.sub_c_red,
    formLocal.value.sub_s_red,
  ],
  ([aereo, subCRed, subSRed]) => {
    const sum =
      (Number(aereo) || 0) + (Number(subCRed) || 0) + (Number(subSRed) || 0);
    formLocal.value.tramo = sum;
  }
);
</script>
