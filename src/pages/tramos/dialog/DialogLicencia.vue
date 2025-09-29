<template>
    <div>
        <VDialog 
            :model-value="open"
            max-width="1200px"
            @update:model-value="val => emit('update:open', val)"
        >
        <template #activator="{ props }">
            <!-- Activador del diálogo (puede ser un botón u otro elemento) -->
        </template>
        <VCard>
            <VCardTitle>Tramos del Proyecto</VCardTitle>
            <VCardText>
            
            </VCardText>
            <VCardActions>
            <VSpacer />
            <VBtn text @click="onCancel">Cerrar</VBtn>
            <VBtn text @click="onSave">guardar</VBtn>
            </VCardActions>
        </VCard>
        </VDialog>
    </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  open:         { type: Boolean, default: false },
})
const emit = defineEmits(['update:open', 'cancel', 'save'])

function onSave() {
    emit('save',{prueba: 'data'});
    emit('update:open', false);
}

function onCancel() {
    emit('cancel');
    emit('update:open', false);
}

</script>