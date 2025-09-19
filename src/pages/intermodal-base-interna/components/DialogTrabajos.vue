<template>
    <VDialog :model-value="open" max-width="1200" @update:model-value="v => emit('update:open', v)">
        <VCard>
            <VCardTitle class="text-h6">Registrar/Editar Trabajos Asinados al Tecnico</VCardTitle>

            <FormTrabajos v-model="form" :options="props.options" />

            <VCardActions class="justify-end">
                <VBtn variant="text" @click="onCancel">Cancelar</VBtn>
                <VBtn color="primary" @click="onSubmit">{{ props.isEdit ? 'Editar' : 'Guardar' }}</VBtn>
            </VCardActions>
        </VCard>
    </VDialog>
</template>

<script setup>
import { reactive, watch } from 'vue'
import FormTrabajos from '@/pages/intermodal-base-interna/components/FormTrabajos.vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  idProyecto: { type: [String, Number], default: '' },
  initial: { type: Object, default: () => ({}) },
  isEdit: { type: Boolean, default: false },
  options: { type: Object, default: () => ({}) },
})
const emit = defineEmits(['update:open', 'submit', 'cancel'])

const defaultForm = () => ({
  // El v-model del select
  tipos_trabajos: [],
  // El array que contendrá los datos de los inputs
  medidas: [],
})
const form = reactive(defaultForm())

watch(
    () => [props.initial, props.idProyecto, props.open],
    () => {
        Object.assign(form, defaultForm(), props.initial || {})
    },
    { immediate: true, deep: true }
)

function onSubmit() {
    emit('submit', { id_proyecto: props.idProyecto, ...form, isEdit: props.isEdit })
    emit('update:open', false)
}

function onCancel() {
    emit('cancel')
    emit('update:open', false)
}

</script>