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

    <!-- 1. Añadimos el campo de búsqueda -->
    <VRow>
        <!-- Buscador de Texto -->
        <VCol cols="12" md="5">
            <VTextField
                v-model="searchQuery"
                label="Buscar por IP, Nodo, EECC..."
                placeholder="Escribe para filtrar..."
                append-inner-icon="ri-search-line"
                single-line
                density="compact"
            />
        </VCol>

        <!-- Filtro por EECC -->
        <VCol cols="12" sm="6" md="3">
            <VSelect
                v-model="selectedEECC"
                :items="listaEECCs"
                label="Filtrar por EECC"
                density="compact"
                clearable
            />
        </VCol>

        <!-- Menú de Ordenamiento -->
        <VCol cols="12" sm="6" md="4">
            <VSelect
                v-model="sortBy"
                :items="opcionesOrden"
                item-title="text"
                item-value="value"
                label="Ordenar por"
                density="compact"
            >
                <template #append>
                    <VBtn 
                        icon 
                        variant="text" 
                        @click="sortDesc = !sortDesc"
                    >
                        <VIcon :icon="sortDesc ? 'ri-sort-desc' : 'ri-sort-asc'" />
                    </VBtn>
                </template>
            </VSelect>
        </VCol>

        <!-- Tarjetas renderizadas -->
        <VCol cols="12" lg="4" v-for="list in processedList">
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


const name = computed(() => currentUser.value?.role || currentUser.value?.role || 'role')

const lista_asignacion = ref([])

// Refs para controlar el diálogo y almacenar los datos
const isDialogVisible = ref(false)
const detalleData = ref(null)
const isPageLoading = ref(false) // Ref para el loader global
const searchQuery = ref('') // 2. Variable para el texto de búsqueda

// --- Nuevos refs para filtros y ordenamiento ---
const selectedEECC = ref(null) // Para el filtro de EECC
const sortBy = ref('update_at') // Criterio de ordenamiento por defecto
const sortDesc = ref(true) // Orden descendente por defecto (más nuevos primero)
const opcionesOrden = [
    { text: 'Última Actualización', value: 'update_at' },
    { text: 'Mayor Avance', value: 'avance_total' },
    { text: 'Prioridad', value: 'prioridad' },
]

onMounted(listar_asignaciones);

async function listar_asignaciones() {
    isPageLoading.value = true; // Activamos el loader
    try {
        console.log(name.value);
        const response = await $api(`internodal/listar-trabajos-asigandos/`, {
            method: 'GET',
            onResponseError({ response }) {
                
            }
        })
        
        lista_asignacion.value = response.result || [];
        
    } catch (error) {
        console.error("Error al listar asignaciones:", error);
        lista_asignacion.value = []; // Aseguramos que sea un array en caso de error
    } finally {
        isPageLoading.value = false; // Desactivamos el loader, tanto si hubo éxito como si hubo error
    }
}

// --- Propiedades Computadas para la Lógica de UI ---

// Extrae una lista única de EECCs de los datos cargados
const listaEECCs = computed(() => {
    const eeccs = new Set(lista_asignacion.value.map(item => item.eecc));
    return Array.from(eeccs).filter(Boolean); // Filtra nulos o vacíos
});

// Propiedad computada principal que aplica filtros y ordenamiento
const processedList = computed(() => {
    let items = [...lista_asignacion.value];

    // 1. Aplicar filtro de texto
    if (searchQuery.value) {
        const lowerCaseQuery = searchQuery.value.toLowerCase();
        items = items.filter(item => {
            const ip = item.ip?.toLowerCase() || '';
            const eecc = item.eecc?.toLowerCase() || '';
            const nodo = item.nodo?.toLowerCase() || '';
            const nodoConcentrador = item.nodo_concentrador?.toLowerCase() || '';
            return ip.includes(lowerCaseQuery) || eecc.includes(lowerCaseQuery) || nodo.includes(lowerCaseQuery) || nodoConcentrador.includes(lowerCaseQuery);
        });
    }

    // 2. Aplicar filtro por EECC
    if (selectedEECC.value) {
        items = items.filter(item => item.eecc === selectedEECC.value);
    }

    // 3. Aplicar ordenamiento
    if (sortBy.value) {
        items.sort((a, b) => {
            let valA = a[sortBy.value];
            let valB = b[sortBy.value];

            // Manejo especial para fechas (cadenas)
            if (sortBy.value === 'update_at') {
                valA = new Date(valA);
                valB = new Date(valB);
            }

            if (valA < valB) return sortDesc.value ? 1 : -1;
            if (valA > valB) return sortDesc.value ? -1 : 1;
            return 0;
        });
    }
    return items;
});

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