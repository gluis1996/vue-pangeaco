<template>
    <VDialog v-model="openLocal" max-width="1200" :retain-focus="false">
        <VCard>
            <VCardTitle class="text-h6">
                Editar Registro del Proyecto: {{ form.proyecto.ip || idProyecto }}
            </VCardTitle>
            <VCardSubtitle>
                Guarde los cambios de cada sección de forma independiente.
            </VCardSubtitle>

            <VCardText>
                <!-- Sección Proyecto -->
                <VCard border class="mb-4">
                    <VCardText>
                        <div class="d-flex justify-space-between align-center mb-4">
                            <h5 class="text-h5">Datos del Proyecto</h5>
                            <VBtn color="primary" @click="onUpdateProyecto">Actualizar</VBtn>
                        </div>
                        <FormProyecto v-model="form.proyecto" :options="options" />
                    </VCardText>
                </VCard>

                <!-- Sección Diseño -->
                <VCard border class="mb-4">
                    <VCardText>
                        <div class="d-flex justify-space-between align-center mb-4">
                            <h5 class="text-h5">Diseño</h5>
                            <VBtn color="primary" @click="onUpdateDiseno">Actualizar</VBtn>
                        </div>
                        <FormDiseno v-model="form.diseno" />
                    </VCardText>
                </VCard>

                <!-- Sección Integración -->
                <VCard border class="mb-4">
                    <VCardText>
                        <div class="d-flex justify-space-between align-center mb-4">
                            <h5 class="text-h5">Integración</h5>
                            <VBtn color="primary" @click="onUpdateIntegracion">Actualizar</VBtn>
                        </div>
                        <FormIntegracion v-model="form.integracion" />
                    </VCardText>
                </VCard>

                <!-- Sección Capex (Solo lectura, no necesita botón) -->
                <VCard border class="mb-4">
                    <VCardText>
                        <div class="d-flex justify-space-between align-center mb-4">
                            <h5 class="text-h5 mb-4">Capex (Cálculos)</h5>
                            <VBtn color="primary" @click="onUpdateCaPex">Actualizar</VBtn>
                        </div>                         
                        <FormCapex v-model="form" />
                    </VCardText>
                </VCard>

                <!-- Sección PEX -->
                <VCard border class="mb-4">
                    <VCardText>
                        <div class="d-flex justify-space-between align-center mb-4">
                            <h5 class="text-h5">PEX</h5>
                            <VBtn color="primary" @click="onUpdatePex">Actualizar</VBtn>
                        </div>
                        <FormPex v-model="form.pex" />
                    </VCardText>
                </VCard>

            </VCardText>

            <VCardActions class="justify-end">
                <VBtn color="secondary" variant="tonal" @click="onCancel">Cerrar</VBtn>
            </VCardActions>

            <!-- Snackbar para notificaciones -->
            <VSnackbar
                v-model="snackbar.show"
                :color="snackbar.color"
                :timeout="3000"
                location="top right"
            >
                {{ snackbar.message }}
            </VSnackbar>
        </VCard>
    </VDialog>

</template>

<script setup>
import { reactive, watch, computed } from 'vue'
import { VCardText, VCard, VCardTitle, VCardSubtitle, VCardActions, VBtn, VSnackbar } from 'vuetify/components'
import FormProyecto from './FormProyecto.vue' // 1. Importar el nuevo componente
import FormDiseno from './FormDiseno.vue' // 1. Importar el nuevo componente
import FormIntegracion from './FormIntegracion.vue' // 1. Importar el nuevo componente
import FormCapex from './FormCapex.vue' // 1. Importar el nuevo componente
import FormPex from './FormPex.vue'
import { $api } from '@/utils/api'

const props = defineProps({
    open: { type: Boolean, default: false },
    idProyecto: { type: [Number, String], default: null },
    initialData: { type: Object, default: () => ({}) },
    options: { type: Object, default: () => ({}) },
})

const emit = defineEmits(['update:open', 'cancel', 'data-updated', 'loading-start', 'loading-end'])

const hasChanges = ref(false) // Para rastrear si se ha hecho alguna actualización

// Estado para el Snackbar de notificaciones
const snackbar = reactive({
  show: false,
  message: '',
  color: 'warning',
})

const openLocal = computed({
    get: () => props.open,
    set: v => emit('update:open', v),
})

const form = reactive({
    proyecto: {}, diseno: {}, integracion: {}, capex: {}, pex: {}
})

watch(() => props.open, (isOpen) => {
    if (isOpen) {
        hasChanges.value = false // Reseteamos el estado al abrir
        // Usamos JSON.parse/stringify para crear una copia profunda y evitar modificar la prop
        const data = JSON.parse(JSON.stringify(props.initialData))
        form.proyecto = data.proyecto || {}
        form.diseno = data.diseno || {}
        form.integracion = data.integracion || {}
        form.capex = data.capex || {}
        form.pex = data.pex || {}
    }
}, { deep: true, immediate: true })


// --- Emisores de eventos para cada sección ---
async function onUpdateProyecto() {
    await handleUpdate('proyecto', form.proyecto, `/internodal/actualizar-proyecto/${props.idProyecto}`)
}

async function onUpdateDiseno() {
    await handleUpdate('diseño', form.diseno, `/internodal/actualizar-diseno/${props.idProyecto}`)
}

async function onUpdateIntegracion() {
    await handleUpdate('integración', form.integracion, `/internodal/actualizar-integracion/${props.idProyecto}`)
}

async function onUpdateCaPex() {
    await handleUpdate('PEX', form.capex, `/internodal/actualizar-capex/${props.idProyecto}`)
}

async function onUpdatePex() {
    await handleUpdate('PEX', form.pex, `/internodal/actualizar-pex/${props.idProyecto}`)
}

/**
 * Función genérica para manejar la actualización de cualquier sección.
 * @param {string} sectionName - Nombre de la sección para los logs.
 * @param {object} data - Los datos del formulario de la sección.
 * @param {string} url - El endpoint de la API para la actualización.
 */
async function handleUpdate(sectionName, data, url) {
    emit('loading-start')
    try {
        // Convertimos strings vacíos a null antes de enviar
        const payload = JSON.parse(JSON.stringify(data), (key, value) => {
            return value === '' ? null : value
        })

        const response = await $api(url, {
            method: 'PUT',
            body: payload,
            onResponseError({ response }) {
                snackbar.message = response._data.message || `Error al actualizar ${sectionName}.`
                snackbar.color = 'error'
                snackbar.show = true
            }
        })

        
        
        // Comprobamos si la actualización fue exitosa según tu criterio
        if (response.success && response.data?.affectedRows > 0) {
            snackbar.message = `¡Sección '${sectionName}' actualizada con éxito!`
            snackbar.color = 'info'
            snackbar.show = true
        }

        hasChanges.value = true // Marcamos que ha habido un cambio

        // Aquí podrías mostrar una notificación de éxito

    } catch (error) {
        console.error(`Error inesperado al actualizar ${sectionName}:`, error)
    } finally {
        emit('loading-end')
    }
}

function onCancel() {
    // Si hubo cambios, notificamos al padre para que recargue la tabla.
    if (hasChanges.value) {
        emit('data-updated')
    }
    emit('cancel')
    emit('update:open', false)
}
</script>