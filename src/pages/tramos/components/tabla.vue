<template>
  <VDataTable
    :headers="headers"
    :items="items"
    density="compact"
    :items-per-page="10"
    class="text-no-wrap"
  >
    <!-- Columna de Estado con Chip de color -->
    <template #item.estado="{ item }">
      <VChip
        :color="item.estado === 'pendiente' ? 'warning' : 'success'"
        size="small"
      >
        {{ item.estado }}
      </VChip>
    </template>

    <!-- Columna de Asignado con Icono -->
    <template #item.asignado="{ item }">
      <VBtn
        icon
        variant="text"
        size="small"
        :color="item.asignado ? 'success' : 'grey'"
        @click="$emit('toggleAsignacion', item)"
      >
        <VIcon
          :icon="
            item.asignado ? 'ri-checkbox-circle-fill' : 'ri-close-circle-line'
          "
        />
      </VBtn>
    </template>

    <template #item.asignado_a="{ item }">
      <VSelect
        :items="item.lista_tecnicos"
        :item-title="tecnico => `${tecnico.empresa} - ${tecnico.nombre_usuario}`"
        item-value="nombre_usuario"
        :model-value="item.asignado_a || null"
        :placeholder="item.asignado_a ? undefined : 'Seleccionar técnico...'"
        density="compact"
        hide-details
        style="min-width: 180px"
        @update:model-value="value => $emit('asignarTecnico', { id : item.id, tecnico: value })"
      />
    </template>

    <!-- Columna de Acciones -->
    <template #item.acciones="{ item }">
      <VMenu>
        <template #activator="{ props }">
          <VBtn
            icon="ri-more-2-fill"
            v-bind="props"
            size="small"
            variant="text"
          />
        </template>
        <VList>
          <VListItem @click="$emit('verDetalle', item)">
            <template #prepend>
              <VIcon
                :color="item.cant_licencia > 0 ? 'warning' : 'primary'"
                icon="ri-file-list-3-line"
              />
            </template>
            <VListItemTitle>{{
              item.cant_licencia > 0 ? "Editar Licencias" : "Asignar Licencias"
            }}</VListItemTitle>
          </VListItem>
          <VListItem @click="$emit('verTrabajos', item)">
            <template #prepend>
              <VIcon
                :color="item.cant_trabajo > 0 ? 'warning' : 'primary'"
                icon="ri-tools-line"
              />
            </template>
            <VListItemTitle>{{
              item.cant_trabajo > 0 ? "Editar Trabajos" : "Asignar Trabajos"
            }}</VListItemTitle>
          </VListItem>
          <VListItem @click="$emit('verCandados', item)">
            <template #prepend>
              <VIcon
                :color="item.cant_candado > 0 ? 'warning' : 'primary'"
                icon="ri-lock-line"
              />
            </template>
            <VListItemTitle>{{
              item.cant_candado > 0 ? "Editar Candados" : "Asignar Candados"
            }}</VListItemTitle>
          </VListItem>
          <VListItem @click="$emit('eliminarTramo', item.id)">
            <template #prepend>
              <VIcon color="error" icon="ri-delete-bin-line" />
            </template>
            <VListItemTitle class="text-error">Eliminar</VListItemTitle>
          </VListItem>
        </VList>
      </VMenu>
    </template>
  </VDataTable>
</template>

<script setup>
import { toValue } from 'vue';

const props = defineProps(["lista_tramos", "loading"]);
const emit = defineEmits([
  "verDetalle",
  "verTrabajos",
  "eliminarTramo",
  "verCandados",
  "toggleAsignacion",
  "asignarTecnico",
]);

const headers = [
  { title: "id", key: "id" },
  { title: "ID Proyecto", key: "id_proyecto" },
  { title: "directo ?", key: "tipo_enlace" },
  { title: "ip_tramo", key: "ip_tramo" },
  { title: "Nombre Tramo", key: "nombre_tramo" },
  { title: "Origen", key: "nodo_origen" },
  { title: "Destino", key: "nodo_destino" },
  { title: "Licencias", key: "cant_licencia", align: "center" },
  { title: "Candados", key: "cant_candado", align: "center" },
  { title: "Trabajos", key: "cant_trabajo", align: "center" },
  { title: "estado", key: "estado" },
  { title: "Asignado", key: "asignado", align: "center" },
  { title: "Asignado a", key: "asignado_a" },
  { title: "Acciones", key: "acciones", sortable: false },
];

const items = computed(() =>
  (props.lista_tramos ?? []).map((r) => ({
    id: r.id,
    id_proyecto: r.id_proyecto,
    tipo_enlace: r.tipo_enlace?.toUpperCase(),
    ip_tramo: r.ip_tramo,
    nombre_tramo: r.nombre_tramo,
    nodo_origen: r.nodo_origen,
    nodo_destino: r.nodo_destino,
    estado: r.estado,
    asignado: r.asignado === 1 || r.asignado === true,
    asignado_a: r.asignado_a, // <-- aquí
    lista_tecnicos: r.lista_tecnicos, // <-- aquí
    cant_licencia: r.cant_licencia,
    cant_candado: r.cant_candado,
    cant_trabajo: r.cant_trabajo,
    acciones: r.id,
  }))
);
</script>
