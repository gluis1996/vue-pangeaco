<template>
    <VDialog :model-value="props.open" max-width="900" persistent @update:model-value="val => emit('update:open', val)">
        <VCard>
            <VCardTitle>Registrar Tramo para el proyecto {{ props.idProyecto }}</VCardTitle>

            <VCardText>
                <VForm ref="formRef" @submit.prevent="onGuardar">
                    <VRow>
                        <!-- IP Tramo -->
                        <VCol cols="12" md="6">
                            <VTextField
                                v-model="form.ip_tramo"
                                label="IP del Tramo"
                                placeholder="P-XX-XXXXXXXX"
                                density="compact"
                                autofocus
                            />
                        </VCol>

                        <!-- Orden -->
                        <VCol cols="12" md="6">
                            <VTextField
                                :model-value="form.orden"
                                label="Orden del Tramo"
                                density="compact"
                                readonly
                                variant="outlined"
                            />
                        </VCol>

                        <!-- Nombre Tramo -->
                        <VCol cols="12">
                            <VTextField
                                :model-value="nombreTramo"
                                label="Nombre del Tramo"
                                density="compact"
                                readonly
                                variant="outlined"
                            />
                        </VCol>

                        <!-- Nodo Origen -->
                        <VCol cols="12" md="6">
                            <VTextField
                                :model-value="form.nodo_origen"
                                label="Nodo Origen"
                                density="compact"
                                readonly
                                variant="outlined"
                            />
                        </VCol>

                        <!-- Nodo Destino -->
                        <VCol cols="12" md="6">
                            <VTextField
                                :model-value="form.nodo_destino"
                                label="Nodo Destino"
                                density="compact"
                                readonly
                                variant="outlined"
                            />
                        </VCol>
                    </VRow>
                </VForm>
            </VCardText>

            <VCardActions>
                <VSpacer />
                <VBtn color="secondary" variant="tonal" @click="onCancel">Cancelar</VBtn>
                <VBtn color="primary" @click="onGuardar">Guardar Tramo</VBtn>
            </VCardActions>
        </VCard>
    </VDialog>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue';

const props = defineProps({
    open: { type: Boolean, default: false },
    idProyecto: { type: [Number, String] },
    tramosDisponibles: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['update:open', 'close', 'guardar'])

const formRef = ref(null)
const form = reactive({
    ip_tramo: '',
    orden: null,
    nodo_origen: '',
    nodo_destino: '',
})

const nombreTramo = computed(() => {
    if (form.nodo_origen && form.nodo_destino) {
        return `${form.nodo_origen} - ${form.nodo_destino}`;
    }
    return '';
});

watch(() => props.open, (isOpen) => {
    if (isOpen && props.tramosDisponibles) {
        form.ip_tramo = '';
        form.orden = props.tramosDisponibles.orden_origen;
        form.nodo_origen = props.tramosDisponibles.nombre_origuen;
        form.nodo_destino = props.tramosDisponibles.nombre_destino;
        formRef.value?.resetValidation();
    }
}, { immediate: true });

async function onGuardar() {
    const { valid } = await formRef.value?.validate();
    if (!valid) return;

    const payload = {
        id_proyecto: props.idProyecto,
        ...form,
        nombre_tramo: nombreTramo.value,
    };
    emit('guardar', payload);
    emit('update:open', false);
}

function onCancel() {
    emit('close')
    emit('update:open', false)
}
</script>