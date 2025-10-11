<template>
  <VDialog
    :model-value="open"
    max-width="100%"
    @update:model-value="(v) => emit('update:open', v)"
    persistent
  >
    <VCard>
      <VCardTitle class="text-h5">
        Fiabilidad del Tramo {{ props.items.tramo?.replace(/^T-/, "") }}
      </VCardTitle>
      <VCardText>
        <!-- Vista Tabla -->
        <div v-if="view === 'table'">
          <VBtn v-if="rol_usuario === 'administrador'" color="primary" class="mb-4" @click="showAddForm">Agregar</VBtn>
          <CTabla 
            :items="itemsLocal" 
            :role="rol_usuario"
            @edit="showEditForm" 
            @delete="showDeleteForm" />
        </div>
        <!-- Vista Formulario Agregar -->
        <div v-else-if="view === 'add'">
          <FormularioFiabilidad
            :id_proyecto_tramo="props.items.id"
            @save="addItem"
            @cancel="showTable"
          />
        </div>
        <!-- Vista Formulario Editar -->
        <div v-else-if="view === 'edit'">
          <FormularioFiabilidad
            :id_proyecto_tramo="props.items.id"
            :item="editItem"
            @save="updateItem"
            @cancel="showTable"
          />
        </div>
      </VCardText>
      <VCardActions>
        <VSpacer></VSpacer>
        <VBtn color="secondary" @click="onCancel">Cerrar</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<script setup>
import { ref } from "vue";
import CTabla from "@/pages/seguimiento-ftth/components/ComponentsTableFiabilidad.vue";

// Puedes crear este componente simple para el formulario
import FormularioFiabilidad from "@/pages/seguimiento-ftth/components/FormularioFiabilidad.vue";

const props = defineProps({
  open: { type: Boolean, required: true },
  items: { type: Object, default: () => ({}) },
  datostables: { type: Array, default: () => ([]) },
  rol_usuario: { type: String, default: "agente" },
});
const emit = defineEmits([
  "update:open",
  "cancel",
  "save_registro",
  "update_registro",
  "delete_registro",
]);

// Estado de la vista: 'table', 'add', 'edit'
const view = ref("table");
const itemsLocal = ref(props.datostables || []);
const editItem = ref(null);
const editIndex = ref(null);

function showAddForm() {
  view.value = "add";
}
function showEditForm(item, idx) {  
  editItem.value = { ...item, id_proyecto_tramo: props.items.id }; // Clonar el item y agregar id_proyecto_tramo
  editIndex.value = idx;
  view.value = "edit";
}
function showTable() {
  view.value = "table";
}
function addItem(newItem) {
  emit("save_registro", newItem); // Emitir el nuevo registro al padre
  // itemsLocal.value.push(newItem);
  // showTable();
}
function updateItem(updatedItem) {
  // if (editIndex.value !== null) {
  //   itemsLocal.value[editIndex.value] = updatedItem;
  // }
  // showTable();
  emit("update_registro", updatedItem); // Emitir el registro actualizado al padre
}

function showDeleteForm(item, idx) {
  // Aquí podrías implementar la lógica para eliminar un ítem si es necesario
  // Por ejemplo, podrías emitir un evento al padre para que maneje la eliminación
  emit("delete_registro", item); // Emitir el ítem a eliminar al padre
}

function onCancel() {
  emit("cancel");
  emit("update:open", false);
}

defineExpose({
  showTable,
});

watch(
  () => props.datostables,
  (val) => {
    itemsLocal.value = Array.isArray(val) ? [...val] : [];
  },
  { immediate: true }
);
</script>
