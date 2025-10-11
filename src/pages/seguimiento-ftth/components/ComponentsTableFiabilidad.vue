<template>
  <div class="table-container">
    <VTable density="compact" class="custom-table">
      <thead>
        <tr>
          <th class="header-th">id</th>
          <th class="header-th">fase</th>
          <th class="header-th">enlace</th>
          <th class="header-th">nodo</th>
          <th class="header-th">odf</th>
          <th class="header-th">modulo</th>
          <th class="header-th">bandeja</th>
          <th class="header-th">puerto</th>
          <th class="header-th">cable</th>
          <th class="header-th">hilo</th>
          <th>router</th>
          <th>puerto_router</th>
          <th>enlace_final</th>
          <th>obs</th>
          <th>obs2</th>
          <th>distancia</th>
          <th>sfp</th>
          <th>sfp_entregar</th>
          <th>estado_final</th>
          <th>router_interior</th>
          <th>ip</th>
          <th>contrata</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, idx) in items2" :key="item.id || idx">
          <td>{{ item.id }}</td>
          <td>{{ item.fase }}</td>
          <td>{{ item.enlace }}</td>
          <td>{{ item.nodo }}</td>
          <td>{{ item.odf }}</td>
          <td>{{ item.modulo }}</td>
          <td>{{ item.bandeja }}</td>
          <td>{{ item.puerto }}</td>
          <td>{{ item.cable }}</td>
          <td>{{ item.hilo }}</td>
          <td>{{ item.router }}</td>
          <td>{{ item.puerto_router }}</td>
          <td>{{ item.enlace_final }}</td>
          <td>{{ item.obs }}</td>
          <td>{{ item.obs2 }}</td>
          <td>{{ item.distancia }}</td>
          <td>{{ item.sfp }}</td>
          <td>{{ item.sfp_entregar }}</td>
          <td>{{ item.estado_final }}</td>
          <td>{{ item.router_interior }}</td>
          <td>{{ item.ip }}</td>
          <td>{{ item.contrata }}</td>
          <td class="actions-cell">
            <div class="actions-container">
              <VBtn 
                size="small"
                color="info"
                icon="ri-pencil-line"
                @click="$emit('edit', item, idx)"
                class="action-btn"
              />
              <VBtn 
                v-if="props.role === 'administrador'"
                size="small"
                color="error"
                icon="ri-delete-bin-3-fill"
                @click="$emit('delete', item, idx)"
                class="action-btn"
              />
            </div>
          </td>
        </tr>
      </tbody>
    </VTable>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  items: {
    type: Array,
    required: true,
    default: () => [],
  },
  role: {
    type: String,
    required: true,
    default: "agente",
  },
});

const items2 = ref([]);

// Watch for changes in props.items and update the local array
watch(
  () => props.items,
  (newItems) => {
    items2.value = Array.isArray(newItems) ? [...newItems] : [];
  },
  { immediate: true }
);
</script>

<style scoped>
:deep(.custom-table thead tr th.header-th) {
  background-color: #305496 !important;
  color: #fff !important;
  font-weight: bold !important;
  text-align: center !important;
  padding: 10px 8px !important;
  /* Elimina la sombra si la ves */
  box-shadow: none !important;
}

:deep(.custom-table tbody tr:hover) {
  background-color: #92ed98 !important; /* Color de fondo al pasar el mouse */
  color: black;
  transition: all 0.3s ease;
}

.table-container {
  overflow-x: auto;
  position: relative;
}

:deep(.custom-table thead tr th:last-child),
:deep(.custom-table tbody tr td:last-child) {
  position: sticky;
  right: 0;
  z-index: 1;
  min-width: 120px; /* Asegura espacio para los botones */
  box-shadow: -5px 0 5px rgba(0, 0, 0, 0.1); /* Sombra para distinguir la columna */
}



.actions-cell {
  padding: 0 !important;
  text-align: center;
}

.actions-container {
  display: flex;
  justify-content: center;
  gap: 8px;
  padding: 4px;
}

:deep(.action-btn) {
  margin: 0;
}
</style>
