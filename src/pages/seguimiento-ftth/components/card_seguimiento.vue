<template>
  <VCard class="position-relative">
    <VCardText>
      <div class="mb-3">
        <h6 class="text-h6 text-wrap">
            <strong>{{ props.lista_seguimiento.nodo }} - {{ props.lista_seguimiento.region }} - {{ props.lista_seguimiento.dpto }} - {{ props.lista_seguimiento.nodo_concentrador }}</strong>
        </h6>
        <div class="text-subtitle-1">
          {{ props.lista_seguimiento.eecc }} <br> {{ props.lista_seguimiento.ip }}
        </div>
      </div>
      <h5 class="text-primary">
        Asignado: {{ props.lista_seguimiento.fecha_asignacion }} <br>
        Ult. Cambio: {{ props.lista_seguimiento.ultima_actualizacion }} <br>
        Tiem. Transcurrido: {{ props.lista_seguimiento.tiempo_transcurrido }}
      </h5>
      <div class="text-body-1 mb-3">
        {{ (Number(props.lista_seguimiento.avance_total) * 100).toFixed(2) }}% avanzado
      </div>
      <VBtn size="small" @click="enviar">
        Ver detalle
      </VBtn>
    </VCardText>
  </VCard>
</template>

<script setup>
import { type } from '@/views/components/alert/demoCodeAlert';


const props = defineProps({
    lista_seguimiento: {type:Object, default: () => ({})}
});

const emit = defineEmits(['cargar_detalle']);


const enviar = () => {
    emit('cargar_detalle', props.lista_seguimiento.id);
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
