<template>
    <VDialog 
        :model-value="open" 
        max-width="1200" 
        @update:model-value="v => emit('update:open', v)"
    >
        <VCard>
            <VCardTitle class="text-h6">Registrar/Editar Trabajos Asinados al Tecnico {{ idProyecto }}</VCardTitle>

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
  idProyecto: { type: [String, Number], default: 0 },
  initialData: { type: Object, default: () => ({}) },
  isEdit: { type: Boolean, default: false },
  options: { type: Object, default: () => ({}) },
})
const emit = defineEmits(['update:open', 'submit', 'cancel'])

const defaultForm = () => ({
  // El v-model del select
  tipos_trabajos: [], // IDs de los trabajos seleccionados
  // El array que contendrá los datos de los inputs
  medidas: [],
})
const form = reactive(defaultForm())

watch(
    () => props.open,
    (isOpen) => {
        if (isOpen) {
            // Cuando se abre el diálogo, lo inicializamos.
            const initial = props.initialData || {};
            
            const trabajosExistentes = initial.trabajo || [];
            
            // 1. Pre-seleccionar los checkboxes con los trabajos que ya existen.
            const tiposTrabajosIds = trabajosExistentes.map(t => t.tipo_id);

            // 2. Mapear los trabajos existentes al formato que espera 'FormTrabajos' (medidas).
            const medidas = trabajosExistentes.map(t => ({
                id: t.id, // <-- ¡Añadimos el ID del trabajo!
                id_tipo: t.tipo_id,
                nombre: t.nombre,
                unidad: t.unidad,
                total: t.total || '',
                trabajado: t.trabajados || '',
            }));

            Object.assign(form, defaultForm(), { tipos_trabajos: tiposTrabajosIds, medidas: medidas });
        }
    },
    { immediate: true }
)

function onSubmit() {
    emit('submit', { id_tramos: props.idProyecto, isEdit: props.isEdit, ...form })
    emit('update:open', false)
}

function onCancel() {
    emit('cancel')
    emit('update:open', false)
}

</script>