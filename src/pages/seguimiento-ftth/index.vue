<template>
    <!-- Loader Global para la página -->
    <VOverlay
        v-model="isPageLoading"
        class="align-center justify-center"
        persistent
    >
        <VProgressCircular
            indeterminate
            color="primary"
            size="64"
        />
    </VOverlay>

    <h2>Seguimiento Contrata</h2>

    <VRow>
        <VCol cols="12" lg="4" v-for="list in lista_asignacion">
            <card_seguimiento 
            :lista_seguimiento="list" 
            @cargar_detalle="listar_detalle"
            />
        </VCol>
    </VRow>

    <!-- Añadimos el componente de diálogo -->
    <DialogRegistrarAvance 
        v-model:is-dialog-visible="isDialogVisible"
        :detalle-data="detalleData"
        @datosActualizados="listar_asignaciones"
    />


</template>

<script setup>

import { onMounted, ref, computed } from 'vue';
import { currentUser, initUser, logout as doLogout } from '@/composables/useAuth'
import { $api } from '@/utils/api';
import DialogRegistrarAvance from '@/pages/seguimiento-ftth/components/DialogRegistrarAvance.vue'
import card_seguimiento from '@/pages/seguimiento-ftth/components/card_seguimiento.vue'
import { VCol, VRow } from 'vuetify/components';


const name = computed(() => currentUser.value?.nombre || currentUser.value?.username || 'Usuario')

const lista_asignacion = ref([])

// Refs para controlar el diálogo y almacenar los datos
const isDialogVisible = ref(false)
const detalleData = ref(null)
const isPageLoading = ref(false) // Ref para el loader global

onMounted(listar_asignaciones);

async function listar_asignaciones() {
    isPageLoading.value = true; // Activamos el loader
    try {
        const response = await $api(`internodal/listar-trabajos-asigandos/${name.value.toUpperCase()}`, {
            method: 'GET',
            onResponseError({ response }) {
                
            }
        })
        
        lista_asignacion.value = response.result;
        
    } catch (error) {
        
    } finally {
        isPageLoading.value = false; // Desactivamos el loader, tanto si hubo éxito como si hubo error
    }
}

const listar_detalle = async (item) => {
    isPageLoading.value = true; // Activamos el loader global
    try {
        const response = await $api(`internodal/listar-trabajos-tecnico-mufas/${item}`, {
            method: 'GET',
            onResponseError({ response }) {
                // El error ya será capturado por el bloque catch
                console.error('Error en la respuesta del API:', response._data);
            }
        });

        // Normalizamos la respuesta del API antes de pasarla al diálogo.
        // Renombramos la clave 'trabajo' a 'trabajos' para que coincida con lo que espera el diálogo.
        if (response.trabajo) {
            response.trabajos = response.trabajo;
            delete response.trabajo;
        }
        
        detalleData.value = response;
        isDialogVisible.value = true;
    } catch (error) {
        console.error('Error al listar el detalle:', error);
        // Aquí podrías mostrar una notificación de error al usuario
    } finally {
        isPageLoading.value = false; // Desactivamos el loader en cualquier caso
    }
}

definePage({
    meta: {
        roles: ['administrador','tecnico','agente'],   // 👈 solo este rol puede entrar
    },
})


</script>