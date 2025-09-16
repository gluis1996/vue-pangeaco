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
    @verDetalleDistancia="abrirDialogDitancias"
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

  <DialogDistancia 
  v-model:open="openDistancia"
  :id-proyecto="idSeleccionado"
  :initial="detalleDistancia"
  :is-edit="!!detalleDistancia.aereo"
  @submit="onDistanciaDialogSubmit"
  @cancel="openDistancia=false"
  
  />
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { VBtn } from 'vuetify/components'
import RegistroDialog from '@/pages/intermodal-base-interna/components/dialog.vue'
import DialogDespliegue from '@/pages/intermodal-base-interna/components/dialogDespliege.vue'
import DialogEstados from '@/pages/intermodal-base-interna/components/dialogEstadoAvance.vue'
import DialogDistancia from '@/pages/intermodal-base-interna/components/dialogDistancia.vue'
import Tabla from '@/pages/intermodal-base-interna/components/tabla.vue'
import { $api } from '@/utils/api'
import datos from '@/pages/intermodal-base-interna/composables/data'
import { objectKeys, p } from '@antfu/utils'

const listaprogramacion = ref([])
const open = ref(false)                 // diálogo de registro
const openDespliegue = ref(false)       // diálogo de despliegue
const openEstados = ref(false)
const openDistancia = ref(false)
const idSeleccionado = ref(null)        // id proyecto para el diálogo
const detalleDespliegue = ref({})       // datos iniciales para prefill
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

const guardarRegistro = async ({ proyecto, resumen, pruebas, pasivos }) => {
  console.log('Registro nuevo:', proyecto);
  console.log('Medidas:', resumen.length);
  console.log('pruebas', pruebas);
  console.log('pasivos', pasivos);
  
  try {
    const response = await $api('internodal/registrar-proyecto',{
      method : 'POST',
      body : proyecto,
      onResponseError({response}){
        console.error(response)
      }
    })
    
    if (resumen.length === 0 || resumen === null) {
        console.log('No se registra en la base medidas');
    } else {
      const r1 = await $api('internodal/registrar-tabla-resumen',{
        method : 'POST',
        body : resumen.map(r => ({...r,  proyecto_id : response.insertId})),
        onResponseError({response}){
          console.error(response)
        }
      })
      
      if(r1.success){
        if (pasivos === null) {
          console.log('No se registra en la base pasivos');
        }else{
          const r2 = await $api('internodal/registrar-tabla-pasivos',{
            method : 'POST',
            body : {proyecto_id : response.insertId, ...pasivos, },
            onResponseError({response}){
              console.error(response)
            }
          })
          console.log(r2);
        }
      }else{
        console.log('errores r1', r1);        
      }
    } 
    
    
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
    // detalleDespliegue.value= resp.rows;
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

</script>
