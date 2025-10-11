<template>
  <!-- Loader Global para la página -->
  <VOverlay
    v-model="isPageLoading"
    class="align-center justify-center"
    persistent
  >
    <VProgressCircular indeterminate color="primary" size="64" />
  </VOverlay>

  <h2>Seguimiento Contrata</h2>

  <!-- 1. Añadimos el campo de búsqueda -->
  <VRow>
    <!-- Buscador de Texto -->
    <VCol cols="12" md="4">
      <VTextField
        v-model="searchQuery"
        label="Buscar por Ip, Tramo."
        placeholder="Escribe para filtrar..."
        append-inner-icon="ri-search-line"
        single-line
        density="compact"
      />
    </VCol>

    <!-- Filtro por EECC -->
    <VCol cols="12" sm="6" md="2">
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

    <!-- Nuevo Filtro por Tiempo de Actualización -->
    <VCol cols="12" sm="6" md="2">
      <VSelect
        v-model="selectedUpdateTime"
        :items="[
          { title: 'Actualizado < 24h', value: '< 24h' },
          { title: 'Sin actualizar > 24h', value: '> 24h' },
        ]"
        label="Actualización"
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
          <VBtn icon variant="text" @click="sortDesc = !sortDesc">
            <VIcon :icon="sortDesc ? 'ri-sort-desc' : 'ri-sort-asc'" />
          </VBtn>
        </template>
      </VSelect>
    </VCol>

    <!-- Tarjetas renderizadas -->
    <VCol cols="12" lg="4" v-for="list in itemsList" :key="list.id">
      <card_seguimiento
        :lista_seguimiento="list"
        :user-role="userRole"
        @cargar_detalle="listar_detalle"
        @cargar_licencia="recibirIdDesdeTabla"
        @cargar_candado="cargarCandado"
        @cargar_fftt="cargarFiabilidad"
      />
    </VCol>

    <!-- Mensaje si no hay resultados -->
    <VCol
      v-if="!isPageLoading && itemsList.length === 0"
      cols="12"
      class="text-center"
    >
      <p>No se encontraron resultados para los filtros seleccionados.</p>
    </VCol>

    <!-- Controles de Paginación -->
    <VCol cols="12" class="d-flex justify-center mt-4">
      <VPagination
        v-model="currentPage"
        :length="totalPages"
        :total-visible="5"
        v-if="totalPages > 1"
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
    :data="lista_data"
    @save="crearLicencia"
    @cancel="openLicencia = false"
  />

  <DialogAvanceCandado
    :open="openDialogCandado"
    :candados-data="candadosData"
    @foto-subida="onFotoSubida"
    @update:open="openDialogCandado = $event"
    @cancel="openDialogCandado = false"
  />

  <DialogFiabilidad
    ref="dialogRef"
    :open="openFiabilidad"
    :items="fiabilidadData"
    :datostables="listaBusqueda"
    :rol_usuario="userRole"
    @save_registro="registrarFiabilidad"
    @update_registro="actualizarFiabilidad"
    @delete_registro="eliminarFiabilidad"
    @cancel="openFiabilidad = false"
  />

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
import { computed, ref } from "vue";
import {
  currentUser,
  initUser,
  logout as doLogout,
} from "@/composables/useAuth";
import DialogRegistrarAvance from "@/pages/seguimiento-ftth/components/DialogRegistrarAvance.vue";
import DialogLicencia from "@/pages/seguimiento-licencia/components/DialogLicencia.vue";
import card_seguimiento from "@/pages/seguimiento-ftth/components/card_seguimiento.vue";
import DialogAvanceCandado from "./components/DialogAvanceCandado.vue";
import DialogFiabilidad from "./components/DialogFiabilidad.vue";
import { VCol, VRow } from "vuetify/components";
import { useSeguimiento } from "./useSeguimiento.js";
import { useAvanceDialog } from "./useAvanceDialog.js";
import { useSnackbar } from "./useSnackbar.js";
import { useTramoDialog } from "@/pages/tramos/useTramoDialog.js";
import { useAvanceCandado } from "./useAvanceCandado.js";
import { useFiabilidadTecnica } from "./useFiabilidadTecnica.js";
const userRole = computed(() => currentUser.value?.role || "agente"); // Rol por defecto seguro

// Usamos los composables para obtener la lógica y el estado
const { snackbar, mostrarNotificacion } = useSnackbar();
const dialogRef = ref(null);
const {
  isPageLoading,
  itemsList,
  listaEECCs,
  searchQuery,
  selectedEECC,
  selectedStatus,
  selectedUpdateTime,
  sortBy,
  sortDesc,
  opcionesOrden,
  currentPage,
  totalPages,
  listar_asignaciones,
} = useSeguimiento();
const { isDialogVisible, detalleData, listar_detalle } = useAvanceDialog(
  isPageLoading,
  listar_asignaciones
);

definePage({
  meta: {
    roles: ["administrador", "tecnico", "agente"], // 👈 solo este rol puede entrar
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
  isPageLoading,
  onSuccess: listar_asignaciones,
});

const {
  openDialogCandado,
  candadosData,
  cargarCandado,
  onFotoSubida, // ← Agregar esta función
} = useAvanceCandado({
  snackbar,
  idSeleccionado,
  onSuccess: listar_asignaciones,
});

const {
  openFiabilidad,
  fiabilidadData,
  listaBusqueda,
  cargarFiabilidad,
  registrarFiabilidad,
  actualizarFiabilidad,
  eliminarFiabilidad,
} = useFiabilidadTecnica({
  snackbar,
  idSeleccionado,
  dialogRef,
  isPageLoading,
  onSuccess: listar_asignaciones,
});
</script>
