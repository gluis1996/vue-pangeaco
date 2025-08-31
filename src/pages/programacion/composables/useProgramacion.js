// pages/programacion/composables/useProgramacion.js
import { ref, computed } from 'vue'

// JSON de prueba (simula la API)
const SITIOS_JSON = {
  status: 'success',
  data: [
    { nombre_departamento: 'AREQUIPA',   nombre_distrito: 'JACOBO HUNTER',        nombre_sitio: 'A5-MI TRABAJO',   cantidad_cto: 1091 },
    { nombre_departamento: 'AREQUIPA',   nombre_distrito: 'CAYMA',              nombre_sitio: 'AJ-ZAMACOLA',       cantidad_cto: 2692 },
  ],
}

export function useProgramacion () {
  // ====== Estado (sidebar)
  const TIPOS = ['Timbrado', 'Inspeccion']
  const dateRange = ref('')            // AppDateTimePicker: "YYYY-MM-DD to YYYY-MM-DD"
  const tipoProgramacion = ref('')
  const sitiosData = ref(SITIOS_JSON.data)

  const selectedDepartamento = ref('')
  const selectedSitio = ref('')
  const selectedDistrito = ref('')

  const numRutas = ref(1)
  const numCtosPorRuta = ref(1)

  // ====== Zonas (panel derecho)
  const zonas = ref([])                // [{ departamento, sitio, distrito, fechas: [...], rutas: [{nombre, ctos:[]}] }]
  const loading = ref(false)

  // ====== Listas en cascada
  const departamentosDisponibles = computed(() => {
    return [...new Set(sitiosData.value.map(s => s.nombre_departamento))]
  })

  const sitiosDisponibles = computed(() => {
    return [...new Set(
      sitiosData.value
        .filter(s => s.nombre_departamento === selectedDepartamento.value)
        .map(s => s.nombre_sitio)
    )]
  })

  const distritosDisponibles = computed(() => {
    return [...new Set(
      sitiosData.value
        .filter(s => s.nombre_departamento === selectedDepartamento.value && s.nombre_sitio === selectedSitio.value)
        .map(s => s.nombre_distrito)
    )]
  })

  // CTOs disponibles (por departamento+sitio). Si necesitas por distrito, añádelo al filtro.
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

  // ====== Acciones
  const onTipoProgramacionChanged = () => {
    // si luego usas API real, aquí harías el fetch
    selectedDepartamento.value = ''
    selectedSitio.value = ''
    selectedDistrito.value = ''
  }

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

  const agregarRuta   = (zi)          => zonas.value[zi].rutas.push({ nombre: `RUTA ${zonas.value[zi].rutas.length + 1}`, ctos: zonas.value[zi].fechas.map(() => numCtosPorRuta.value) })
  const eliminarRuta  = (zi, ri)      => zonas.value[zi].rutas.splice(ri, 1)
  const eliminarDia   = (zi, fi)      => { const z = zonas.value[zi]; z.fechas.splice(fi,1); z.rutas.forEach(r => r.ctos.splice(fi,1)) }
  const eliminarZona  = (zi)          => zonas.value.splice(zi, 1)
  const recalcularZona = (_zi)        => {}

  // Totales
  const totalZona   = (z)      => z.rutas.reduce((acc, r) => acc + r.ctos.reduce((a,b)=>a+(+b||0),0), 0)
  const totalFila   = (z, ri)  => z.rutas[ri].ctos.reduce((a,b)=>a+(+b||0),0)
  const totalPorDia = (z, fi)  => z.rutas.reduce((a,r)=>a+(+r.ctos[fi]||0),0)

  // ====== Payload (lo que se envía al backend)
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
            provincia: z.departamento, // 👈 si quieres puedes duplicar o pedir el campo en UI
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
    // console.log('📦 Payload Zona:', JSON.stringify(payload, null, 2))
    console.log(payload)
    // aquí harías: await axios.post('/api/planificar', payload)
  }

  const procesarAsignacionTodo = async () => {
    if (!zonas.value.length) return
    const payload = construirPayload(zonas.value)
    // console.log('📦 Payload TODAS:', JSON.stringify(payload, null, 2))
    console.log(payload)
    // aquí harías: await axios.post('/api/planificar', payload)
  }

  return {
    // estado
    TIPOS, dateRange, tipoProgramacion, sitiosData,
    selectedDepartamento, selectedSitio, selectedDistrito,
    numRutas, numCtosPorRuta, zonas, loading,

    // computed
    departamentosDisponibles, sitiosDisponibles, distritosDisponibles,
    ctosDisponibles, fechasLista, totalSolicitadoVista, valido, puedeCrearZona,

    // acciones
    onTipoProgramacionChanged, crearZona, agregarRuta, eliminarRuta, eliminarDia, eliminarZona,
    totalZona, totalFila, totalPorDia, recalcularZona,
    procesarAsignacionZona, procesarAsignacionTodo,
  }
}
