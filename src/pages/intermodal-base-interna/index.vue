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
    v-model:open="openTrabajos"
    :id-proyecto="idSeleccionado"
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

const listaprogramacion = ref([])
const open = ref(false)                 // diálogo de registro
const openEditar = ref(false)           // diálogo de edición
const openAsignar = ref(false)          // diálogo de asignación
const openTrabajos = ref(false)
const idSeleccionado = ref(null)        // id proyecto para el diálogo
const proyectoParaAsignar = ref(null)   // datos para el diálogo de asignación
const datosParaEditar = ref({})         // datos para el diálogo de edición
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
    const response = await $api('internodal/registrar-proyecto',{
      method : 'POST',
      body : payload,
      onResponseError({response}){
        console.error(response)
      }
    })
    console.log(response);
    cargarProyecto();    
  } catch (error) {
    console.error(error)
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
    console.log('Respuesta cruda de la API:', apiResponse);
    
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
    console.log(response);    
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
    console.log(id, ip);
    
    // Endpoint para actualizar la IP y marcar como asignado
    const response = await $api(`internodal/asignacion-proyecto-contrata/${id}`, {
      method: 'PUT',
      body: { ip: ip }
    });
    console.log(response);
    
    await cargarProyecto(); // Recargamos la tabla para ver el cambio
  } catch (error) {
    console.error("Error al guardar la asignación:", error);
    // Aquí podrías mostrar una notificación de error
  } finally {
    isPageLoading.value = false;
    openAsignar.value = false;
  }
}


/* ========================================== */
/* ====== Gestines para Trabajos ============ */
/* ========================================== */

async function abrirTrabajos (id) {
  idSeleccionado.value = id
  console.log('selecion estado ', id);

  openTrabajos.value = true
}

async function onTrabajoDialogSubmit(payload) {
  console.log('Datos recibidos del diálogo de trabajos:', payload);

  // Preparamos los datos para la API. Solo necesitamos el array 'medidas'.
  const trabajosParaGuardar = payload.medidas.map(medida => ({
    id_proyecto: payload.id_proyecto,
    tipo_id: medida.id_tipo,
    total: Number(medida.total) || null,
    trabajados: Number(medida.trabajado) || null,
  }));

  console.log('Datos listos para enviar a la API:', trabajosParaGuardar);

  // Aquí iría tu llamada a la API
  try {
    const response = await $api('internodal/registrar-trabajos', { 
      method: 'POST', 
      body: trabajosParaGuardar });
    
      console.log(response);
      
    cargarProyecto();
  } catch (error) {
    console.error('Error al guardar trabajos:', error);
  }
}

</script>
