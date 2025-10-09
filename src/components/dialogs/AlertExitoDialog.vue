<template>
    <VDialog v-model="openDialog" max-width="500px" persistent>
        <VCard>
            <VCardTitle>Exito</VCardTitle>
            <VCardText>{{ mensaje }}</VCardText>
        </VCard>
    </VDialog>
</template>

<script setup>
const props = defineProps({
  open: { type: Boolean, default: false },
  mensaje: { type: String, default: '' },
})
const emit = defineEmits(['update:open', 'cancel'])
const openDialog = defineModel("openDialog");
</script>