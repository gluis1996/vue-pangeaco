<template>
  <VRow>
    <VCol cols="12" md="2">
      <VBtn color="primary" variant="tonal" @click="open = true">+</VBtn>
    </VCol>
  </VRow>

  <br />

  <Tabla
    :listaproyecto="listaprogramacion"
    @verDetalleDiseno="abrirDialogDiseno"
    @verEstadoAvance="abrirDialogEstados"
    @verDetalleDistancia="abrirDialogDitancias"
    @verTrabajos="abrirTrabajos"
  />

  <!-- Dialog de registro existente -->
  <RegistroDialog
    v-model:open="open"
    :options="options"
    @submit="guardarRegistro"
    @cancel="open = false"
  />

  <!-- Dialog de Despliegue (nuevo) -->
  <DialogDiseño
    v-model:open="openDiseno"
    :id-proyecto="idSeleccionado"
    :initial="detalleDiseno"
    :is-edit="!!detalleDiseno.despliegeRouter"
    @submit="onDialogSubmit"
    @cancel="openDiseno = false"
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

  <DialogDistancia 
    v-model:open="openDistancia"
    :id-proyecto="idSeleccionado"
    :initial="detalleDistancia"
    :is-edit="!!detalleDistancia.aereo"
    @submit="onDistanciaDialogSubmit"
    @cancel="openDistancia=false"
  />

  <!-- Dialog Estado Avance -->
  <DialogTrabajos 
    v-model:open="openTrabajos"
    :id-proyecto="idSeleccionado"
    :options="options"
    @submit="onTrabajoDialogSubmit"
    @cancel="openTrabajos=false"
  />
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { VBtn } from 'vuetify/components'
import RegistroDialog from '@/pages/intermodal-base-interna/components/dialog.vue'
import DialogDiseño from '@/pages/intermodal-base-interna/components/DialogDiseño.vue'
import DialogEstados from '@/pages/intermodal-base-interna/components/dialogEstadoAvance.vue'
import DialogDistancia from '@/pages/intermodal-base-interna/components/dialogDistancia.vue'
import DialogTrabajos from '@/pages/intermodal-base-interna/components/DialogTrabajos.vue'
import Tabla from '@/pages/intermodal-base-interna/components/tabla.vue'
import { $api } from '@/utils/api'
import datos from '@/pages/intermodal-base-interna/composables/data'
import { objectKeys, p } from '@antfu/utils'
import { syncRef } from '@vueuse/core'

const listaprogramacion = ref([])
const open = ref(false)                 // diálogo de registro
const openDiseno = ref(false)       // diálogo de despliegue
const openEstados = ref(false)
const openDistancia = ref(false)
const openTrabajos = ref(false)
const idSeleccionado = ref(null)        // id proyecto para el diálogo
const detalleDiseno = ref({})       // datos iniciales para prefill
const detalleEstadoAvance = ref({})
const detalleDistancia = ref({})

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
  try {
    const response = await $api('internodal/listar-proyecto', { method: 'GET' })
    listaprogramacion.value = response.rows
  } catch (error) {
    console.error(error)
  }
}

/* ====== Tabla: handlers ====== */
async function abrirDialogDiseno (id) {
  try {
    idSeleccionado.value = id    
    // 1) Carga detalle desde la API para prellenar el diálogo
    const resp = await $api(`internodal/buscar-diseno/${id}`, { 
      method: 'GET',
      onResponseError({response}){
        console.error(response);
      } 
    })
    console.log(resp.rows.length);
    
    // Mapea lo que necesites al form del diálogo:
    if (resp.rows.length > 0) {
        detalleDiseno.value = {
          estado_diseño: resp.rows[0].estado_diseño || '',
          distancia: resp.rows[0].distancia || '',
          aereo: resp.rows[0].aereo || '',
          sub_c_red: resp.rows[0].sub_c_red || '',
          sub_s_red: resp.rows[0].sub_s_red || '',
          tramo: resp.rows[0].tramo || '',
        }
    } else {
      // Si no hay datos, inicializa vacío
        detalleDiseno.value = {
          estado_diseño: '',
          distancia: '',
          aereo: '',
          sub_c_red: '',
          sub_s_red: '',
          tramo: '',
        }
    }
    // 2) Abre el diálogo
    openDiseno.value = true
  } catch (e) {
    console.error('Error cargando detalle', e)
  }
}

function verDetalle (id) {
  console.log('Ver', id)
}
/* ========================================== */
/* ====== Guardar del diálogo de Diseño ====== */
/* ========================================== */
function onDialogSubmit(payload) {
  console.log(payload);
  editarDiseño(payload);
}

async function editarDiseño(payload) {
  // lógica para editar
  console.log('Editar:', payload)
  let payloa = {
      estado_diseño: payload.estado_diseño || null,
      distancia: payload.distancia || null,
      aereo: payload.aereo || null ,
      sub_c_red: payload.sub_c_red || null,
      sub_s_red: payload.sub_s_red || null,
      tramo: payload.tramo || null,
  }
  console.log("edit ", payloa);
  console.log("edit ", payload.id_proyecto);
  
  try {
    const response = await $api(`internodal/actualizar-diseno/${payload.id_proyecto}`,{
      method: 'PUT',
      body: payloa,
      onResponseError({response}){
        console.error(response)
      }
    })
    console.log(response);
    
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
    // detalleDiseno.value= resp.rows;
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
    
    // editarEstados(payload)
  } else {
    console.log('estamos en registrar',payload);
    
    // registrarEstados(payload)
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

async function editarEstados(payload) {
  // lógica para registrar
  console.log('Editar estados:', payload)
  let payloa = {
    diseno: payload.diseno,
    pext: payload.pext,
    integracion_internodal: payload.integracion_internodal,
  }
  
  try {
    const response = await $api(`internodal/actualizar-estado-avance/${payload.id_proyecto}`, {
      method: 'PUT',
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


/* ========================================== */
/* ====== Gestines para Distancia ====== */
/* ========================================== */
async function abrirDialogDitancias (id) {
  try {
    idSeleccionado.value = id
    console.log('selecion estado ', id);
    
    // 1) Carga detalle desde la API para prellenar el diálogo
    const resp = await $api(`internodal/buscar-distancia/${id}`, { 
      method: 'GET',
      onResponseError({response}){
        console.error(response);
      } 
    })
    // console.log(resp.rows[0].despliegue_enlace_internodal);
    console.log('total ',resp.rows.length)
    // detalleDiseno.value= resp.rows;
    // Mapea lo que necesites al form del diálogo:
    if (resp.rows.length > 0) {
        detalleDistancia.value = {
          distancia: resp.rows[0].distancia || '',
          aereo: resp.rows[0].aereo || '',
          sub_c_red: resp.rows[0].sub_c_red || '',
          sub_s_red: resp.rows[0].sub_s_red || '',
          tramo: resp.rows[0].tramo || '',
        }
    } else {
      // Si no hay datos, inicializa vacío
        detalleDistancia.value = {
          distancia: '',
          aereo: '',
          sub_c_red: '',
          sub_s_red: '',
          tramo: '',
        }
    }
    // 2) Abre el diálogo
    openDistancia.value = true
  } catch (e) {
    console.error('Error cargando detalle', e)
  }
}

function onDistanciaDialogSubmit(payload) {
  console.log(payload);
  
  if (payload.isEdit) {
    console.log('Estamos en editar',payload);
    editarDistancia(payload);
  } else {
    console.log('estamos en registrar',payload);
    registrarDistancia(payload);
  }
}

async function registrarDistancia(payload) {
  // lógica para registrar
  console.log('Registrar distancia:', payload)
  let payloa = {
    proyecto_id: payload.id_proyecto,
    distancia: payload.distancia,
    aereo: payload.aereo,
    sub_c_red: payload.sub_c_red,
    sub_s_red: payload.sub_s_red,
    tramo: payload.tramo,
  }
  
  try {
    const response = await $api('internodal/registrar-distancia', {
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

async function editarDistancia(payload) {
  // lógica para registrar
  console.log('Editar distancia:', payload)
  let payloa = {
    distancia: payload.distancia,
    aereo: payload.aereo,
    sub_c_red: payload.sub_c_red,
    sub_s_red: payload.sub_s_red,
    tramo: payload.tramo,
  }
  
  try {
    const response = await $api(`internodal/actualizar-distancia/${payload.id_proyecto}`, {
      method: 'PUT',
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

/* ========================================== */
/* ====== Gestines para Tranajos ============ */
/* ========================================== */

async function abrirTrabajos (id) {
  idSeleccionado.value = id
  console.log('selecion estado ', id);

  openTrabajos.value = true
}

function onTrabajoDialogSubmit(payload) {
  console.log('Datos recibidos del diálogo de trabajos:', payload);

  // Preparamos los datos para la API. Solo necesitamos el array 'medidas'.
  const trabajosParaGuardar = payload.medidas.map(medida => ({
    id_proyecto: payload.id_proyecto,
    tipo_id: medida.id_tipo,
    total: Number(medida.total) || null,
    trabajado: Number(medida.trabajado) || null,
  }));

  console.log('Datos listos para enviar a la API:', trabajosParaGuardar);

  // Aquí iría tu llamada a la API
  // try {
  //   await $api('internodal/registrar-trabajos', { method: 'POST', body: trabajosParaGuardar });
  //   cargarProyecto();
  // } catch (error) {
  //   console.error('Error al guardar trabajos:', error);
  // }
}

</script>
