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
                label="Buscar por Principal, Tramo, EECC..."
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

        <!-- Filtro por Estado de Asignación -->
        <VCol cols="12" sm="6" md="2">
            <VSelect
                v-model="selectedStatus"
                :items="['Asignados', 'Sin Asignar']"
                label="Estado"
                density="compact"
                clearable
            />
        </VCol>
        <!-- Menú de Ordenamiento -->
        <VCol cols="12" sm="6" md="2">
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
              :user-role="userRole"
              @cargar_detalle="listar_detalle"
              @cargar_licencia="recibirIdDesdeTabla"
            />
        </VCol>
    </VRow>

    <!-- Añadimos el componente de diálogo -->
    <DialogRegistrarAvance 
        v-model:is-dialog-visible="isDialogVisible"
        :detalle-data="detalleData"
        @trabajoActualizado="mostrarNotificacion"
        @datosActualizados="listar_asignaciones"
    />

      <DialogLicencia 
        v-model:open="openLicencia" 
        :id_proyecto="idSeleccionado" 
        :items="licenciasDelProyecto"
        :isedit="licenciasDelProyecto.length > 0" 
        :minimo="licenciasDelProyecto.length" 
        :user-role="currentUser?.role"
        :data="lista_data" @save="crearLicencia" @cancel="openLicencia = false" />

    <!-- Snackbar para notificaciones -->
    <VSnackbar
        v-model="snackbar.show"
        :color="snackbar.color"
        :timeout="3000"
        location="top right"
    >
        {{ snackbar.message }}
    </VSnackbar>

 
</template>

<script setup>

import { computed, ref } from 'vue';
import { currentUser, initUser, logout as doLogout } from '@/composables/useAuth'
import DialogRegistrarAvance from '@/pages/seguimiento-ftth/components/DialogRegistrarAvance.vue'
import DialogLicencia from '@/pages/seguimiento-licencia/components/DialogLicencia.vue'
import card_seguimiento from '@/pages/seguimiento-ftth/components/card_seguimiento.vue'
import { VCol, VRow } from 'vuetify/components';
import { useSeguimiento } from './useSeguimiento.js';
import { useAvanceDialog } from './useAvanceDialog.js';
import { useSnackbar } from './useSnackbar.js';
import { useTramoDialog } from '@/pages/tramos/useTramoDialog.js';
 
const userRole = computed(() => currentUser.value?.role || 'agente') // Rol por defecto seguro

// Usamos los composables para obtener la lógica y el estado
const { snackbar, mostrarNotificacion } = useSnackbar();

const {
    isPageLoading,
    searchQuery,
    selectedEECC,
    selectedStatus,
    sortBy,
    sortDesc,
    opcionesOrden,
    listaEECCs,
    processedList,
    listar_asignaciones
} = useSeguimiento();
const { isDialogVisible, detalleData, listar_detalle } = useAvanceDialog(isPageLoading, listar_asignaciones);

definePage({
    meta: {
        roles: ['administrador','tecnico','agente'],   // 👈 solo este rol puede entrar
    },
});

const idSeleccionado = ref(null);

const {
  recibirIdDesdeTabla,
  crearLicencia,
  openLicencia,
  lista_data,
  licenciasDelProyecto,
} = useTramoDialog({
  snackbar,
  idSeleccionado,
  onSuccess: listar_asignaciones,
});

</script>