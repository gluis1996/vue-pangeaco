<template>
  <VRow class="mb-4">
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
    <VCol cols="12">
      <VBtn color="primary" variant="tonal" @click="open = true">+</VBtn>
    </VCol>
  </VRow>

  <Tabla
    :listaproyecto="listaprogramacion"
    @editarProyecto="abrirDialogEditar"
    @asignar-proyecto="abrirDialogoAsignar"
    @verTrabajos="abrirTrabajos"
    @delete-proyecto="abrirDialogoEliminar"
  />

  <!-- Dialog para NUEVO registro -->
  <RegistroDialog
    v-model:open="open"
    :options="options"
    @submit="guardarRegistro"
    @cancel="open = false" 
  />

  <!-- Dialog para EDITAR registro -->
  <DialogEditarProyecto
    v-model:open="openEditar"
    :id-proyecto="idSeleccionado"
    :initial-data="datosParaEditar"
    :options="options"
    @cancel="openEditar = false"
    @data-updated="cargarProyecto"
    @loading-start="isPageLoading = true"
    @loading-end="isPageLoading = false"
  />

  <!-- Dialog Estado Avance -->
  <DialogTrabajos 
    v-if="openTrabajos"
    v-model:open="openTrabajos"
    :id-proyecto="idSeleccionado"
    :initial-data="trabajosParaDialogo"
    :is-edit="!!(trabajosParaDialogo.trabajos && trabajosParaDialogo.trabajos.length > 0)"
    :options="options"
    @submit="onTrabajoDialogSubmit"
    @cancel="openTrabajos=false"
  />

  <!-- Dialog para ASIGNAR proyecto -->
  <DialogAsignar
    v-model:open="openAsignar"
    :proyecto="proyectoParaAsignar"
    @guardar="guardarAsignacion"
    @cancel="openAsignar = false"
  />

  <!-- Dialog de Confirmación para ELIMINAR -->
  <VDialog v-model="openEliminar" max-width="500px" persistent>
      <VCard>
          <VCardTitle class="text-h5">Confirmar Eliminación</VCardTitle>
          <VCardText>
              ¿Estás seguro de que deseas eliminar este proyecto? Esta acción no se puede deshacer.
          </VCardText>
          <VCardActions>
              <VSpacer />
              <VBtn color="secondary" variant="tonal" @click="openEliminar = false">
                  Cancelar
              </VBtn>
              <VBtn color="error" variant="elevated" @click="ejecutarEliminacion">
                  Eliminar
              </VBtn>
          </VCardActions>
      </VCard>
  </VDialog>

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
import { ref, reactive, onMounted } from 'vue'
import RegistroDialog from '@/pages/intermodal-base-interna/components/dialog.vue'
import DialogTrabajos from '@/pages/intermodal-base-interna/components/DialogTrabajos.vue'
import DialogAsignar from '@/pages/intermodal-base-interna/components/DialogAsignar.vue'
import DialogEditarProyecto from '@/pages/intermodal-base-interna/components/DialogEditarProyecto.vue'
import Tabla from '@/pages/intermodal-base-interna/components/tabla.vue'
import { $api } from '@/utils/api'
import datos from '@/pages/intermodal-base-interna/composables/data'

const snackbar = reactive({
  show: false,
  message: '',
  color: 'warning',
})

const listaprogramacion = ref([])
const open = ref(false)                 // diálogo de registro
const openEditar = ref(false)           // diálogo de edición
const openAsignar = ref(false)          // diálogo de asignación
const openTrabajos = ref(false)
const openEliminar = ref(false)         // diálogo de eliminación
const idSeleccionado = ref(null)        // id proyecto para el diálogo
const proyectoParaAsignar = ref(null)   // datos para el diálogo de asignación
const datosParaEditar = ref({})         // datos para el diálogo de edición
const trabajosParaDialogo = ref([])     // datos para el diálogo de trabajos
const isPageLoading = ref(false)

onMounted(cargarProyecto)

const options = reactive({
  regiones: ['LIMA', 'PROVINCIA'],
  departamentos: ['LIMA', 'AREQUIPA', 'ANCASH', 'JUNIN', 'CUSCO', 'LAMBAYEQUE', 'LA LIBERTAD', 'ICA', 'PIURA'],
  nodosConcentrador: ['HIGUERETA','LA VICTORIA','LOS OLIVOS','SAN JOSE','AREQUIPA 15 DE ENERO','CHIMBOTE CENTRO','HUANCAYO CENTRO','CUSCO LARAPA','CHICLAYO LEONARDO ORTIZ','TRUJILLO CENTRO','ICA CENTRO','PIURA CENTRO'],
  estados: ['EN PROCESO', 'CULMINADO', 'STAND BY'],
  tipos_trabajos: datos.value.rows,
})

const guardarRegistro = async (payload) => {
  try {
    isPageLoading.value = true;
    const response = await $api('internodal/registrar-proyecto',{
      method : 'POST',
      body : payload,
      onResponseError({response}){
        console.error(response)
      }
    })
    if (response.success && response.response === 'OK') {
      snackbar.message = `Proyecto registrado correctamente`
      snackbar.color = 'info'
      snackbar.show = true
    }
    
    cargarProyecto();    
  } catch (error) {
    console.error(error)
    snackbar.message = `Error al registrar el proyecto`
    snackbar.color = 'error'
    snackbar.show = true
  }finally{
    isPageLoading.value = false;
  }
  open.value = false
}

async function cargarProyecto () {
  isPageLoading.value = true;
  try {
    const response = await $api('internodal/listar-proyecto', { method: 'GET' })
    listaprogramacion.value = response.rows
  } catch (error) {
    console.error(error)
  } finally {
    isPageLoading.value = false;
  }
}

/* ====== Abrir Dialogo de Edición ====== */
async function abrirDialogEditar(id) {
  isPageLoading.value = true;
  idSeleccionado.value = id
  try {
    // Asumimos que tienes un endpoint que devuelve todos los datos de un proyecto
    const apiResponse = await $api(`internodal/listar-consolidado-proyecto/${id}`, { method: 'GET' })
    
    
    // Transformamos la respuesta: extraemos el primer objeto de cada array.
    const datosFormateados = {
      proyecto: apiResponse.proyecto?.[0] || {},
      diseno: apiResponse.diseno?.[0] || {},
      integracion: apiResponse.integracion?.[0] || {},
      capex: apiResponse.capex?.[0] || {},
      pex: apiResponse.pex?.[0] || {},
    }
    datosParaEditar.value = datosFormateados
    openEditar.value = true
    isPageLoading.value = false;
  } catch (error) {
    console.error("Error al cargar datos para editar:", error)
    isPageLoading.value = false;
    // Aquí podrías mostrar una notificación de error
  }
}

/* ====== Abrir Dialogo de Asignación ====== */
async function abrirDialogoAsignar(proyecto) {
  isPageLoading.value = true;
  try {
    // Consultamos la API para obtener los datos más frescos del proyecto.
    // Asumimos que el endpoint devuelve un objeto con { id, ip, eecc, ... }
    const response = await $api(`internodal/buscar-proyecto/${proyecto}`, { method: 'GET' });
    
    proyectoParaAsignar.value = response.result[0]; // Ajusta 'response.data' según la estructura de tu API
    openAsignar.value = true;
  } catch (error) {
    console.error("Error al cargar datos para la asignación:", error);
    // Aquí podrías mostrar una notificación de error
  } finally {
    isPageLoading.value = false;
  }
}

async function guardarAsignacion({ id, ip }) {
  isPageLoading.value = true;
  try {
    
    // Endpoint para actualizar la IP y marcar como asignado
    const response = await $api(`internodal/asignacion-proyecto-contrata/${id}`, {
      method: 'PUT',
      body: { ip: ip }
    });

    if (response.success) {
      snackbar.message = 'Proyecto asignado correctamente.';
      snackbar.color = 'info';
      snackbar.show = true;
    } else {
      // Si la API devuelve success: false pero no lanza un error
      snackbar.message = response.message || 'No se pudo completar la asignación.';
      snackbar.color = 'error';
      snackbar.show = true;
    }

    await cargarProyecto(); // Recargamos la tabla para ver el cambio
  } catch (error) {
    console.error("Error al guardar la asignación:", error);
    snackbar.message = 'Error al guardar la asignación.';
    snackbar.color = 'error';
    snackbar.show = true;
  } finally {
    isPageLoading.value = false;
    openAsignar.value = false;
  }
}


/* ========================================== */
/* ====== Gestines para Trabajos ============ */
/* ========================================== */

async function abrirTrabajos (id) {
  isPageLoading.value = true;
  idSeleccionado.value = id;
  try {
    // 1. Cargar los trabajos existentes para este proyecto
    const response = await $api(`internodal/listar-trabajos-tecnico-mufas/${id}`, { method: 'GET' });

    if (response.trabajo) {
      response.trabajos = response.trabajo;
      delete response.trabajo;
    }
    trabajosParaDialogo.value = response;

    // 3. Abrir el diálogo
    openTrabajos.value = true;
  } catch (error) {
    console.error("Error al cargar los trabajos del proyecto:", error);
  } finally {
    isPageLoading.value = false;
  }
}

async function onTrabajoDialogSubmit(payload) { 

  isPageLoading.value = true;
  openTrabajos.value = false;

  try {
    // 1. Separar los trabajos en dos grupos: los que tienen ID (para actualizar) y los que no (para crear).
    const trabajosParaActualizar = [];
    const trabajosParaCrear = [];

    payload.medidas.forEach(medida => {
      const trabajo = {
        id_proyecto: payload.id_proyecto,
        tipo_id: medida.id_tipo,
        total: Number(medida.total) || null,
        trabajados: Number(medida.trabajado) || null,
      };

      if (medida.id) {
        // Si tiene ID, es para actualizar
        trabajo.id = medida.id;
        trabajosParaActualizar.push(trabajo);
      } else {
        // Si no tiene ID, es para crear
        trabajosParaCrear.push(trabajo);
      }
    });

    // 2. Realizar las llamadas a la API correspondientes.
    if (trabajosParaActualizar.length > 0) {
      await $api('internodal/actualizar-trabajos', { 
        method: 'PUT', 
        body: trabajosParaActualizar 
      });
    }

    if (trabajosParaCrear.length > 0) {
      await $api('internodal/registrar-trabajos', { 
        method: 'POST', 
        body: trabajosParaCrear 
      });
    }

    snackbar.message = 'Trabajos guardados correctamente.';
    snackbar.color = 'info';
    snackbar.show = true;

    await cargarProyecto();

  } catch (error) {
    console.error('Error al guardar trabajos:', error);
    snackbar.message = 'Error al guardar los trabajos.';
    snackbar.color = 'error';
    snackbar.show = true;
  }finally{
    isPageLoading.value = false;
  }
}

/* ========================================== */
/* ====== Gestiones para Eliminar =========== */
/* ========================================== */

function abrirDialogoEliminar(id) {
  idSeleccionado.value = id; // Guardamos el ID del proyecto a eliminar
  openEliminar.value = true; // Abrimos el diálogo de confirmación
}

async function ejecutarEliminacion() {
  if (!idSeleccionado.value) return;

  isPageLoading.value = true;
  openEliminar.value = false; // Cerramos el diálogo

  try {
    // Reemplaza 'tu-endpoint-de-eliminar' con la URL correcta de tu API
    const response = await $api(`internodal/eliminar-proyecto/${idSeleccionado.value}`, {
      method: 'DELETE',
      onResponseError({ response }) {
        snackbar.message = response._data.message || 'Error en la respuesta del servidor.';
        snackbar.color = 'error';
        snackbar.show = true;
      }
    });

    snackbar.message = 'Proyecto eliminado correctamente';
    snackbar.color = 'info';
    snackbar.show = true;

    await cargarProyecto(); // Recargamos la tabla para reflejar el cambio
  } catch (error) {
    console.error("Error al eliminar el proyecto:", error);
    snackbar.message = 'Error al eliminar el proyecto';
    snackbar.color = 'error';
    snackbar.show = true;
  } finally {
    isPageLoading.value = false;
    idSeleccionado.value = null; // Limpiamos el ID seleccionado
  }
}


definePage({
    meta: {
        roles: ['administrador','tecnico','agente'],   // 👈 solo este rol puede entrar
    },
})

</script>
