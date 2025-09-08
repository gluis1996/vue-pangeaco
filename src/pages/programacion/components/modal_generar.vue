<template>
  <VDialog :model-value="isDialogVisible" max-width="1200" @update:model-value="val => emit('update:isDialogVisible', val)">
    <VCard class="pa-2 pa-sm-4">
      <DialogCloseBtn variant="text" size="default" @click="emit('update:isDialogVisible', false)" />

      <VCardText>
        <h3 class="text-h5 mb-4">Programar trabajos</h3>

        <VRow class="gap-y-4">
          <!-- Sidebar -->
          <VCol cols="12" md="4">
            <PlanificadorSidebar
              v-model:dateRange="dateRange"
              v-model:tipoProgramacion="tipoProgramacion"
              v-model:selectedDepartamento="selectedDepartamento"
              v-model:selectedSitio="selectedSitio"
              v-model:selectedDistrito="selectedDistrito"
              v-model:numRutas="numRutas"
              v-model:numCtosPorRuta="numCtosPorRuta"

              :TIPOS="TIPOS"
              :departamentosDisponibles="departamentosDisponibles"
              :sitiosDisponibles="sitiosDisponibles"
              :distritosDisponibles="distritosDisponibles"
              :ctosDisponibles="ctosDisponibles"
              :totalSolicitadoVista="totalSolicitadoVista"
              :valido="valido"
              :puedeCrearZona="puedeCrearZona"
              :onTipoChange="onTipoProgramacionChanged"
              @crear-zona="crearZona"
            />
          </VCol>

          <!-- Zonas -->
          <VCol cols="12" md="8">
            <VRow>
              <VCol cols="12" v-if="!zonas.length" class="text-medium-emphasis">
                Selecciona el rango de fechas, tipo, ubicación y crea la primera zona.
              </VCol>

              <VCol v-for="(z, zi) in zonas" :key="zi" cols="12">
                <ZonaCard
                  :zona="z"
                  @add-route="agregarRuta(zi)"
                  @remove-route="ri => eliminarRuta(zi, ri)"
                  @remove-day="fi => eliminarDia(zi, fi)"
                  @remove-zone="eliminarZona(zi)"
                  @process="procesarAsignacionZona(zi)"
                  @recalc="recalcularZona(zi)"
                />
              </VCol>

              <VCol cols="12" v-if="zonas.length">
                <div class="d-flex justify-end">
                  <VBtn color="primary" @click="handleProcesarTodo">Procesar TODAS las Zonas</VBtn>
                </div>
              </VCol>
            </VRow>
          </VCol>
        </VRow>
      </VCardText>

      <VCardActions>
        <VSpacer />
        <VBtn variant="text" @click="emit('update:isDialogVisible', false)">Cerrar</VBtn>
      </VCardActions>

      <VOverlay :model-value="loading" persistent>
        <VProgressCircular indeterminate size="48" />
        <div class="mt-4 text-center">
          <div class="text-subtitle-1">Procesando solicitud...</div>
          <div class="text-caption">Por favor espere</div>
        </div>
      </VOverlay>
    </VCard>
  </VDialog>
</template>

<script setup>
import { inject } from 'vue'    
import PlanificadorSidebar from './PlanificadorSidebar.vue'
import ZonaCard from './ZonaCard.vue'
// import { useProgramacion } from '../composables/useProgramacion'

// 👇 USA LA MISMA INSTANCIA PROVISTA POR index.vue
const programacion = inject('programacion')

const { isDialogVisible } = defineProps({ isDialogVisible: Boolean })
const emit = defineEmits(['update:isDialogVisible'])

const {
  // estado
  TIPOS, dateRange, tipoProgramacion,
  selectedDepartamento, selectedSitio, selectedDistrito,
  numRutas, numCtosPorRuta, zonas, loading,

  // computed
  departamentosDisponibles, sitiosDisponibles, distritosDisponibles,
  ctosDisponibles, totalSolicitadoVista, valido, puedeCrearZona,

  // acciones
  onTipoProgramacionChanged, crearZona, agregarRuta, eliminarRuta,
  eliminarDia, eliminarZona, recalcularZona, procesarAsignacionZona, procesarAsignacionTodo,
} = programacion


// 👇 handler para cerrar el modal cuando la API termina ok
const handleProcesarTodo = async () => {
  const ok = await procesarAsignacionTodo()
  if (ok) emit('update:isDialogVisible', false)
}

</script>
