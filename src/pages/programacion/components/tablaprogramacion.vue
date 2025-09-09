<template>
  <div>
    <div>
        <VRow class="align-center" justify="space-between">
            <VCol class="d-flex align-center">
                <VBtn 
                    v-if="apiResp?.id_programacion"
                    color="primary"
                    class="ml-2"
                    density="compact"
                    @click="cancelar"  
                >
                Cancelar
                </VBtn>
                
                <VBtn 
                    v-if="apiResp?.id_programacion && (apiResp?.programacion?.seleccionados?.length || 0) > 0"
                    color="secondary"
                    class="ml-2"
                    density="compact"
                    @click="registrar"
                >
                Registrar
                </VBtn>

                
                <!-- 👇 Nuevos: exportaciones (solo si hay filas) -->
                <VBtn
                    v-if="(items?.length || 0) > 0"
                    color="success"
                    class="ml-2"
                    density="compact"
                    @click="descargarCSV"
                >
                Descargar CSV
                </VBtn>
            </VCol>
            <VCol 
                class="d-flex justify-end align-center"
                v-if="resumen && Object.keys(resumen).length"
                >
                <div>
                    <VChip                
                        class="ma-2"
                        color="primary"
                        text-color="white"
                        density="compact"
                    >
                        Solicitado: {{ resumen.total_solicitado }}
                    </VChip>

                    <VChip                    
                        class="ma-2"
                        color="primary"
                        text-color="white"
                        density="compact"
                    >
                        Asignado: {{ resumen.total_asignado }}
                    </VChip>

                    <VChip                    
                        class="ma-2"
                        color="primary"
                        text-color="white"
                        density="compact"
                    >
                        Faltantes: {{ resumen.faltantes }}
                    </VChip>
                </div>
            </VCol>
        </VRow >
    </div>
    <VDataTable
      :headers="headers"
      :items="items"
      density="compact"
      :items-per-page="20"
      class="text-no-wrap"
    />
  </div>


  <VOverlay :model-value="showOverlay" persistent class="d-flex align-center justify-center">
    <div class="text-center">
      <VProgressCircular indeterminate size="48" />
      <div class="mt-4">
        <div class="text-subtitle-1">Procesando solicitud...</div>
        <div class="text-caption">Por favor espere</div>
      </div>
    </div>
  </VOverlay>
</template>
<script setup>
import { computed, ref } from 'vue'   // 👈 esto faltaba
import { VBtn, VCol, VRow } from 'vuetify/components';
import { $api } from '@/utils/api'
const props = defineProps({
  apiResp: { type: Object, default: null },  // 👈 JSON completo de la API
  loading: { type: Boolean, default: false },
})

const showOverlay = ref(false)
const error = ref(null)

const emit = defineEmits(['update:apiResp']) // 👈 evento para pedir reset

// 1) Resumen directo
const resumen = computed(() => props.apiResp?.programacion?.resumen ?? null)

// 2) Aplanar programacion.seleccionados -> filas de la tabla
const items = computed(() => {
  const sel = props.apiResp?.programacion?.seleccionados
  if (!Array.isArray(sel)) return []

  return sel.map(s => ({
    departamento: s.departamento,
    sitio:        s.sitio,
    distrito:     s.distrito,
    ruta:         s.ruta,
    fecha:        s.fecha,                               // "6/9/2025"
    divicau:      s.divicau,
    serie_cto:    s.serie_cto,
    olt:          s.olt,
    slot:         s.slot,
    port:         s.port,
    coordenadas:  (s.y && s.x) ? `${s.y}, ${s.x}` : '',
    // opcional: guarda IDs “ocultos” para acciones futuras
    _ids: {
      id_programacion: props.apiResp?.id_programacion,
      id_ruta_programacion: s.id_ruta_programacion,
      id_cto: s.id_cto,
      id_divisor: s.id_divisor,
      id_divicau: s.id_divicau,
      serie_divisor: s.serie_divisor,
    },
  }))
})

const headers = [
  { title: "Departamento", key: "departamento" },
  { title: "Sitio", key: "sitio" },
  { title: "Distrito", key: "distrito" },
  { title: "Ruta", key: "ruta" },
  { title: "Fecha", key: "fecha" },
  { title: "Divicau", key: "divicau" },
  { title: "Cto", key: "serie_cto" },
  { title: "Olt", key: "olt" },
  { title: "Slot", key: "slot" },
  { title: "Port", key: "port" },
  { title: "Coordenadas", key: "coordenadas" },
];

// inputs dinamicos
// 🚦 Handlers súper simples (por ahora solo logs)
const cancelar = async () => {
  const id = props.apiResp?.id_programacion
  if (!id) return
  try {
    // Aquí iría la llamada a la API para cancelar la programación
    showOverlay.value = true
    const res = await $api(`programaciones/eliminar-pre-programacion/${id}`, {
        method: 'DELETE',
        onResponseError({ response }) {
          console.error('Respuesta API no OK:', response)
          error.value = 'No se pudo planificar'
        }
        })
    console.log('Respuesta API cancelar:', res)
    // 👇 emitir evento para que el padre resetee todo
    const data = res?.data ?? res
    console.log('Respuesta API cancelar:', data)

    if (data.ok) {
      emit('update:apiResp', null) // 👈 pide al padre que resetee
    }

  } catch (error) {
    console.error('Error al cancelar la programación:', error)
    error.value = 'Error al cancelar'
  } finally {
    showOverlay.value = false
  }

}

const registrar =  async() => {
  const seleccionados = props.apiResp?.programacion?.seleccionados || []
  if (!seleccionados.length) return

  try{
    const pay = props.apiResp;
    console.log(pay);
    showOverlay.value = true
    const response = await $api('programaciones/registra-actualiza-divicau', {
      method: 'POST',
      body: pay,
      onResponseError({ response }) {
        console.error('Respuesta API no OK:', response)
        error.value = 'No se pudo registrar la programación'
      }
    }) 
    console.log('Respuesta API registrar:', response);
    const data = response?.data ?? response
    if (data.ok) {
      emit('update:apiResp', null) // 👈 pide al padre que resetee
    }
  }catch(e){
    console.error('Error al registrar la programación:', e)
    error.value = 'Error al registrar la programación'
  }finally{
    showOverlay.value = false
  }
}

// ====== Exportar CSV (sin dependencias) ======
const descargarCSV = () => {
  const data = items.value
  if (!data.length) return

  const cols = headers.map(h => ({ key: h.key, title: h.title }))

  const esc = (val) => {
    if (val == null) return ''
    const s = String(val).replace(/"/g, '""')
    return /[",\n]/.test(s) ? `"${s}"` : s
  }

  let csv = cols.map(c => esc(c.title)).join(',') + '\n'
  for (const row of data) {
    csv += cols.map(c => esc(row[c.key])).join(',') + '\n'
  }

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `programacion_${new Date().toISOString().slice(0,10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}


</script>