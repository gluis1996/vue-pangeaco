<template>
  <VCard class="position-relative">
    <!-- Icono de Completado (100%) en la esquina -->
    <VIcon
      v-if="isCompleted"
      icon="ri-checkbox-circle-fill"
      color="success"
      class="position-absolute"
      style="top: 8px; right: 8px; font-size: 1.5rem;"
    />
    <VCardText>
      <!-- Cabecera que ocupa todo el ancho -->
      <div class="mb-3">
        <h6 
          class="text-h6 text-wrap"
          :class="{ 'text-success': isCompleted }"
        >
            <strong>{{ props.lista_seguimiento.principal }} * {{ props.lista_seguimiento.tramo }}</strong>
        </h6>
      </div>

      <!-- Contenedor para las dos columnas inferiores -->
      <div class="d-flex justify-space-between align-end">
        <!-- Columna Izquierda -->
        <div class="flex-grow-1">
          <div class="text-subtitle-1">
            {{ props.lista_seguimiento.eecc }} <br> {{ props.lista_seguimiento.ip_tramo || 'Sin IP asignada' }}
          </div>
          <h5 class="text-primary">
            Ult. Cambio: {{ ultimaActualizacionFormateada }} <br>
          </h5>
          <div class="text-body-1 mb-3">
            {{ (Number(props.lista_seguimiento.avance_total) * 100).toFixed(2) }}% avanzado
          </div>
          <!-- Botón Herramientas (Técnico y Admin) -->
          <VBtn 
            v-if="['administrador', 'tecnico'].includes(props.userRole)"
            size="small" 
            @click="enviar" 
            class="mt-2" 
            icon="ri-tools-line" :disabled="!(props.lista_seguimiento.total_trabajo > 0)">
          </VBtn>
          <!-- Botón Reporte (Agente y Admin) -->
          <VBtn 
            v-if="['administrador', 'agente'].includes(props.userRole)"
            size="small" 
            @click="enviar_licencia" 
            class="mt-2 ml-2" 
            icon="ri-file-list-3-line" :disabled="!(props.lista_seguimiento.cant_licencia > 0)">
          </VBtn>
          <!-- Botón Bloquear (Solo Admin) -->
          <VBtn 
            v-if="props.userRole === 'administrador'"
            size="small" 
            @click="enviar_candado" 
            class="mt-2 ml-2" 
            icon="ri-lock-line" :disabled="!(props.lista_seguimiento.cant_candado > 0)">
          </VBtn>
        </div>

        <!-- Columna Derecha -->
        <div class="text-right" style="min-width: 120px;">
          <div >
            <p class="text-caption mb-0">Licencia {{ (props.lista_seguimiento.pct_licencias_entregadas) }}%</p>
            <VProgressLinear
              :model-value="Number(props.lista_seguimiento.pct_licencias_entregadas) "
              color="secundary"
              height="8"
              rounded
            />
          </div>
          <div class="mt-2">
            <p class="text-caption mb-0">Tendido {{ (Number(props.lista_seguimiento.av_tendidos) * 100).toFixed(2) }}%</p>
            <VProgressLinear
              :model-value="Number(props.lista_seguimiento.av_tendidos) * 100"
              color="info"
              height="8"
              rounded
            />
          </div>
          <div class="mt-2">
            <p class="text-caption mb-0">Mufas {{ props.lista_seguimiento.pct_pasivos }}%</p>
            <VProgressLinear
              :model-value="Number(props.lista_seguimiento.pct_pasivos)"
              color="warning"
              height="8"
              rounded
            />
          </div>
          <div class="mt-2">
            <p class="text-caption mb-0">Pruebas {{ props.lista_seguimiento.pct_pruebas }}%</p>
            <VProgressLinear
              :model-value="Number(props.lista_seguimiento.pct_pruebas)"
              color="secondary"
              height="8"
              rounded
            />
          </div>
        </div>
      </div>
    </VCardText>
  </VCard>
</template>

<script setup>
import { computed } from 'vue';


const props = defineProps({
    lista_seguimiento: {type:Object, default: () => ({})},
    userRole: { type: String, default: 'agente' }
});

const emit = defineEmits(['cargar_detalle', 'cargar_licencia','cargar_candado']);

// Propiedad computada para determinar si el tramo está 100% completado en todas sus fases.
const isCompleted = computed(() => {
  const item = props.lista_seguimiento;
  return (
    Number(item.pct_licencias_entregadas) >= 100 &&
    Number(item.av_tendidos) >= 1 &&
    Number(item.pct_pasivos) >= 100 &&
    Number(item.pct_pruebas) >= 100
  );
});

const ultimaActualizacionFormateada = computed(() => {
  const tiempo = props.lista_seguimiento.ultima_actualizacion || '';
  const partes = tiempo.split(' ');
  if (partes.length >= 4) {
    return `${partes[0]} ${partes[1]} ${partes[2]} ${partes[3]}`;
  }
  return tiempo; // Devuelve el original si no tiene el formato esperado
});

const enviar = () => {
    emit('cargar_detalle', props.lista_seguimiento.id);
}

const enviar_licencia = () => {
    emit('cargar_licencia', props.lista_seguimiento);
}

const enviar_candado = () => {
    emit('cargar_candado', props.lista_seguimiento);
}
</script>

<style lang="scss">
.v-card .triangle-bg {
  position: absolute;
  inline-size: 10.375rem;
  inset-block-end: 0;
  inset-inline-end: 0;
}

.v-card .trophy {
  position: absolute;
  inline-size: 6.625rem;
  inset-block-end: 0;
  inset-inline-end: 1.25rem;
}
</style>
