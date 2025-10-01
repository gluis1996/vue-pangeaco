import { ref, computed, onMounted } from 'vue'

export function useDashboard() {
  // --- Estado Reactivo ---
  const kpiData = ref({
    proyectosTotales: 0,
    proyectosCompletados: 0,
    tramosPendientes: 0,
    contratistasActivos: 0,
  })

  const proyectosData = ref([])
  const graficosData = ref({
    proyectosPorContratista: [],
    distribucionPorRegion: [],
  })
  const tramosData = ref([])

  // --- Lógica Computada ---

  // Lógica para la tarjeta de proyectos sin avance
  const proyectosSinAvance = computed(() => {
    const ahora = new Date()
    const hace24Horas = new Date(ahora.getTime() - (24 * 60 * 60 * 1000))

    const tramosPorProyecto = tramosData.value.reduce((acc, tramo) => {
      if (!acc[tramo.id_proyecto]) {
        acc[tramo.id_proyecto] = []
      }
      acc[tramo.id_proyecto].push(tramo)
      
      return acc
    }, {})

    const proyectosEstancados = []

    for (const idProyecto in tramosPorProyecto) {
      const tramos = tramosPorProyecto[idProyecto]
      
      const ultimaActualizacion = tramos.reduce((masReciente, tramo) => {
        const fechaTramo = new Date(tramo.update_at)
        
        return fechaTramo > masReciente ? fechaTramo : masReciente
      }, new Date(0))

      if (ultimaActualizacion < hace24Horas) {
        const proyectoInfo = proyectosData.value.find(p => p.id.toString() === idProyecto)
        if (proyectoInfo) {
          proyectosEstancados.push({
            id: proyectoInfo.id,
            nodo: proyectoInfo.nodo,
            ultima_actualizacion: ultimaActualizacion.toLocaleString('es-ES'),
          })
        }
      }
    }

    return proyectosEstancados
  })

  // --- Carga de Datos ---

  // Simula la carga de datos cuando el componente se monta
  onMounted(async () => {
    // En un caso real, aquí harías tus llamadas a la API
    // const kpis = await fetch('/api/dashboard/kpis').then(res => res.json())
    // ... etc

    // Para este ejemplo, usamos los datos fijos que generamos
    kpiData.value = {
      proyectosTotales: 2,
      proyectosCompletados: 0,
      tramosPendientes: 5,
      contratistasActivos: 2,
    }

    proyectosData.value = [
      {
        id: 1610,
        nodo: "ZAPALLAL",
        eecc: "COMFICA",
        prioridad: 2,
        avance: 40.0,
        tramos_total: 5,
        tramos_terminados: 2,
      },
      {
        id: 1618,
        nodo: "AREQUIPA ZAMACOLA",
        eecc: "DOMINION",
        prioridad: 1,
        avance: 33.3,
        tramos_total: 3,
        tramos_terminados: 1,
      },
    ]

    graficosData.value = {
      proyectosPorContratista: [
        { eecc: "COMFICA", proyectos_en_progreso: 1, proyectos_completados: 0 },
        { eecc: "DOMINION", proyectos_en_progreso: 1, proyectos_completados: 0 },
      ],
      distribucionPorRegion: [
        { region: "LIMA", total_proyectos: 1 },
        { region: "PROVINCIA", total_proyectos: 1 },
      ],
    }

    const fechaAntigua = new Date()
    fechaAntigua.setDate(fechaAntigua.getDate() - 2) // Hace 2 días

    tramosData.value = [
      { id: 51, id_proyecto: 1610, update_at: new Date().toISOString() },
      { id: 52, id_proyecto: 1610, update_at: new Date().toISOString() },
      { id: 72, id_proyecto: 1618, update_at: fechaAntigua.toISOString() },
      { id: 73, id_proyecto: 1618, update_at: fechaAntigua.toISOString() },
      { id: 74, id_proyecto: 1618, update_at: fechaAntigua.toISOString() },
    ]
  })

  // --- Retorno ---
  return {
    kpiData,
    proyectosData,
    graficosData,
    proyectosSinAvance,
  }
}