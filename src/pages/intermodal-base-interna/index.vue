<template>
  <VRow>
    <VCol cols="12" md="2">
      <VBtn color="primary" variant="tonal" @click="open = true">+</VBtn>
    </VCol>
  </VRow>

  <br />

  <Tabla
    :listaproyecto="listaprogramacion"
    @verDetalleDespliegues="abrirDialogDespliegue"
    @verEstadoAvance="abrirDialogEstados"
    @verDetalleDistancia="detalleDistancia"
    @verDetalle="verDetalle"
  />

  <!-- Dialog de registro existente -->
  <RegistroDialog
    v-model:open="open"
    :options="options"
    @submit="guardarRegistro"
    @cancel="open = false"
  />

  <!-- Dialog de Despliegue (nuevo) -->
  <DialogDespliegue
    v-model:open="openDespliegue"
    :id-proyecto="idSeleccionado"
    :initial="detalleDespliegue"
    :is-edit="!!detalleDespliegue.despliegeRouter"
    @submit="onDialogSubmit"
    @cancel="openDespliegue = false"
  />

  <!-- Dialog Estado Avance -->
  <DialogEstados 
    v-model:open="openEstados"
    :id-proyecto="idSeleccionado"
    :initial="detalleEstadoAvance"
    :is-edit="!!detalleEstadoAvance.diseno"
    @submit="onEstadosDialogSubmit"
    @cancel="openEstados = false"
  />
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { VBtn } from 'vuetify/components'
import RegistroDialog from '@/pages/intermodal-base-interna/components/dialog.vue'
import DialogDespliegue from '@/pages/intermodal-base-interna/components/dialogDespliege.vue'
import DialogEstados from '@/pages/intermodal-base-interna/components/dialogEstadoAvance.vue'
import Tabla from '@/pages/intermodal-base-interna/components/tabla.vue'
import { $api } from '@/utils/api'

const listaprogramacion = ref([])
const open = ref(false)                 // diálogo de registro
const openDespliegue = ref(false)       // diálogo de despliegue
const openEstados = ref(false)       // diálogo de despliegue
const idSeleccionado = ref(null)        // id proyecto para el diálogo
const detalleDespliegue = ref({})       // datos iniciales para prefill
const detalleEstadoAvance = ref({})

onMounted(cargarProyecto)

const options = reactive({
  regiones: ['LIMA', 'PROVINCIA'],
  departamentos: ['LIMA', 'AREQUIPA', 'ANCASH', 'JUNIN', 'CUSCO', 'LAMBAYEQUE', 'LA LIBERTAD', 'ICA', 'PIURA'],
  nodosConcentrador: [
    'HIGUERETA','LA VICTORIA','LOS OLIVOS','SAN JOSE','AREQUIPA 15 DE ENERO',
    'CHIMBOTE CENTRO','HUANCAYO CENTRO','CUSCO LARAPA','CHICLAYO LEONARDO ORTIZ',
    'TRUJILLO CENTRO','ICA CENTRO','PIURA CENTRO'
  ],
  estados: ['EN PROCESO', 'CULMINADO', 'STAND BY'],
})

const guardarRegistro = async (payload) => {
  console.log('Registro nuevo:', payload)
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
  try {
    const response = await $api('internodal/listar-proyecto', { method: 'GET' })
    listaprogramacion.value = response.rows
  } catch (error) {
    console.error(error)
  }
}

/* ====== Tabla: handlers ====== */
async function abrirDialogDespliegue (id) {
  try {
    idSeleccionado.value = id
    console.log('id slkecionadcod es para el dsplieys', id);
    
    // 1) Carga detalle desde la API para prellenar el diálogo
    const resp = await $api(`internodal/buscar-despliege/${id}`, { 
      method: 'GET',
      onResponseError({response}){
        console.error(response);
      } 
    })
    // console.log(resp.rows[0].despliegue_enlace_internodal);
    console.log('total ',resp.rows.length)
    // detalleDespliegue.value= resp.rows;
    // Mapea lo que necesites al form del diálogo:
    if (resp.rows.length > 0) {
        detalleDespliegue.value = {
          despliegeRouter: resp.rows[0].despliegue_routers || '',
          despliegue_enlace_internodal: resp.rows[0].despliegue_enlace_internodal || '',
          enlace: resp.rows[0].enlace || '',
          routers: resp.rows[0].routers || '',
          proveedor: resp.rows[0].proveedor || '',
        }
    } else {
      // Si no hay datos, inicializa vacío
        detalleDespliegue.value = {
          despliegeRouter: '',
          despliegue_enlace_internodal: '',
          enlace: '',
          routers: '',
          proveedor: '',
        }
    }
    // 2) Abre el diálogo
    openDespliegue.value = true
  } catch (e) {
    console.error('Error cargando detalle', e)
  }
}

function detalleDistancia (id) {
  console.log('Distancia', id)
}

function verDetalle (id) {
  console.log('Ver', id)
}

/* ====== Guardar del diálogo de Despliegue ====== */
function onDialogSubmit(payload) {
  console.log(payload);
  
  if (payload.isEdit) {
    console.log('Estamos en editar',payload.despliegeRouter);
    
    editarDespliegue(payload)
  } else {
    console.log('estamos en registrar',payload.despliegeRouter);
    
    registrarDespliegue(payload)
  }
}

async function registrarDespliegue(payload) {
  // lógica para registrar
  console.log('Registrar:', payload)
  let payloa = {
    proyecto_id: payload.id_proyecto,
    despliegue_routers: payload.despliegeRouter,
    despliegue_enlace_internodal: payload.despliegue_enlace_internodal,
    enlace: payload.enlace,
    routers: payload.routers,
    proveedor: payload.proveedor
  }
  try {
    const response = await $api('internodal/registrar-despliege', {
      method: 'POST',
      body: payloa,
      onResponseError({response}){
        console.error('Response datos', response)
      }
    })
    console.log(response);
    
    if (response.success) {
      cargarProyecto
      console.log('OK');
      
    }else{
      alert(response.error)
    }
  } catch (error) {
    console.error('Error cargando detalle', error);
  }
}

async function editarDespliegue(payload) {
  // lógica para editar
  console.log('Editar:', payload)
  let payloa = {
      despliegue_routers: payload.despliegeRouter,
      despliegue_enlace_internodal: payload.despliegue_enlace_internodal,
      enlace: payload.enlace,
      routers: payload.routers,
      proveedor: payload.proveedor
  }
  console.log("edit ", payloa);
  console.log("edit ", payload.id_proyecto);
  
  try {
    const response = await $api(`internodal/actualizar-despliege/${payload.id_proyecto}`,{
      method: 'PUT',
      body: payloa,
      onResponseError({response}){
        console.error(response)
      }
    })
    if (response.success) {
      cargarProyecto
    }
  } catch (error) {
    console.error('Error cargando detalle', error)
  }
}

/* ========================================== */
/* ====== Gestines para estados Avance ====== */
/* ========================================== */
async function abrirDialogEstados (id) {
  try {
    idSeleccionado.value = id
    console.log('selecion estado ', id);
    
    // 1) Carga detalle desde la API para prellenar el diálogo
    const resp = await $api(`internodal/buscar-estado-avance/${id}`, { 
      method: 'GET',
      onResponseError({response}){
        console.error(response);
      } 
    })
    // console.log(resp.rows[0].despliegue_enlace_internodal);
    console.log('total ',resp.rows.length)
    // detalleDespliegue.value= resp.rows;
    // Mapea lo que necesites al form del diálogo:
    if (resp.rows.length > 0) {
        detalleEstadoAvance.value = {
          diseno: resp.rows[0].diseno || '',
          pext: resp.rows[0].pext || '',
          integracion_internodal: resp.rows[0].integracion_internodal || '',
        }
    } else {
      // Si no hay datos, inicializa vacío
        detalleEstadoAvance.value = {
          diseno: '',
          pext: '',
          integracion_internodal: '',
        }
    }
    // 2) Abre el diálogo
    openEstados.value = true
  } catch (e) {
    console.error('Error cargando detalle', e)
  }
}

function onEstadosDialogSubmit(payload) {
  console.log(payload);
  
  if (payload.isEdit) {
    console.log('Estamos en editar',payload);
    
    // editarDespliegue(payload)
  } else {
    console.log('estamos en registrar',payload);
    
    registrarEstados(payload)
  }
}

async function registrarEstados(payload) {
  // lógica para registrar
  console.log('Registrar estados:', payload)
  let payloa = {
    proyecto_id: payload.id_proyecto,
    diseno: payload.diseno,
    pext: payload.pext,
    integracion_internodal: payload.integracion_internodal,
  }
  
  try {
    const response = await $api('internodal/registrar-estado-avance', {
      method: 'POST',
      body: payloa,
      onResponseError({response}){
        console.error('Response datos', response)
      }
    })
    console.log(response);
    
    if (response.success) {
      cargarProyecto
      console.log('OK');
      
    }else{
      alert(response.error)
    }
  } catch (error) {
    console.error('Error cargando detalle', error);
  }
}

</script>
