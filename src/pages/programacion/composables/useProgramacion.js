// pages/programacion/composables/useProgramacion.js
import { ref, computed, watch } from 'vue'
import { $api } from '@/utils/api'

export function useProgramacion () {
  // ====== Estado (sidebar)
  const TIPOS = ['Timbrado', 'Inspeccion']
  const dateRange = ref('')                 // "YYYY-MM-DD to YYYY-MM-DD"
  const tipoProgramacion = ref('')          // 'Timbrado' | 'Inspeccion'

  // vendrá de la API: programaciones/listar-departementos-cto/:tipo
  const sitiosData = ref([])

  const selectedDepartamento = ref('')
  const selectedSitio = ref('')
  const selectedDistrito = ref('')

  const numRutas = ref(1)
  const numCtosPorRuta = ref(1)

  // ====== Zonas (panel derecho)
  const zonas = ref([]) // [{ departamento, sitio, distrito, fechas, rutas:[{nombre, ctos:[]}] }]
  const loading = ref(false)
  const error = ref(null)


  // variable para enviar a por props a la tabla
  const lastApiResponse = ref(null)

  // (opcional) cache por tipo para no repetir llamadas
  const cacheByTipo = new Map()

  // ====== Llamado a API
  const fetchSitios = async (tipo) => {
    if (!tipo) return
    if (cacheByTipo.has(tipo)) {
      sitiosData.value = cacheByTipo.get(tipo)
      return
    }
    loading.value = true
    error.value = null
    try {
      const res = await $api(`programaciones/listar-departementos-cto/${tipo}`, {
        method: 'GET',
        onResponseError({ response }) {
          console.error('Respuesta API no OK:', response)
          error.value = 'No se pudo cargar sitios'
        }
      })
      // Estructura esperada: { status: 'success', data: [...] }
      const data = Array.isArray(res?.data) ? res.data : []
      const norm = data.map(it => ({
        nombre_departamento: String(it.nombre_departamento || '').trim(),
        nombre_distrito    : String(it.nombre_distrito || '').trim(),
        nombre_sitio       : String(it.nombre_sitio || '').trim(),
        cantidad_cto       : Number(it.cantidad_cto || 0),
      }))
      sitiosData.value = norm
      cacheByTipo.set(tipo, norm)
    } catch (e) {
      console.error(e)
      error.value = 'Error inesperado al cargar sitios'
      sitiosData.value = []
    } finally {
      loading.value = false
    }
  }

  // handler que vas a pasar al Sidebar
  const onTipoProgramacionChanged = async () => {
    // limpia selecciones
    selectedDepartamento.value = ''
    selectedSitio.value = ''
    selectedDistrito.value = ''
    // trae data de la API
    await fetchSitios(tipoProgramacion.value)
  }

  // ====== Listas en cascada
  const departamentosDisponibles = computed(() =>
    [...new Set(sitiosData.value.map(s => s.nombre_departamento))].sort()
  )

  const sitiosDisponibles = computed(() =>
    [...new Set(
      sitiosData.value
        .filter(s => s.nombre_departamento === selectedDepartamento.value)
        .map(s => s.nombre_sitio)
    )].sort()
  )

  const distritosDisponibles = computed(() =>
    [...new Set(
      sitiosData.value
        .filter(s =>
          s.nombre_departamento === selectedDepartamento.value &&
          s.nombre_sitio === selectedSitio.value
        )
        .map(s => s.nombre_distrito)
    )].sort()
  )

  // CTOs disponibles (por departamento+sitio)
  const ctosDisponibles = computed(() => {
    const arr = sitiosData.value.filter(s =>
      s.nombre_departamento === selectedDepartamento.value &&
      s.nombre_sitio === selectedSitio.value
    )
    return arr.reduce((acc, it) => acc + (it.cantidad_cto || 0), 0)
  })

  // ====== Fechas (convierte "YYYY-MM-DD to YYYY-MM-DD" -> ["d/m/yyyy", ...])
  const fechasLista = computed(() => {
    if (!dateRange.value || !dateRange.value.includes(' to ')) return []
    const [ini, fin] = dateRange.value.split(' to ')
    const start = new Date(ini)
    const end = new Date(fin)
    if (isNaN(start) || isNaN(end)) return []
    const out = []
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      out.push(`${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`)
    }
    return out
  })

  // ====== Validación
  const totalSolicitadoVista = computed(() => {
    const dias = fechasLista.value.length
    return (numRutas.value || 0) * (numCtosPorRuta.value || 0) * dias
  })
  const valido = computed(() => totalSolicitadoVista.value <= ctosDisponibles.value)

  const puedeCrearZona = computed(() =>
    tipoProgramacion.value &&
    dateRange.value.includes(' to ') &&
    selectedDepartamento.value &&
    selectedSitio.value &&
    numRutas.value > 0 &&
    numCtosPorRuta.value >= 0 &&
    valido.value
  )

  // ====== Acciones zona
  const crearZona = () => {
    const fechas = [...fechasLista.value]
    const rutas = Array.from({ length: numRutas.value }, (_, i) => ({
      nombre: `RUTA ${i + 1}`,
      ctos: fechas.map(() => numCtosPorRuta.value),
    }))
    zonas.value.push({
      departamento: selectedDepartamento.value,
      sitio: selectedSitio.value,
      distrito: selectedDistrito.value || '',
      fechas,
      rutas,
    })
  }

  const agregarRuta   = (zi)         => zonas.value[zi].rutas.push({ nombre: `RUTA ${zonas.value[zi].rutas.length + 1}`, ctos: zonas.value[zi].fechas.map(() => numCtosPorRuta.value) })
  const eliminarRuta  = (zi, ri)     => zonas.value[zi].rutas.splice(ri, 1)
  const eliminarDia   = (zi, fi)     => { const z = zonas.value[zi]; z.fechas.splice(fi,1); z.rutas.forEach(r => r.ctos.splice(fi,1)) }
  const eliminarZona  = (zi)         => zonas.value.splice(zi, 1)
  const recalcularZona = (_zi)       => {}

  // Totales
  const totalZona   = (z)      => z.rutas.reduce((acc, r) => acc + r.ctos.reduce((a,b)=>a+(+b||0),0), 0)
  const totalFila   = (z, ri)  => z.rutas[ri].ctos.reduce((a,b)=>a+(+b||0),0)
  const totalPorDia = (z, fi)  => z.rutas.reduce((a,r)=>a+(+r.ctos[fi]||0),0)

  // ====== Payload
  const construirPayload = (zonasPart) => {
    const bloques = zonasPart.map(z => {
      const fechasArr = z.fechas.map((f, idx) => {
        const rutasArr = z.rutas.map(r => ({
          nombre: r.nombre,
          cupo: Number(r.ctos[idx]) || 0
        }))
        return { fecha: f, rutas: rutasArr }
      })
      return {
        ubicacion: {
          departamento: z.departamento,
          provincia: z.departamento, // ajusta si necesitas
          distrito: z.distrito,
          sitio: z.sitio
        },
        fechas: fechasArr
      }
    })
    return {
      planificar_cto: true,
      tipo: tipoProgramacion.value,
      bloques
    }
  }

  const procesarAsignacionZona = async (zi) => {
    const payload = construirPayload([zonas.value[zi]])
    console.log(payload)
    // await $api('programaciones/planificar', { method: 'POST', body: payload })
  }

  const procesarAsignacionTodo = async () => {
    if (!zonas.value.length) return
    const payload = construirPayload(zonas.value)
    loading.value = true                // 👈 PRENDER
    error.value = null
    console.log(payload)
    try {
      const res = await $api('programaciones/registrar-programacion-rutas-programacion', {
        method: 'POST',
        body: payload,
        onResponseError({ response }) {
          console.error('Respuesta API no OK:', response)
          error.value = 'No se pudo planificar'
        }
      })
      console.log('Respuesta API OK:', res)
      const data = res?.data ?? res
      lastApiResponse.value = data
      return true               // 👈 guardamos TODO el JSON
    } catch (e) {
      console.error(e)
      error.value = 'Error inesperado al planificar'
    } finally {
      loading.value = false
    }
  }

  return {
    // estado
    TIPOS, dateRange, tipoProgramacion, sitiosData,
    selectedDepartamento, selectedSitio, selectedDistrito,
    numRutas, numCtosPorRuta, zonas, loading, error,

    // computed
    departamentosDisponibles, sitiosDisponibles, distritosDisponibles,
    ctosDisponibles, fechasLista, totalSolicitadoVista, valido, puedeCrearZona,
    lastApiResponse,
    // acciones
    fetchSitios, onTipoProgramacionChanged,
    crearZona, agregarRuta, eliminarRuta, eliminarDia, eliminarZona,
    totalZona, totalFila, totalPorDia, recalcularZona,
    procesarAsignacionZona, procesarAsignacionTodo,
  }
}
