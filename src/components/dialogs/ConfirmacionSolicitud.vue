<template>
  <VDialog v-model="openDialogAsignacion" max-width="500px" persistent>
    <VCard>
      <VCardTitle class="text-h5">{{
        props.titulo || "Confirmar Acción"
      }}</VCardTitle>
      <VCardText>
        {{ props.mensaje }}
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn
          color="secondary"
          variant="tonal"
          @click="openDialogAsignacion = false"
        >
          Cancelar
        </VBtn>
        <VBtn
          color="primary"
          variant="elevated"
          @click="emit('confirmar', props.valor)"
        >
          Confirmar
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<script setup>
import { can } from '@/@layouts/plugins/casl';

const props = defineProps({
  mensaje: { type: String, required: true },
  openDialog: { type: Boolean, required: true },
  valor: { type: [String, Number, Object], default: null },
  titulo: { type: String, default: "" },
});
const emit = defineEmits(["confirmar"]);
const openDialogAsignacion = defineModel("openDialog");
</script>
